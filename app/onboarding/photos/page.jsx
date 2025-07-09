"use client";
import React, { useState, useEffect } from "react";
import { Button, Typography, Upload, message, Progress, Image } from "antd";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useFirebaseAuth";
import Iconify from "@/components/Iconify";
import LanguageSelector from "@/components/LanguageSelector";
import css from "@/styles/AuthPages.module.css";
import photoCss from "@/styles/PhotoUpload.module.css";
import layoutCss from "@/styles/onboardingLayout.module.css";
import { useLanguage } from "@/lib/i18n";
import { storage, db } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { createImageObject } from "@/utils/imageHelpers";
import { v4 as uuidv4 } from 'uuid';
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
const ENABLE_CROP = true;

const { Title, Text } = Typography;
const { Dragger } = Upload;

export default function PhotosPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [previewImages, setPreviewImages] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  // Crop functionality state
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState(null);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle logout and redirect to login
  const handleGoBackToLogin = async () => {
    try {
      const result = await signOut();
      if (result.success) {
        router.push('/sign-in');
      } else {
        console.error('Logout failed:', result.error);
        router.push('/sign-in');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      router.push('/sign-in');
    }
  };

  // Load existing images from Firestore on component mount
  useEffect(() => {
    const loadExistingImages = async () => {
      if (user) {
        // First try to load from localStorage (temporary images during onboarding)
        const tempPhotosData = localStorage.getItem(`onboarding_photos_${user.id}`);
        let hasTemporaryData = false;
        
        if (tempPhotosData) {
          try {
            const { uploadedImages: tempImages, mainImageIndex: tempMainIndex } = JSON.parse(tempPhotosData);
            if (tempImages && tempImages.length > 0) {
              setUploadedImages(tempImages);
              setMainImageIndex(tempMainIndex || 0);
              
              // Create previews for temp images (they should be File objects with URLs)
              const tempPreviews = tempImages.map((file, index) => {
                const previewUrl = file.url || (file.originFileObj ? URL.createObjectURL(file.originFileObj) : '');
                return previewUrl ? {
                  url: previewUrl,
                  uid: file.uid || `temp-${index}`,
                  file: file,
                  index: index
                } : null;
              }).filter(Boolean);
              setPreviewImages(tempPreviews);
              hasTemporaryData = true;
              
              console.log('Loaded temporary photos data from localStorage:', tempImages.length, 'images');
            }
          } catch (error) {
            console.error('Error parsing temporary photos data:', error);
          }
        }

        // Only load from Firestore if no temporary data exists
        if (!hasTemporaryData && user.images && user.images.length > 0) {
          try {
            // Clean up old preview URLs
            previewImages.forEach(preview => {
              if (preview.url && preview.url.startsWith('blob:')) {
                URL.revokeObjectURL(preview.url);
              }
            });

            // Create preview objects from existing Firestore images
            const existingPreviews = user.images.map((image, index) => ({
              url: image.fileUri,
              uid: `existing-${index}`,
              isExisting: true,
              fileName: image.fileName,
              isMain: image.isMain
            }));

            // Create file list objects for antd Upload component
            const existingFileList = user.images.map((image, index) => ({
              uid: `existing-${index}`,
              name: image.fileName,
              status: 'done',
              url: image.fileUri,
              isExisting: true
            }));

            setPreviewImages(existingPreviews);
            setUploadedImages(existingFileList);

            // Set main image index
            const mainIndex = user.images.findIndex(img => img.isMain);
            setMainImageIndex(mainIndex >= 0 ? mainIndex : 0);

            console.log('✅ Synced with Firestore images:', user.images.length);
          } catch (error) {
            console.error('Error loading existing images:', error);
          }
        } else if (!hasTemporaryData) {
          // Clean up if no data
          previewImages.forEach(preview => {
            if (preview.url && preview.url.startsWith('blob:')) {
              URL.revokeObjectURL(preview.url);
            }
          });
          setPreviewImages([]);
          setUploadedImages([]);
          setMainImageIndex(0);
        }
      }
    };

    if (user) {
      loadExistingImages();
    }
  }, [user]);

  // Auto-save photos to localStorage
  const saveToLocalStorage = () => {
    if (user && uploadedImages.length > 0) {
      const dataToSave = {
        uploadedImages: uploadedImages,
        mainImageIndex: mainImageIndex
      };
      localStorage.setItem(`onboarding_photos_${user.id}`, JSON.stringify(dataToSave));
      console.log('Auto-saved photos data to localStorage:', uploadedImages.length, 'images');
    }
  };

  // Auto-save whenever uploadedImages or mainImageIndex changes
  useEffect(() => {
    if (uploadedImages.length > 0) {
      saveToLocalStorage();
    }
  }, [uploadedImages, mainImageIndex]);

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      previewImages.forEach(preview => {
        if (preview.url) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [previewImages]);

  const addImageDirect = async (file) => {
    if (file.__handled) return;
    file.__handled = true;
    if (!file) return;
    if (uploadedImages.length >= 6) {
      message.warning(t('onboarding.maxPhotosReachedLabel'));
      return;
    }

    const hide = message.loading(t('onboarding.processingImage') || 'Processing image...', 0);

    let workingFile = file;
    let previewUrl;

    try {
      await canDecodeImage(workingFile, 2500);
      previewUrl = URL.createObjectURL(workingFile);
    } catch {
      try {
        workingFile = await tryRepairJpeg(file);
        await canDecodeImage(workingFile, 2500);
        previewUrl = URL.createObjectURL(workingFile);
        message.info(t('onboarding.imageAutoRepaired') || 'Image auto-repaired ✔️');
      } catch {
        try {
          const serverResult = await serverFixImage(file);
          previewUrl = serverResult.url;
          workingFile = { url: serverResult.url, fileName: serverResult.fileName };
          message.info(t('onboarding.imageFixedServer') || 'Image processed on server ✔️');
        } catch (errFinal) {
          console.error('❌ All repair steps failed:', errFinal);
          hide();
          message.error(t('imageCrop.imageNotAccepted') || 'This image cannot be accepted.');
          return;
        }
      }
    }

    if (ENABLE_CROP && previewUrl) {
      setCropImageUrl(previewUrl);
      setShowCropModal(true);
      return;
    }

    if (workingFile instanceof File) {
      file.originFileObj = workingFile;
      file.preview = previewUrl;
      hide();
      return;
    }

    const fileObject = {
      uid: `direct-${Date.now()}`,
      name: workingFile.name || workingFile.fileName || `image_${Date.now()}.jpg`,
      status: 'done',
      originFileObj: workingFile instanceof File ? workingFile : undefined,
      url: !(workingFile instanceof File) ? previewUrl : undefined,
      serverFileName: workingFile.fileName || undefined
    };
    setUploadedImages(prev=>[...prev,fileObject]);
    setPreviewImages(prev=>[...prev,{url:previewUrl,file:fileObject,uid:fileObject.uid}]);
    hide();
  };

  const SIMPLE_PICKER = true;

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: 'image/*',
    maxCount: 6,
    showUploadList: false, // Hide the default upload list
    beforeUpload: async (file) => {
      if (SIMPLE_PICKER) { addImageDirect(file); return false; }
      // Validate image file
      const validation = validateImageFile(file, 'profile');
      if (!validation.isValid) {
        message.error(validation.error);
        return false;
      }

      try {
        // Show loading message
        const loadingMessage = message.loading(t('onboarding.processingImage') || 'Processing image...', 0);
        
        // Standardize the image to ensure browser compatibility
        console.log('🔄 [OnboardingPhotos] Standardizing image for compatibility...');
        const standardizedResult = await standardizeImage(file, {
          maxWidthOrHeight: 2000,
          quality: 0.9
        });
        
        // Close loading message
        loadingMessage();
        
        console.log(`✅ [OnboardingPhotos] Image standardized successfully`);
        message.success(t('onboarding.imageStandardized') || 'Image processed successfully!');
        
        // Use the standardized file for cropping
        setCropImageUrl(standardizedResult.previewUrl);
        setShowCropModal(true);
        
        // Clean up the original preview URL if it exists
        if (standardizedResult.previewUrl) {
          setTimeout(() => {
            URL.revokeObjectURL(standardizedResult.previewUrl);
          }, 5000);
        }
        
      } catch (error) {
        console.error('❌ [OnboardingPhotos] Cannot process image:', error);
        message.error(t('imageCrop.imageNotAccepted') || 'Image processing failed. Please try a different image.');
        if (loadingMessage) loadingMessage();
      }
      
      return false; // Prevent automatic upload
    },
    onChange: (info) => {
      // DISABLED - we handle everything in addImageDirect  
      return;
    },
  };

  const handleUpload = async () => {
    if (uploadedImages.length === 0) {
      message.warning("Please select at least one photo");
      return;
    }

    setLoading(true);
    try {
      const imageObjects = [];
      
      for (let i = 0; i < uploadedImages.length; i++) {
        const file = uploadedImages[i];
        
        if (file.isExisting) {
          // Keep existing image, just update isMain status
          const existingImage = user.images.find(img => img.fileName === file.name);
          if (existingImage) {
            imageObjects.push({
              ...existingImage,
              isMain: i === mainImageIndex
            });
          }
        } else {
          if (file.originFileObj) {
            const fileName = uuidv4();
            const storageRef = ref(storage, `images/${fileName}`);
            const snapshot = await uploadBytes(storageRef, file.originFileObj);
            const downloadURL = await getDownloadURL(snapshot.ref);
            const imageObject = createImageObject(fileName, downloadURL, i === mainImageIndex);
            imageObjects.push(imageObject);
          } else if (file.url) {
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
            imageObjects.push(createImageObject(fileName, file.url, i === mainImageIndex));
          }
        }
      }

      // Update user document in Firestore
      await updateDoc(doc(db, 'Users', user.id), {
        images: imageObjects,
        updatedAt: serverTimestamp()
      });

      // Clear temporary localStorage data since we saved to Firestore
      localStorage.removeItem(`onboarding_photos_${user.id}`);

      message.success("Photos updated successfully! 🎉");
      router.push("/onboarding/profile");
    } catch (error) {
      console.error("Error uploading photos:", error);
      message.error("Failed to upload photos. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/onboarding");
  };

  const handleSetMainImage = (index) => {
    setMainImageIndex(index);
  };

  const handleRemoveImage = (indexToRemove) => {
    const newUploadedImages = uploadedImages.filter((_, index) => index !== indexToRemove);
    const newPreviewImages = previewImages.filter((_, index) => index !== indexToRemove);
    
    setUploadedImages(newUploadedImages);
    setPreviewImages(newPreviewImages);
    
    // Adjust main image index if necessary
    if (mainImageIndex >= newUploadedImages.length) {
      setMainImageIndex(Math.max(0, newUploadedImages.length - 1));
    } else if (mainImageIndex > indexToRemove) {
      setMainImageIndex(mainImageIndex - 1);
    }
  };

  // Remove old crop handlers
  // const handleCropComplete = (cropData) => { ... }; // REMOVED
  // const handleCropCancel = () => { ... }; // REMOVED

  return (
    <div className={layoutCss.singleColumnLayout}>
      {/* Go Back to Login Button */}
      <div style={{ 
        position: 'absolute', 
        top: '1rem', 
        left: '1rem', 
        zIndex: 10 
      }}>
        <Button
          type="text"
          onClick={handleGoBackToLogin}
          icon={<Iconify icon="eva:arrow-back-fill" width="16px" />}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#666',
            fontSize: '14px',
            fontWeight: '500',
            padding: '8px 12px',
            borderRadius: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <span style={{ 
            display: isMobile ? 'none' : 'inline' 
          }}>
            {t('onboarding.goBackToLogin')}
          </span>
        </Button>
      </div>

      {/* Language Selector */}
      <div style={{ 
        position: 'absolute', 
        top: '1rem', 
        right: '1rem', 
        zIndex: 10 
      }}>
        <LanguageSelector size="small" showIcon={false} />
      </div>

      {/* Header Section */}
      <div className={layoutCss.headerSection}>
        <Text strong style={{ fontSize: "14px", color: "#666", marginBottom: "8px", display: "block" }}>
          {t('onboarding.photosStep')}
        </Text>
        <Progress 
          percent={33} 
          strokeColor={{
            '0%': 'var(--primary)',
            '100%': 'var(--primary)',
          }}
          trailColor="#f0f0f0"
          style={{ marginBottom: "1rem" }}
        />
        
        <div className={css.authHeader}>
          <Title level={2} className={css.authTitle} style={{ margin: "0 0 0.5rem" }}>
            {t('onboarding.shareYourBestMoments')}
          </Title>
          <Text type="secondary" className={css.authSubtitle}>
            {t('onboarding.photosSubtitle')}
          </Text>
        </div>
      </div>

      {/* Content Section */}
      <div className={layoutCss.contentSection}>
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
                  {t('onboarding.clickOrDragFiles')}
                </Title>
                <Text type="secondary">
                  {t('onboarding.supportSingleBulk')}
                </Text>
              </div>
            </Dragger>
          </div>
        )}

        {/* Photos Preview Grid */}
        {previewImages.length > 0 && (
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between",
              marginBottom: "1rem" 
            }}>
              <Text strong style={{ fontSize: "16px", color: "#333" }}>
                {t('onboarding.yourPhotos', { count: previewImages.length })}
              </Text>
              <Text type="secondary" style={{ fontSize: "14px" }}>
                {uploadedImages.length >= 6 ? t('onboarding.maxPhotosReachedLabel') : t('onboarding.tapToSetMain')}
              </Text>
            </div>
            
            <div className={photoCss.photoGrid}>
              {previewImages.map((preview, index) => (
                <div 
                  key={preview.uid}
                  className={`${photoCss.photoItem} ${index === mainImageIndex ? photoCss.mainPhoto : ''}`}
                  onClick={() => handleSetMainImage(index)}
                >
                  <div className={photoCss.photoContainer}>
                    <Image
                      src={preview.url}
                      alt={`Preview ${index + 1}`}
                      className={photoCss.photoImage}
                      preview={false}
                    />
                    
                    {/* Main Photo Badge */}
                    {index === mainImageIndex && (
                      <div className={photoCss.mainBadge}>
                        <Iconify icon="eva:star-fill" width="10px" />
                        <span>{t('onboarding.main')}</span>
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
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length === 0) return;
                      
                      // Clear input immediately
                      e.target.value = '';
                      
                      // Check total count
                      if (uploadedImages.length + files.length > 6) {
                        message.warning(`You can only upload ${6 - uploadedImages.length} more photos`);
                        return;
                      }
                      
                      // Process one file at a time with crop
                      const file = files[0]; // Take only the first file for now

                      if (SIMPLE_PICKER) {
                        addImageDirect(file);
                        return;
                      }
                      
                      // Validate file
                      const validation = validateImageFile(file, 'profile');
                      if (!validation.isValid) {
                        message.error(validation.error);
                        return;
                      }
                      
                      try {
                        // Show loading message
                        const loadingMessage = message.loading(t('onboarding.processingImage') || 'Processing image...', 0);
                        
                        // Standardize the image to ensure browser compatibility
                        console.log('🔄 [OnboardingPhotos] Standardizing additional image for compatibility...');
                        const standardizedResult = await standardizeImage(file, {
                          maxWidthOrHeight: 2000,
                          quality: 0.9
                        });
                        
                        // Close loading message
                        loadingMessage();
                        
                        console.log(`✅ [OnboardingPhotos] Additional image standardized successfully`);
                        message.success(t('onboarding.imageStandardized') || 'Image processed successfully!');
                        
                        // Use the standardized file for cropping
                        setCropImageUrl(standardizedResult.previewUrl);
                        setShowCropModal(true);
                        
                        // Clean up the original preview URL if it exists
                        if (standardizedResult.previewUrl) {
                          setTimeout(() => {
                            URL.revokeObjectURL(standardizedResult.previewUrl);
                          }, 5000);
                        }
                        
                      } catch (error) {
                        console.error('❌ [OnboardingPhotos] Cannot process additional image:', error);
                        message.error(t('imageCrop.imageNotAccepted') || 'Image processing failed. Please try a different image.');
                        if (loadingMessage) loadingMessage();
                      }
                    }}
                  />
                  <div 
                    className={photoCss.addMoreContent}
                    onClick={() => document.getElementById('additionalPhotosInput').click()}
                  >
                    <Iconify icon="eva:plus-fill" width="20px" style={{ color: "var(--primary)" }} />
                    <Text style={{ color: "var(--primary)", fontSize: "11px", marginTop: "3px" }}>
                      {t('onboarding.addPhoto')}
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
                {t('onboarding.mainPhotoNote')}
              </Text>
            </div>
          </div>
        )}
      </div>

      {/* Footer Section */}
      <div className={layoutCss.footerSection}>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Button
            size="large"
            onClick={handleBack}
            style={{
              height: "48px",
              borderRadius: "12px",
              border: "1.5px solid #e8e8e8",
              fontWeight: "500"
            }}
            icon={<Iconify icon="eva:arrow-back-fill" width="20px" />}
          >
            {t('onboarding.backButton')}
          </Button>
          
          <Button
            type="primary"
            size="large"
            onClick={handleUpload}
            loading={loading}
            disabled={uploadedImages.length === 0}
            className={css.authButton}
            style={{ flex: 1 }}
          >
            {loading ? t('onboarding.uploading') : uploadedImages.length > 0 ? t('onboarding.continueWithPhotos', { count: uploadedImages.length, plural: uploadedImages.length > 1 ? 's' : '' }) : t('onboarding.addPhotosToContine')}
          </Button>
        </div>
      </div>

      {/* Profile Image Crop Modal */}
      <SimpleImageCrop
        visible={showCropModal}
        onCancel={() => {
          setShowCropModal(false);
          setCropImageUrl(null);
        }}
        onCropComplete={(cropResult) => {
          const fileObject = {
            uid: `cropped-${Date.now()}`,
            name: `cropped_${Date.now()}.jpg`,
            status: 'done',
            originFileObj: cropResult.file
          };
          
          setUploadedImages(prev => [...prev, fileObject]);
          setPreviewImages(prev => [...prev, { 
            url: cropResult.preview, 
            file: fileObject, 
            uid: fileObject.uid 
          }]);
          
          setShowCropModal(false);
          setCropImageUrl(null);
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
    </div>
  );
} 