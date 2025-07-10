"use client";
import React, { useState, useEffect } from "react";
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography, 
  Select, 
  Upload, 
  Image, 
  message, 
  Row, 
  Col, 
  Space,
  Divider,
  Alert,
  Spin,
  Progress,
  Modal
} from "antd";
import { useUser, useAuth } from "@/hooks/useFirebaseAuth";
import { useRouter } from "next/navigation";
import Iconify from "@/components/Iconify";
import { storage, db } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { createImageObject } from "@/utils/imageHelpers";
import { hasCompletedQuestionnaire, debugUserData } from '@/utils/onboardingHelpers';
import { v4 as uuidv4 } from 'uuid';
import css from "@/styles/ProfileEdit.module.css";
import photoCss from "@/styles/PhotoUpload.module.css";
import { useLanguage } from "@/lib/i18n";
import SimpleImageCrop from "@/components/ImageCrop/SimpleImageCrop";
import { validateImageFile, standardizeImage } from "@/utils/imageValidation";
import { canDecodeImage, tryRepairJpeg } from "@/utils/simpleImageRepair";

const serverFixImage = async (file) => {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/fix-image', { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Server processing failed');
  const data = await res.json();
  return { url: data.url, fileName: data.fileName };
};

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;

const ProfileEditSection = ({ userData, onUpdateSuccess, forceEdit = false, fromOnboardingRedirect = false }) => {
  const { user: currentUser, refreshUser, refreshUserData } = useAuth();

  // Calculate age from birth date
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    try {
      // Parse DD/MM/YYYY format
      const [day, month, year] = birthDate.split('/').map(num => parseInt(num));
      const birthDateObj = new Date(year, month - 1, day); // month is 0-indexed
      const today = new Date();
      
      let age = today.getFullYear() - birthDateObj.getFullYear();
      const monthDiff = today.getMonth() - birthDateObj.getMonth();
      
      // Adjust if birthday hasn't occurred this year yet
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      console.error("Error calculating age:", error);
      return null;
    }
  };
  const router = useRouter();
  const { t } = useLanguage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [mainImageId, setMainImageId] = useState(null); // Track main image by ID instead of index
  const [previewImages, setPreviewImages] = useState([]);
  const [gpsCoordinates, setGpsCoordinates] = useState(null);
  const [showGpsInfo, setShowGpsInfo] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  // State for enhanced main photo selection
  const [isSelectingMainPhoto, setIsSelectingMainPhoto] = useState(false);
  // Crop disabled

  // Check if this is the current user's profile
  const isCurrentUserProfile = currentUser?.id === userData?.data?.id;

  // Interest options from onboarding
  const interestOptions = [
    { name: "Travel", icon: "eva:compass-fill" },
    { name: "Photography", icon: "eva:camera-fill" },
    { name: "Music", icon: "eva:music-fill" },
    { name: "Sports", icon: "eva:activity-fill" },
    { name: "Art", icon: "eva:brush-fill" },
    { name: "Technology", icon: "eva:monitor-fill" },
    { name: "Food", icon: "eva:heart-fill" },
    { name: "Fashion", icon: "eva:shopping-bag-fill" },
    { name: "Books", icon: "eva:book-fill" },
    { name: "Movies", icon: "eva:film-fill" },
    { name: "Gaming", icon: "eva:play-circle-fill" },
    { name: "Fitness", icon: "eva:flash-fill" },
    { name: "Nature", icon: "eva:sun-fill" },
    { name: "Dancing", icon: "eva:radio-fill" },
    { name: "Cooking", icon: "eva:home-fill" },
    { name: "Languages", icon: "eva:message-circle-fill" },
    { name: "Science", icon: "eva:bulb-fill" },
    { name: "History", icon: "eva:archive-fill" }
  ];

  // Check if user has completed questionnaire using centralized function
  const checkQuestionnaireCompletion = () => {
    const user = userData?.data || currentUser;
    console.log("🔍 [ProfileEditSection] Checking questionnaire completion");
    
    // Use centralized function with consistent logic
    return hasCompletedQuestionnaire(user);
  };

  // Handle questionnaire restart
  const handleRestartQuestionnaire = () => {
    router.push('/onboarding/questionnaire');
  };

  // Load existing data from Firestore and localStorage
  useEffect(() => {
    if (userData || currentUser) {
      const user = userData?.data || currentUser;
      
      console.log("=== DEBUG: ProfileEditSection Data Loading ===");
      console.log("userData:", userData);
      console.log("currentUser:", currentUser);
      console.log("Combined user data:", user);
      console.log("user.bio:", user?.bio);
      console.log("user.location:", user?.location);
      console.log("user.website:", user?.website);
      console.log("user.relationshipStatus:", user?.relationshipStatus);
      console.log("user.interests:", user?.interests);
      console.log("user.images:", user?.images);
      
      // Debug questionnaire data specifically
      debugUserData(user, 'ProfileEditSection');
      
      // Extra debug for specific user
      if (user?.id === 'D0TBplLwTgUXPMYINyk6rOoitV52') {
        console.log('\n=== SPECIFIC USER DEBUG ===');
        console.log('Is this the problem user?', true);
        console.log('All properties:', Object.keys(user || {}));
        console.log('Raw userData.data:', userData?.data);
        console.log('=== END SPECIFIC DEBUG ===\n');
      }
      
      // Load GPS coordinates - prioritize Firestore, fallback to localStorage
      let coordinatesLoaded = false;
      
      // First try Firestore
      if (user?.gpsCoordinates && user.gpsCoordinates.latitude && user.gpsCoordinates.longitude) {
        setGpsCoordinates(user.gpsCoordinates);
        coordinatesLoaded = true;
      } else {
        // Fallback to localStorage
        try {
          const storedLocation = localStorage.getItem('userLocation');
          if (storedLocation) {
            const coordinates = JSON.parse(storedLocation);
            setGpsCoordinates(coordinates);
            coordinatesLoaded = true;
          }
        } catch (error) {
          console.error("Error loading GPS coordinates from localStorage:", error);
        }
      }
      
      // Show location dialog if no GPS coordinates found and user hasn't made a choice yet
      if (!coordinatesLoaded && typeof window !== 'undefined') {
        const locationChoice = localStorage.getItem('locationDetected');
        const hasFirestoreGPS = userData?.gpsCoordinates && 
          (userData.gpsCoordinates.latitude && userData.gpsCoordinates.longitude);
        
        console.log('Location Dialog Check:', {
          coordinatesLoaded,
          locationChoice,
          hasFirestoreGPS,
          hasGeolocation: !!navigator.geolocation,
          willShow: !locationChoice && !hasFirestoreGPS && navigator.geolocation
        });
        
        // Only show dialog if:
        // 1. User hasn't made any choice in localStorage (neither 'true' nor 'skipped')
        // 2. User doesn't have GPS coordinates in Firestore
        // 3. Geolocation is supported
        if (!locationChoice && !hasFirestoreGPS && navigator.geolocation) {
          console.log('Showing location dialog in 2 seconds...');
          // Show dialog after a short delay to allow UI to settle
          setTimeout(() => {
            setShowLocationDialog(true);
          }, 2000);
        }
      }
      
      console.log("=== END DEBUG ===");
      
      // Populate form fields with consistent fallbacks for compatibility
      form.setFieldsValue({
        first_name: user?.firstName || user?.first_name || '',
        last_name: user?.lastName || user?.last_name || '',
        username: user?.username || '',
        bio: user?.bio || '',
        location: user?.location || '',
        website: user?.website || '',
        relationshipStatus: user?.relationshipStatus || ''
      });

      // Set interests if they exist (exact property from onboarding)
      if (user?.interests && Array.isArray(user.interests)) {
        setSelectedInterests(user.interests);
        console.log("Loaded interests:", user.interests);
      }

      // Load existing images (same as onboarding)
      if (user?.images && user.images.length > 0) {
        // Clean up old preview URLs to prevent memory leaks
        previewImages.forEach(preview => {
          if (preview.url && preview.url.startsWith('blob:')) {
            URL.revokeObjectURL(preview.url);
          }
        });

        const existingPreviews = user.images.map((image, index) => ({
          url: image.fileUri,
          uid: `existing-${index}`,
          isExisting: true,
          fileName: image.fileName,
          isMain: image.isMain
        }));

        const existingFileList = user.images.map((image, index) => ({
          uid: `existing-${index}`,
          name: image.fileName,
          status: 'done',
          url: image.fileUri,
          isExisting: true,
          fileName: image.fileName // Add fileName for ID tracking
        }));

        setPreviewImages(existingPreviews);
        setUploadedImages(existingFileList);

        const mainIndex = user.images.findIndex(img => img.isMain);
        setMainImageIndex(mainIndex >= 0 ? mainIndex : 0);
        
        // Set main image ID using fileName for existing images, uid for new images
        const mainImage = existingFileList[mainIndex >= 0 ? mainIndex : 0];
        setMainImageId(mainImage?.fileName || mainImage?.uid);

        console.log("✅ Synced with Firestore images:", user.images.length);
      } else {
        // No images in Firestore - clear local previews
        previewImages.forEach(preview => {
          if (preview.url && preview.url.startsWith('blob:')) {
            URL.revokeObjectURL(preview.url);
          }
        });
        setPreviewImages([]);
        setUploadedImages([]);
        setMainImageIndex(0);
        setMainImageId(null);
        console.log("🧹 Cleared local previews - no Firestore images");
      }
    }
  }, [userData, currentUser, form]);

  const handleInterestToggle = (interestName) => {
    setSelectedInterests(prev => {
      if (prev.includes(interestName)) {
        return prev.filter(item => item !== interestName);
      } else {
        if (prev.length >= 8) {
          message.warning(t('profileEdit.maxInterestsWarning'));
          return prev;
        }
        return [...prev, interestName];
      }
    });
  };

  // ADD helper to append image directly with lightweight repair fallback
  const ENABLE_CROP = true;
  // crop state
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState(null);
  const [cropOriginalFile, setCropOriginalFile] = useState(null); // Store original file for cropping
  
  // Force all images through server processing for maximum compatibility
  const FORCE_SERVER_PROCESSING = true;

  const addImageDirect = async (file) => {
    if (file.__handled) return;
    file.__handled = true;
    if (!file) return;
    if (uploadedImages.length >= 6) {
      message.warning(t('profileEdit.maxPhotosReachedLabel'));
      return;
    }

    const hide = message.loading(t('profileEdit.processingImage') || 'Processing image...', 0);

    let workingFile = file;
    let previewUrl;
    let serverProcessedData = null;

    // If FORCE_SERVER_PROCESSING is enabled, skip local checks and go directly to server
    if (FORCE_SERVER_PROCESSING) {
      try {
        console.log('🔧 [ProfileEdit] Force processing through server for standardization...');
        const serverResult = await serverFixImage(file);
        serverProcessedData = serverResult;
        console.log('✅ [ProfileEdit] Image standardized on server:', serverResult.url);
        
        hide();
        
        const fileObject = {
          uid: `direct-${Date.now()}`,
          name: serverResult.fileName || `image_${Date.now()}.jpg`,
          status: 'done',
          url: serverResult.url,
          serverFileName: serverResult.fileName,
          serverProcessed: true
        };
        
        setUploadedImages(prev => {
          const newImages = [...prev, fileObject];
          // If this is the first image, make it main
          if (prev.length === 0) {
            setMainImageId(fileObject.uid);
            setMainImageIndex(0);
            console.log('🌟 [ProfileEdit] First image automatically set as main:', fileObject.uid);
          }
          return newImages;
        });
        setPreviewImages(prev => [...prev, {
          url: serverResult.url,
          file: fileObject,
          uid: fileObject.uid
        }]);
        
        message.success(t('profileEdit.imageStandardizedServer') || 'Image standardized successfully! ✨');
        return;
        
      } catch (serverError) {
        console.error('❌ [ProfileEdit] Server processing failed:', serverError);
        hide();
        message.error(t('imageCrop.imageNotAccepted') || 'This image cannot be processed. Please try a different image.');
        return;
      }
    }

    // Legacy fallback processing (when FORCE_SERVER_PROCESSING is false)
    try {
      await canDecodeImage(workingFile, 2500);
      previewUrl = URL.createObjectURL(workingFile);
    } catch {
      try {
        workingFile = await tryRepairJpeg(file);
        await canDecodeImage(workingFile, 2500);
        previewUrl = URL.createObjectURL(workingFile);
        message.info(t('profileEdit.imageAutoRepaired') || 'Image auto-repaired ✔️');
      } catch {
        try {
          const serverResult = await serverFixImage(file);
          serverProcessedData = serverResult;
          console.log('✅ [ProfileEdit] Server repaired image:', serverResult.url);
          message.info(t('profileEdit.imageFixedServer') || 'Image processed on server ✔️');
          
          hide();
          
          const fileObject = {
            uid: `direct-${Date.now()}`,
            name: serverResult.fileName || `image_${Date.now()}.jpg`,
            status: 'done',
            url: serverResult.url,
            serverFileName: serverResult.fileName,
            serverProcessed: true
          };
          
          setUploadedImages(prev => {
            const newImages = [...prev, fileObject];
            // If this is the first image, make it main
            if (prev.length === 0) {
              setMainImageId(fileObject.uid);
              setMainImageIndex(0);
              console.log('🌟 [ProfileEdit] First image automatically set as main:', fileObject.uid);
            }
            return newImages;
          });
          setPreviewImages(prev => [...prev, {
            url: serverResult.url,
            file: fileObject,
            uid: fileObject.uid
          }]);
          
          message.success(t('profileEdit.imageProcessedSuccessfully') || 'Image processed successfully! Cropping skipped for server-processed images.');
          return;
          
        } catch (errFinal) {
          console.error('❌ All repair steps failed:', errFinal);
          hide();
          message.error(t('imageCrop.imageNotAccepted') || 'This image cannot be accepted.');
          return;
        }
      }
    }

    hide();

    // Only enable cropping for images that were successfully decoded locally
    if (ENABLE_CROP && previewUrl && !serverProcessedData) {
      setCropImageUrl(previewUrl);
      setCropOriginalFile(workingFile);
      setShowCropModal(true);
      return;
    }

    // For non-cropped images, add them directly
    const fileObject = {
      uid: `direct-${Date.now()}`,
      name: workingFile.name || `image_${Date.now()}.jpg`,
      status: 'done',
      originFileObj: workingFile instanceof File ? workingFile : undefined,
      url: !(workingFile instanceof File) ? previewUrl : undefined
    };
    setUploadedImages(prev => {
      const newImages = [...prev, fileObject];
      // If this is the first image, make it main
      if (prev.length === 0) {
        setMainImageId(fileObject.uid);
        setMainImageIndex(0);
        console.log('🌟 [ProfileEdit] First image automatically set as main:', fileObject.uid);
      }
      return newImages;
    });
    setPreviewImages(prev => [...prev, {url: previewUrl, file: fileObject, uid: fileObject.uid}]);
  };

  // MODIFY uploadProps.beforeUpload to simple path if SIMPLE_PICKER flag
  const SIMPLE_PICKER = true;
  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: 'image/*',
    maxCount: 6,
    showUploadList: false,
    beforeUpload: async (file) => {
      if (SIMPLE_PICKER) {
        addImageDirect(file);
        return false; // stop auto upload
      }
      // Validate image
      const validation = validateImageFile(file, 'profile');
      if (!validation.isValid) {
        message.error(validation.error);
        return false;
      }

      try {
        // Show loading message
        const loadingMessage = message.loading(t('profileEdit.processingImage') || 'Processing image...', 0);
        
        // Standardize the image to ensure browser compatibility
        console.log('🔄 [ProfileEdit] Standardizing image for compatibility...');
        const standardizedResult = await standardizeImage(file, {
          maxWidthOrHeight: 2000,
          quality: 0.9
        });
        
        // Close loading message
        loadingMessage();
        
        console.log(`✅ [ProfileEdit] Image standardized successfully`);
        message.success(t('profileEdit.imageStandardized') || 'Image processed successfully!');
        
        // Use the standardized file for cropping
        // setFileForCrop(standardizedResult.file); // This line is removed
        // setCropFileIndex(uploadedImages.length); // This line is removed
        // setShowCropModal(true); // This line is removed
        
        // Clean up the original preview URL if it exists
        if (standardizedResult.previewUrl) {
          setTimeout(() => {
            URL.revokeObjectURL(standardizedResult.previewUrl);
          }, 5000);
        }
        
      } catch (error) {
        console.error('❌ [ProfileEdit] Cannot process image:', error);
        message.error(t('imageCrop.imageNotAccepted') || 'Image processing failed. Please try a different image.');
        if (loadingMessage) loadingMessage();
      }
      
      return false; // Prevent auto upload
    },
    onChange: (info) => {
      // DISABLED - we handle everything in addImageDirect
      return;
    },
  };

  const handleSetMainImage = (index) => {
    // If not in selection mode, just return - user must use the button first
    if (!isSelectingMainPhoto && uploadedImages.length > 1) {
      return;
    }
    
    const selectedImage = uploadedImages[index];
    const imageId = selectedImage?.fileName || selectedImage?.uid;
    
    // Reorder images: move selected image to first position
    const newUploadedImages = [...uploadedImages];
    const newPreviewImages = [...previewImages];
    
    // Move selected image to first position
    const selectedUploadedImage = newUploadedImages.splice(index, 1)[0];
    const selectedPreviewImage = newPreviewImages.splice(index, 1)[0];
    
    newUploadedImages.unshift(selectedUploadedImage);
    newPreviewImages.unshift(selectedPreviewImage);
    
    setUploadedImages(newUploadedImages);
    setPreviewImages(newPreviewImages);
    setMainImageIndex(0); // First image is now main
    setMainImageId(imageId);
    
    // Exit selection mode and show success message
    setIsSelectingMainPhoto(false);
    message.success(t('profileEdit.mainPhotoUpdated'));
    
    console.log('🔄 [ProfileEdit] Main image changed and reordered:', {
      newMainImageId: imageId,
      imageName: selectedImage?.name,
      newOrder: newUploadedImages.map(img => img.name || img.fileName)
    });
  };

  // Function to start main photo selection mode
  const handleStartSelectMainPhoto = () => {
    setIsSelectingMainPhoto(true);
    message.info(t('profileEdit.selectImageToSetMain'));
  };

  // Function to cancel main photo selection
  const handleCancelSelectMainPhoto = () => {
    setIsSelectingMainPhoto(false);
  };

  // Enhanced handle click on photo
  const handlePhotoClick = (index) => {
    if (isSelectingMainPhoto) {
      handleSetMainImage(index);
    } else if (uploadedImages.length === 1) {
      // For single image, allow normal click behavior (could show preview)
      return;
    }
    // For multiple images, do nothing unless in selection mode
  };

  const handleRemoveImage = (indexToRemove) => {
    const imageToRemove = uploadedImages[indexToRemove];
    const removedImageId = imageToRemove?.fileName || imageToRemove?.uid;
    
    const newUploadedImages = uploadedImages.filter((_, index) => index !== indexToRemove);
    const newPreviewImages = previewImages.filter((_, index) => index !== indexToRemove);
    
    setUploadedImages(newUploadedImages);
    setPreviewImages(newPreviewImages);
    
    // Update main image logic using ID instead of index
    if (mainImageId === removedImageId) {
      // The main image was removed, set first available image as main
      const newMainImage = newUploadedImages[0];
      const newMainImageId = newMainImage?.fileName || newMainImage?.uid;
      setMainImageId(newMainImageId);
      setMainImageIndex(0);
      console.log('🔄 [ProfileEdit] Main image was removed, new main:', newMainImageId);
    } else {
      // Find new index of the current main image
      const newMainIndex = newUploadedImages.findIndex(img => 
        (img.fileName || img.uid) === mainImageId
      );
      setMainImageIndex(newMainIndex >= 0 ? newMainIndex : 0);
    }
    
    console.log('🗑️ [ProfileEdit] Removed image:', {
      removedImageId,
      removedIndex: indexToRemove,
      newMainImageId: mainImageId,
      newLength: newUploadedImages.length
    });
  };

  const handleAdditionalPhotos = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const file = files[0];
    e.target.value = '';

    if (SIMPLE_PICKER) {
      addImageDirect(file);
      return;
    }

    // Check total count
    if (uploadedImages.length + files.length > 6) {
      message.warning(t('profileEdit.canUploadMorePhotos', { count: 6 - uploadedImages.length }));
      return;
    }
    
    // Process one file at a time with crop
    
    // Validate file
    const validation = validateImageFile(file, 'profile');
    if (!validation.isValid) {
      message.error(validation.error);
      return;
    }
    
    try {
      // Show loading message
      const loadingMessage = message.loading(t('profileEdit.processingImage') || 'Processing image...', 0);
      
      // Step 1: Standardize the image to ensure browser compatibility
      console.log('🔄 [ProfileEdit] Standardizing image for compatibility...');
      const standardizedResult = await standardizeImage(file, {
        maxWidthOrHeight: 2000,
        quality: 0.9
      });
      
      // Close loading message
      loadingMessage();
      
      console.log(`✅ [ProfileEdit] Image standardized successfully`);
      message.success(t('profileEdit.imageStandardized') || 'Image processed successfully!');
      
      // Step 2: Use the standardized file for cropping
      // setFileForCrop(standardizedResult.file); // This line is removed
      // setCropFileIndex(uploadedImages.length); // This line is removed
      // setShowCropModal(true); // This line is removed
      
      // Clean up the original preview URL if it exists
      if (standardizedResult.previewUrl) {
        setTimeout(() => {
          URL.revokeObjectURL(standardizedResult.previewUrl);
        }, 5000);
      }
      
    } catch (error) {
      console.error('❌ [ProfileEdit] Cannot process additional image:', error);
      message.error(t('imageCrop.imageNotAccepted') || 'Image processing failed. Please try a different image.');
      if (loadingMessage) loadingMessage();
    }
  };

  const handleAllowLocationInEdit = () => {
    console.log('Location allow requested in profile edit');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const coordinatesObj = { latitude, longitude };
          
          console.log('Location detected:', coordinatesObj);
          
          // Store coordinates in localStorage and mark as detected
          localStorage.setItem('userLocation', JSON.stringify(coordinatesObj));
          localStorage.setItem('locationDetected', 'true');
          setGpsCoordinates(coordinatesObj);
          setShowLocationDialog(false);
          
          // Save coordinates to Firestore immediately
          try {
            await updateDoc(doc(db, 'Users', currentUser.id), {
              gpsCoordinates: coordinatesObj,
              updatedAt: serverTimestamp()
            });
          } catch (firestoreError) {
            console.error("Error saving GPS coordinates to Firestore:", firestoreError);
            // Continue even if Firestore save fails
          }
          
          // Don't auto-fill coordinates - let user add their own city name
          message.success(t('profileEdit.locationDetectedSuccess'));
        } catch (error) {
          console.error("Error getting location:", error);
          message.error(t('profileEdit.couldNotGetLocationDetails'));
          setShowLocationDialog(false);
        }
      },
      (error) => {
        let errorMessage = t('profileEdit.couldNotGetLocation');
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = t('profileEdit.locationAccessDenied');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = t('profileEdit.locationUnavailable');
            break;
          case error.TIMEOUT:
            errorMessage = t('profileEdit.locationTimeout');
            break;
        }
        
        message.error(errorMessage);
        setShowLocationDialog(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleSkipLocationInEdit = () => {
    console.log('Location skipped in profile edit');
    localStorage.setItem('locationDetected', 'skipped');
    setShowLocationDialog(false);
  };

  // Crop functionality handlers
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      console.log('🚀 [ProfileEditSection] Starting profile update...');
      console.log('📝 Form values:', values);
      console.log('👤 Current user:', currentUser?.id);
      
      // If this is forced profile completion, validate that at least bio OR location is provided
      if (forceEdit) {
        const hasBio = values.bio && values.bio.trim() !== '';
        const hasLocation = values.location && values.location.trim() !== '';
        
        if (!hasBio && !hasLocation) {
          message.error('Please provide at least a bio or location to complete your profile.');
          setLoading(false);
          return;
        }
        console.log('✅ Profile completion validation passed');
      }
      
      let imageObjects = [];

      // Process images if any exist
      console.log('📸 Processing images... Count:', uploadedImages.length);
      if (uploadedImages.length > 0) {
        for (let i = 0; i < uploadedImages.length; i++) {
          const file = uploadedImages[i];
          const fileId = file.fileName || file.uid;
          const isMainImage = fileId === mainImageId;
          
          console.log('📸 [ProfileEdit] Processing image:', {
            index: i,
            fileId,
            mainImageId,
            isMainImage,
            fileName: file.name
          });
          
          if (file.isExisting) {
            // Keep existing image
            const existingImage = currentUser?.images?.find(img => img.fileName === file.name);
            if (existingImage) {
              imageObjects.push({
                ...existingImage,
                isMain: isMainImage
              });
            }
          } else {
            if (file.originFileObj) {
              // Upload new image normally
              const fileName = uuidv4();
              const storageRef = ref(storage, `images/${fileName}`);
              const snapshot = await uploadBytes(storageRef, file.originFileObj);
              const downloadURL = await getDownloadURL(snapshot.ref);
              const imageObject = createImageObject(fileName, downloadURL, isMainImage);
              imageObjects.push(imageObject);
            } else if (file.url) {
              // Use serverFileName if available, otherwise extract from URL
              let fileName = file.serverFileName;
              if (!fileName) {
                try {
                  const url = new URL(file.url);
                  const pathMatch = url.pathname.match(/\/o\/(.+?)(\?|$)/);
                  if (pathMatch) {
                    fileName = decodeURIComponent(pathMatch[1]);
                  } else {
                    fileName = `images/processed/${uuidv4()}.jpg`;
                  }
                } catch {
                  fileName = `images/processed/${uuidv4()}.jpg`;
                }
              }
              console.log('📁 Using fileName for server image:', fileName);
              imageObjects.push(createImageObject(fileName, file.url, isMainImage));
            }
          }
        }
      }

      // Update user document in Firestore
      const updateData = {
        // Use same field names as onboarding for consistency
        firstName: values.first_name,
        lastName: values.last_name,
        username: values.username,
        bio: values.bio || '',
        location: values.location || '',
        website: values.website || '',
        relationshipStatus: values.relationshipStatus || '',
        interests: selectedInterests,
        updatedAt: serverTimestamp()
      };

      // Add GPS coordinates if they exist
      if (gpsCoordinates) {
        updateData.gpsCoordinates = gpsCoordinates;
      }

      if (imageObjects.length > 0) {
        updateData.images = imageObjects;
      }

      console.log('💾 Update data to be saved:', updateData);
      console.log('📍 GPS coordinates:', gpsCoordinates);
      console.log('🏷️ Selected interests:', selectedInterests);

      await updateDoc(doc(db, 'Users', currentUser.id), updateData);

      console.log('✅ Profile updated successfully in Firestore');
      
      // Multiple strategies to ensure data refresh
      console.log('🔄 Refreshing user data in AuthContext...');
      
      // 1. Force refresh with cache clearing (this explicitly clears cache)
      await refreshUserData();
      
      // 2. Small delay to ensure data propagation in Firestore
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 3. Another refresh to be absolutely sure
      await refreshUserData();
      
      console.log('✅ User data refreshed with explicit cache clearing');
      
      message.success(t('profileEdit.profileUpdatedSuccess'));
      
      if (onUpdateSuccess) {
        console.log('🔄 Calling onUpdateSuccess callback...');
        onUpdateSuccess();
      }
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      message.error(t('profileEdit.failedToUpdateProfile', { error: error.message }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={css.container}>
      {forceEdit && (
        <Alert
          message={fromOnboardingRedirect ? "Welcome! Complete Your Profile" : t('profileEdit.completeProfileAlert')}
          description={fromOnboardingRedirect ? 
            "You've successfully completed the onboarding! To continue using the app, please add at least a bio or location. The website and relationship status are optional but help others connect with you better." : 
            "Please add at least a bio or location to complete your profile. Other fields are optional."
          }
          type={fromOnboardingRedirect ? "info" : "warning"}
          showIcon
          style={{ marginBottom: '1.5rem' }}
        />
      )}

      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className={css.form}
        >
          {/* Basic Information */}
          <Card title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Iconify icon="eva:person-fill" width="20px" />
              <span>{t('profileEdit.basicInformation')}</span>
            </div>
          } style={{ marginBottom: '1.5rem' }}>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="first_name"
                  label={t('profileEdit.firstName')}
                  rules={[{ required: true, message: t('profileEdit.pleaseEnterFirstName') }]}
                >
                  <Input placeholder={t('profileEdit.enterFirstName')} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="last_name"
                  label={t('profileEdit.lastName')}
                  rules={[{ required: true, message: t('profileEdit.pleaseEnterLastName') }]}
                >
                  <Input placeholder={t('profileEdit.enterLastName')} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="username"
              label={t('profileEdit.username')}
              rules={[
                { required: true, message: t('profileEdit.pleaseEnterUsername') },
                { min: 3, message: t('profileEdit.usernameMinLength') }
              ]}
            >
              <Input placeholder={t('profileEdit.enterUsername')} prefix="@" />
            </Form.Item>

            <Form.Item
              name="bio"
              label={
                <span>
                  {t('profileEdit.bio')}
                  {forceEdit && (
                    <span style={{ color: '#1890ff', fontSize: '12px', marginLeft: '8px' }}>
                      (Required: Bio OR Location)
                    </span>
                  )}
                </span>
              }
              rules={[{ max: 500, message: t('profileEdit.bioMaxLength') }]}
            >
              <TextArea
                placeholder={forceEdit ? "Tell others about yourself... (Required if no location)" : t('profileEdit.tellAboutYourself')}
                rows={4}
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Card>

          {/* Photos - Exact same as onboarding */}
          <Card title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Iconify icon="eva:camera-fill" width="20px" />
              <span>{t('profileEdit.yourPhotosCount', { count: uploadedImages.length })}</span>
            </div>
          } style={{ marginBottom: '1.5rem' }}>
            {/* Upload Area - Show only when no images uploaded yet */}
            {uploadedImages.length === 0 && (
              <div style={{ marginBottom: "2rem" }}>
                <Dragger {...uploadProps} style={{ 
                  borderRadius: "12px", 
                  border: "2px dashed #d9d9d9",
                  background: "#fafafa"
                }}>
                  <div style={{ padding: "2rem" }}>
                    <div style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      background: "var(--primary-low)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1rem"
                    }}>
                      <Iconify icon="eva:cloud-upload-fill" width="32px" style={{ color: "var(--primary)" }} />
                    </div>
                    <Title level={4} style={{ margin: "0 0 0.5rem", color: "#333" }}>
                      {t('profileEdit.clickOrDragUpload')}
                    </Title>
                    <Text type="secondary">
                      {t('profileEdit.uploadSupport')}
                    </Text>
                  </div>
                </Dragger>
              </div>
            )}

            {/* Photos Preview Grid - Exact same as onboarding */}
            {previewImages.length > 0 && (
              <div style={{ marginBottom: "2rem" }}>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  marginBottom: "1rem" 
                }}>
                  <Text strong style={{ fontSize: "16px", color: "#333" }}>
                    {t('profileEdit.yourPhotosCount', { count: previewImages.length })}
                  </Text>
                  
                  {/* Set Main Photo Button - Show only when there are more than 1 photo */}
                  {uploadedImages.length > 1 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {isSelectingMainPhoto ? (
                        <>
                          <Button 
                            size="small" 
                            onClick={handleCancelSelectMainPhoto}
                            style={{ borderRadius: "6px" }}
                          >
                            {t('profileEdit.cancelSelection')}
                          </Button>
                          <Text type="secondary" style={{ fontSize: "12px", color: "#1890ff" }}>
                            {t('profileEdit.setMainPhotoMode')}
                          </Text>
                        </>
                      ) : (
                        <Button 
                          type="primary" 
                          size="small" 
                          icon={<Iconify icon="eva:star-fill" width="14px" />}
                          onClick={handleStartSelectMainPhoto}
                          style={{ 
                            borderRadius: "6px",
                            background: "linear-gradient(135deg, #1890ff, #40a9ff)",
                            border: "none",
                            fontWeight: "500"
                          }}
                        >
                          {t('profileEdit.setMainPhoto')}
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {uploadedImages.length === 1 && (
                    <Text type="secondary" style={{ fontSize: "14px" }}>
                      {uploadedImages.length >= 6 ? t('profileEdit.maxPhotosReached') : t('profileEdit.tapToSetMain')}
                    </Text>
                  )}
                </div>
                
                <div className={photoCss.photoGrid}>
                  {previewImages.map((preview, index) => (
                    <div 
                      key={preview.uid}
                      className={`${photoCss.photoItem} ${index === mainImageIndex ? photoCss.mainPhoto : ''}`}
                      onClick={() => handlePhotoClick(index)}
                      style={{
                        cursor: isSelectingMainPhoto || uploadedImages.length === 1 ? 'pointer' : 'default',
                        transform: isSelectingMainPhoto && index !== mainImageIndex ? 'scale(0.95)' : 'scale(1)',
                        transition: 'all 0.2s ease',
                        opacity: isSelectingMainPhoto && index !== mainImageIndex ? 0.7 : 1,
                        boxShadow: isSelectingMainPhoto && index !== mainImageIndex 
                          ? '0 4px 12px rgba(24, 144, 255, 0.3)' 
                          : index === mainImageIndex 
                            ? '0 4px 16px rgba(24, 144, 255, 0.4)' 
                            : '0 2px 8px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <div className={photoCss.photoContainer}>
                        <Image
                          src={preview.url}
                          alt={`Preview ${index + 1}`}
                          className={photoCss.photoImage}
                          preview={false}
                          onLoad={() => console.log('✅ [ProfileEdit] Image loaded successfully:', preview.url)}
                          onError={(e) => {
                            console.error('❌ [ProfileEdit] Image failed to load:', preview.url, e);
                            console.log('🔍 [ProfileEdit] Preview object:', preview);
                          }}
                        />
                        
                        {/* Main Photo Badge */}
                        {index === mainImageIndex && !isSelectingMainPhoto && (
                          <div className={photoCss.mainBadge}>
                            <Iconify icon="eva:star-fill" width="10px" />
                            <span>Main</span>
                          </div>
                        )}
                        
                        {/* Selection Mode Overlay */}
                        {isSelectingMainPhoto && (
                          <div style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            left: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: index === mainImageIndex 
                              ? 'rgba(24, 144, 255, 0.9)'
                              : 'rgba(0, 0, 0, 0.6)',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            zIndex: 2
                          }}>
                            {index === mainImageIndex ? (
                              <Text style={{ color: 'white', fontSize: '10px', fontWeight: '600' }}>
                                Current Main
                              </Text>
                            ) : (
                              <Text style={{ color: 'white', fontSize: '10px', fontWeight: '600' }}>
                                Tap to Set Main
                              </Text>
                            )}
                          </div>
                        )}
                        
                        {/* Remove Button */}
                        <button
                          className={photoCss.removeButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(index);
                          }}
                        >
                          <Iconify icon="eva:close-fill" width="16px" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add More Button */}
                  {uploadedImages.length < 6 && (
                    <div className={photoCss.addMoreButton}>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        id="additionalPhotosInput"
                        onChange={handleAdditionalPhotos}
                      />
                      <div 
                        className={photoCss.addMoreContent}
                        onClick={() => document.getElementById('additionalPhotosInput').click()}
                      >
                        <Iconify icon="eva:plus-fill" width="20px" style={{ color: "var(--primary)" }} />
                        <Text style={{ color: "var(--primary)", fontSize: "11px", marginTop: "3px" }}>
                          {t('profileEdit.addPhoto')}
                        </Text>
                      </div>
                    </div>
                  )}
                </div>
                
                <div style={{ 
                  background: "#f0f7ff", 
                  padding: "0.75rem 1rem", 
                  borderRadius: "8px", 
                  marginTop: "1rem",
                  border: "1px solid #d6e4ff"
                }}>
                  <Text style={{ color: "#1890ff", fontSize: "13px" }}>
                    <Iconify icon="eva:star-fill" width="13px" style={{ marginRight: "4px" }} />
                    {t('profileEdit.mainPhotoWillBeShown')}
                  </Text>
                </div>
              </div>
            )}
          </Card>

          {/* Additional Information */}
          <Card title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Iconify icon="eva:info-fill" width="20px" />
              <span>{t('profileEdit.additionalInformation')}</span>
            </div>
          } style={{ marginBottom: '1.5rem' }}>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item 
                  name="location" 
                  label={
                    <span>
                      {t('profileEdit.location')}
                      {forceEdit && (
                        <span style={{ color: '#1890ff', fontSize: '12px', marginLeft: '8px' }}>
                          (Required: Bio OR Location)
                        </span>
                      )}
                    </span>
                  }
                >
                  <Input 
                    placeholder={forceEdit ? "Your city, country... (Required if no bio)" : t('profileEdit.cityCountry')} 
                    prefix={<Iconify icon="eva:pin-fill" width="16px" />}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item 
                  name="website" 
                  label={t('profileEdit.website')}
                  rules={[{ type: "url", message: t('profileEdit.validUrlRequired') }]}
                >
                  <Input 
                    placeholder={t('profileEdit.yourWebsiteUrl')} 
                    prefix={<Iconify icon="eva:link-fill" width="16px" />}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="relationshipStatus" label={t('profileEdit.relationshipStatus')}>
              <Select placeholder={t('profileEdit.selectRelationshipStatus')}>
                <Option value="single">{t('profileEdit.single')}</Option>
                <Option value="in_relationship">{t('profileEdit.inRelationship')}</Option>
                <Option value="married">{t('profileEdit.married')}</Option>
                <Option value="its_complicated">{t('profileEdit.itsComplicated')}</Option>
                <Option value="prefer_not_to_say">{t('profileEdit.preferNotToSay')}</Option>
              </Select>
            </Form.Item>
          </Card>

          {/* Interests - Same as onboarding */}
          <Card title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Iconify icon="eva:heart-fill" width="20px" />
              <span>{t('profileEdit.interests')} ({selectedInterests.length}/8)</span>
            </div>
          } style={{ marginBottom: '1.5rem' }}>
            <div className={css.interestsGrid}>
              {interestOptions.map(interest => (
                <div
                  key={interest.name}
                  className={`${css.interestCard} ${
                    selectedInterests.includes(interest.name) ? css.selected : ''
                  }`}
                  onClick={() => handleInterestToggle(interest.name)}
                >
                  <Iconify 
                    icon={interest.icon} 
                    width="20px" 
                    color={selectedInterests.includes(interest.name) ? 'white' : '#1890ff'} 
                  />
                  <span>{interest.name}</span>
                  {selectedInterests.includes(interest.name) && (
                    <div className={css.selectedIndicator}>
                      <Iconify icon="eva:checkmark-fill" width="12px" color="white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <Text 
              type="secondary" 
              style={{ 
                fontSize: '12px',
                color: selectedInterests.length >= 8 ? '#ff4d4f' : undefined 
              }}
            >
              {t('profileEdit.selectUpToInterests')}
            </Text>
          </Card>

       

          {/* Submit Button */}
          <div style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '2rem' }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large"
              loading={loading}
              style={{ minWidth: '200px' }}
            >
              {forceEdit ? t('profileEdit.completeProfile') : t('profileEdit.saveChanges')}
            </Button>
          </div>

             {/* Questionnaire Section - Show for all current users for testing */}
             {(checkQuestionnaireCompletion() || isCurrentUserProfile) && (
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Iconify icon="eva:star-fill" width="20px" />
                  <span>{t('profileEdit.astrologicalProfile')}</span>
                </div>
              }
              style={{ marginBottom: '1.5rem' }}
            >
              {/* Show current answers if questionnaire is completed */}
              {checkQuestionnaireCompletion() && (userData?.data?.questionnaire || currentUser?.questionnaire) && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <Text strong style={{ fontSize: '16px', color: '#722ed1' }}>
                      {t('profileEdit.currentAnswers')}
                    </Text>
                  </div>
                  
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                      <div style={{ 
                        padding: '1rem', 
                        background: '#f0f7ff', 
                        borderRadius: '8px',
                        border: '1px solid #d6e4ff',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '24px', marginBottom: '0.5rem' }}>
                          {(userData?.data?.questionnaire?.zodiacSign || currentUser?.questionnaire?.zodiacSign) === 'Berbec' && '♈'}
                          {(userData?.data?.questionnaire?.zodiacSign || currentUser?.questionnaire?.zodiacSign) === 'Taur' && '♉'}
                          {(userData?.data?.questionnaire?.zodiacSign || currentUser?.questionnaire?.zodiacSign) === 'Gemeni' && '♊'}
                          {(userData?.data?.questionnaire?.zodiacSign || currentUser?.questionnaire?.zodiacSign) === 'Rac' && '♋'}
                          {(userData?.data?.questionnaire?.zodiacSign || currentUser?.questionnaire?.zodiacSign) === 'Leu' && '♌'}
                          {(userData?.data?.questionnaire?.zodiacSign || currentUser?.questionnaire?.zodiacSign) === 'Fecioară' && '♍'}
                          {(userData?.data?.questionnaire?.zodiacSign || currentUser?.questionnaire?.zodiacSign) === 'Balanță' && '♎'}
                          {(userData?.data?.questionnaire?.zodiacSign || currentUser?.questionnaire?.zodiacSign) === 'Scorpion' && '♏'}
                          {(userData?.data?.questionnaire?.zodiacSign || currentUser?.questionnaire?.zodiacSign) === 'Săgetător' && '♐'}
                          {(userData?.data?.questionnaire?.zodiacSign || currentUser?.questionnaire?.zodiacSign) === 'Capricorn' && '♑'}
                          {(userData?.data?.questionnaire?.zodiacSign || currentUser?.questionnaire?.zodiacSign) === 'Vărsător' && '♒'}
                          {(userData?.data?.questionnaire?.zodiacSign || currentUser?.questionnaire?.zodiacSign) === 'Pești' && '♓'}
                        </div>
                        <Text strong style={{ color: '#722ed1' }}>
                          {t('profileEdit.zodiacSign')}
                        </Text>
                        <div style={{ marginTop: '0.25rem' }}>
                          <Text>{userData?.data?.questionnaire?.zodiacSign || currentUser?.questionnaire?.zodiacSign || 'N/A'}</Text>
                        </div>
                      </div>
                    </Col>
                    
                    <Col xs={24} sm={8}>
                      <div style={{ 
                        padding: '1rem', 
                        background: '#fff7e6', 
                        borderRadius: '8px',
                        border: '1px solid #ffd591',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '24px', marginBottom: '0.5rem' }}>
                          🎂
                        </div>
                        <Text strong style={{ color: '#fa8c16' }}>
                          {t('profileEdit.birthDate')}
                        </Text>
                        <div style={{ marginTop: '0.25rem' }}>
                          <Text>{userData?.data?.questionnaire?.birthDate || currentUser?.questionnaire?.birthDate || 'N/A'}</Text>
                        </div>
                        {/* Display calculated age */}
                        {(userData?.data?.questionnaire?.birthDate || currentUser?.questionnaire?.birthDate || userData?.data?.age || currentUser?.age) && (
                          <div style={{ marginTop: '0.5rem', padding: '0.25rem 0.5rem', background: 'rgba(250, 140, 22, 0.1)', borderRadius: '4px' }}>
                                                         <Text style={{ color: '#fa8c16', fontSize: '12px', fontWeight: '500' }}>
                               {t('profileEdit.age')}: {userData?.data?.age || currentUser?.age || calculateAge(userData?.data?.questionnaire?.birthDate || currentUser?.questionnaire?.birthDate) || 'N/A'} years
                             </Text>
                          </div>
                        )}
                      </div>
                    </Col>
                    
                    <Col xs={24} sm={8}>
                      <div style={{ 
                        padding: '1rem', 
                        background: '#f6ffed', 
                        borderRadius: '8px',
                        border: '1px solid #b7eb8f',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '24px', marginBottom: '0.5rem' }}>
                          💕
                        </div>
                        <Text strong style={{ color: '#52c41a' }}>
                          {t('profileEdit.relationshipType')}
                        </Text>
                        <div style={{ marginTop: '0.25rem' }}>
                          <Text>{userData?.data?.questionnaire?.relationshipType || currentUser?.questionnaire?.relationshipType || 'N/A'}</Text>
                        </div>
                      </div>
                    </Col>
                  </Row>
                  
                  <Divider />
                </div>
              )}
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    {checkQuestionnaireCompletion() 
                      ? t('profileEdit.wantToUpdate')
                      : t('profileEdit.completeAstrological')
                    }
                  </Text>
                </div>
                
                <Button 
                  type="primary" 
                  size="large"
                  icon={<Iconify icon="eva:refresh-fill" width="16px" />}
                  onClick={handleRestartQuestionnaire}
                  style={{ 
                    background: 'linear-gradient(135deg, #722ed1, #9254de)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '500'
                  }}
                >
                  {checkQuestionnaireCompletion() ? t('profileEdit.retakeQuestionnaire') : t('profileEdit.startQuestionnaire')}
                </Button>
                
                <div style={{ marginTop: '0.5rem' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {t('profileEdit.updateCompatibilityMatches')}
                  </Text>
                </div>
              </div>
            </Card>
          )}
        </Form>

        {/* Profile Image Crop Modal */}
        <SimpleImageCrop
          visible={showCropModal}
          onCancel={() => {
            setShowCropModal(false);
            setCropImageUrl(null);
            setCropOriginalFile(null); // Clear original file on cancel
          }}
          onCropComplete={(cropResult) => {
            console.log('🎭 [ProfileEdit] Crop completed, result:', {
              previewUrl: cropResult.preview,
              fileSize: cropResult.file.size,
              fileName: cropResult.file.name
            });
            
            const fileObject = {
              uid: `cropped-${Date.now()}`,
              name: `cropped_${Date.now()}.jpg`,
              status: 'done',
              originFileObj: cropResult.file
            };
            
            const previewObject = { 
              url: cropResult.preview, 
              file: fileObject, 
              uid: fileObject.uid 
            };
            
            console.log('📸 [ProfileEdit] Adding to preview images:', previewObject);
            
            setUploadedImages(prev => {
              const newImages = [...prev, fileObject];
              // If this is the first image, make it main
              if (prev.length === 0) {
                setMainImageId(fileObject.uid);
                setMainImageIndex(0);
                console.log('🌟 [ProfileEdit] First cropped image automatically set as main:', fileObject.uid);
              }
              return newImages;
            });
            setPreviewImages(prev => [...prev, previewObject]);
            
            setShowCropModal(false);
            setCropImageUrl(null);
            setCropOriginalFile(null);
            message.success(t('imageCrop.cropSuccessful') || 'Image cropped successfully!');
          }}
          imageUrl={cropImageUrl}
          title={t('imageCrop.cropProfileImage') || 'Crop Profile Image'}
          aspectRatios={[
            { label: 'Square', value: 1, icon: 'eva:square-fill' },
            { label: 'Portrait', value: 4/5, icon: 'eva:smartphone-fill' }
          ]}
          defaultAspectRatio={1}
        />

        {/* Location Permission Dialog */}
        <Modal
          title={null}
          open={showLocationDialog}
          footer={null}
          closable={false}
          centered
          width={400}
          styles={{
          body: { padding: "2rem", textAlign: "center" }
        }}
        >
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1890ff, #40a9ff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem"
            }}>
              <Iconify icon="eva:navigation-2-fill" width="40px" color="white" />
            </div>
            
            <Title level={3} style={{ margin: "0 0 0.5rem" }}>
              {t('profileEdit.enableLocationAccess')}
            </Title>
            
            <Text type="secondary" style={{ fontSize: "15px", lineHeight: "1.5" }}>
              {t('profileEdit.locationPermissionDesc')}
            </Text>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <Button
              size="large"
              onClick={handleSkipLocationInEdit}
              style={{
                borderRadius: "8px",
                fontWeight: "500",
                minWidth: "100px"
              }}
            >
              {t('profileEdit.skip')}
            </Button>
            
            <Button
              type="primary"
              size="large"
              onClick={handleAllowLocationInEdit}
              style={{
                borderRadius: "8px",
                fontWeight: "500",
                minWidth: "120px"
              }}
              icon={<Iconify icon="eva:checkmark-fill" width="16px" />}
            >
              {t('profileEdit.allowLocation')}
            </Button>
          </div>

          <Text type="secondary" style={{ fontSize: "12px", marginTop: "1rem", display: "block" }}>
            <Iconify icon="eva:shield-fill" width="14px" style={{ marginRight: "4px" }} />
            {t('profileEdit.privacyImportant')}
          </Text>
        </Modal>
      </Spin>
    </div>
  );
};

export default ProfileEditSection; 