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

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;

const ProfileEditSection = ({ userData, onUpdateSuccess, forceEdit = false }) => {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [previewImages, setPreviewImages] = useState([]);
  const [gpsCoordinates, setGpsCoordinates] = useState(null);
  const [showGpsInfo, setShowGpsInfo] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);

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
      
      // Populate form fields with all possible data sources
      // Using exact property names as saved in onboarding and sign-up
      form.setFieldsValue({
        first_name: user?.first_name || user?.firstName || '',
        last_name: user?.last_name || user?.lastName || '',
        username: user?.username || '',
        bio: user?.bio || '', // Exact property from onboarding
        location: user?.location || '', // Exact property from onboarding
        website: user?.website || '', // Exact property from onboarding
        relationshipStatus: user?.relationshipStatus || '' // Exact property from onboarding
      });

      // Set interests if they exist (exact property from onboarding)
      if (user?.interests && Array.isArray(user.interests)) {
        setSelectedInterests(user.interests);
        console.log("Loaded interests:", user.interests);
      }

      // Load existing images (same as onboarding)
      if (user?.images && user.images.length > 0) {
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
          isExisting: true
        }));

        setPreviewImages(existingPreviews);
        setUploadedImages(existingFileList);

        const mainIndex = user.images.findIndex(img => img.isMain);
        setMainImageIndex(mainIndex >= 0 ? mainIndex : 0);

        console.log("Loaded existing images:", user.images.length);
      }
    }
  }, [userData, currentUser, form]);

  const handleInterestToggle = (interestName) => {
    setSelectedInterests(prev => {
      if (prev.includes(interestName)) {
        return prev.filter(item => item !== interestName);
      } else {
        if (prev.length >= 8) {
          message.warning("You can select maximum 8 interests");
          return prev;
        }
        return [...prev, interestName];
      }
    });
  };

  const uploadProps = {
    name: 'file',
    multiple: true,
    accept: 'image/*',
    maxCount: 6,
    showUploadList: false,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Image must be smaller than 5MB!');
        return false;
      }
      return false;
    },
    onChange: (info) => {
      setUploadedImages(info.fileList);
      
      const previews = info.fileList.map((file, index) => {
        if (file.originFileObj) {
          const url = URL.createObjectURL(file.originFileObj);
          return { url, file, index, uid: file.uid };
        }
        return null;
      }).filter(Boolean);
      
      setPreviewImages(previews);
      
      if (mainImageIndex >= info.fileList.length) {
        setMainImageIndex(0);
      }
    },
  };

  const handleSetMainImage = (index) => {
    setMainImageIndex(index);
  };

  const handleRemoveImage = (indexToRemove) => {
    const newUploadedImages = uploadedImages.filter((_, index) => index !== indexToRemove);
    const newPreviewImages = previewImages.filter((_, index) => index !== indexToRemove);
    
    setUploadedImages(newUploadedImages);
    setPreviewImages(newPreviewImages);
    
    if (mainImageIndex >= newUploadedImages.length) {
      setMainImageIndex(Math.max(0, newUploadedImages.length - 1));
    } else if (mainImageIndex > indexToRemove) {
      setMainImageIndex(mainImageIndex - 1);
    }
  };

  const handleAdditionalPhotos = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    // Check total count
    if (uploadedImages.length + files.length > 6) {
      message.warning(`You can only upload ${6 - uploadedImages.length} more photos`);
      return;
    }
    
    // Validate each file
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isLt5M = file.size / 1024 / 1024 < 5;
      
      if (!isImage) {
        message.error(`${file.name} is not an image file`);
        return false;
      }
      if (!isLt5M) {
        message.error(`${file.name} is larger than 5MB`);
        return false;
      }
      return true;
    });
    
    if (validFiles.length === 0) return;
    
    // Create file objects for antd Upload
    const newFileList = validFiles.map((file, index) => ({
      uid: `${Date.now()}-${index}`,
      name: file.name,
      status: 'done',
      originFileObj: file,
    }));
    
    // Add to existing files
    const updatedFileList = [...uploadedImages, ...newFileList];
    setUploadedImages(updatedFileList);
    
    // Create previews for new files
    const newPreviews = newFileList.map((file) => ({
      url: URL.createObjectURL(file.originFileObj),
      file,
      uid: file.uid
    }));
    
    setPreviewImages([...previewImages, ...newPreviews]);
    
    // Clear input
    e.target.value = '';
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
          message.success("Location detected! 📍 You can now add your city name manually.");
        } catch (error) {
          console.error("Error getting location:", error);
          message.error("Could not get location details");
          setShowLocationDialog(false);
        }
      },
      (error) => {
        let errorMessage = "Could not get your location";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
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

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      console.log('🚀 [ProfileEditSection] Starting profile update...');
      console.log('📝 Form values:', values);
      console.log('👤 Current user:', currentUser?.id);
      
      let imageObjects = [];

      // Process images if any exist
      console.log('📸 Processing images... Count:', uploadedImages.length);
      if (uploadedImages.length > 0) {
        for (let i = 0; i < uploadedImages.length; i++) {
          const file = uploadedImages[i];
          
          if (file.isExisting) {
            // Keep existing image
            const existingImage = currentUser?.images?.find(img => img.fileName === file.name);
            if (existingImage) {
              imageObjects.push({
                ...existingImage,
                isMain: i === mainImageIndex
              });
            }
          } else {
            // Upload new image
            console.log('📤 Uploading new image...');
            const fileName = uuidv4();
            const storageRef = ref(storage, `images/${fileName}`);
            
            const snapshot = await uploadBytes(storageRef, file.originFileObj);
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            const imageObject = createImageObject(fileName, downloadURL, i === mainImageIndex);
            imageObjects.push(imageObject);
          }
        }
      }

      // Update user document in Firestore
      const updateData = {
        firstName: values.first_name,
        lastName: values.last_name,
        first_name: values.first_name, // Keep legacy field
        last_name: values.last_name, // Keep legacy field
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
      message.success("Profile updated successfully! 🎉");
      
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
      message.error(`Failed to update profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={css.container}>
      {forceEdit && (
        <Alert
          message="Complete Your Profile"
          description="Your profile seems to be missing some information. Please fill in the details below to enhance your experience."
          type="warning"
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
              <span>Basic Information</span>
            </div>
          } style={{ marginBottom: '1.5rem' }}>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="first_name"
                  label="First Name"
                  rules={[{ required: true, message: 'Please enter your first name' }]}
                >
                  <Input placeholder="Enter your first name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="last_name"
                  label="Last Name"
                  rules={[{ required: true, message: 'Please enter your last name' }]}
                >
                  <Input placeholder="Enter your last name" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="username"
              label="Username"
              rules={[
                { required: true, message: 'Please enter a username' },
                { min: 3, message: 'Username must be at least 3 characters' }
              ]}
            >
              <Input placeholder="Enter your username" prefix="@" />
            </Form.Item>

            <Form.Item
              name="bio"
              label="Bio"
              rules={[{ max: 500, message: 'Bio must be less than 500 characters' }]}
            >
              <TextArea
                placeholder="Tell people about yourself..."
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
              <span>Your Photos ({uploadedImages.length}/6)</span>
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
                      Click or drag files to upload
                    </Title>
                    <Text type="secondary">
                      Support for single or bulk upload. PNG, JPG up to 5MB each
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
                    Your Photos ({previewImages.length}/6)
                  </Text>
                  <Text type="secondary" style={{ fontSize: "14px" }}>
                    {uploadedImages.length >= 6 ? "Maximum photos reached" : "Tap to set as main photo"}
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
                            <span>Main</span>
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
                        multiple
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
                          Add Photo
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
                    <strong>Main photo</strong> will be shown in your profile and suggestions. Tap any photo to make it main.
                  </Text>
                </div>
              </div>
            )}
          </Card>

          {/* Additional Information */}
          <Card title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Iconify icon="eva:info-fill" width="20px" />
              <span>Additional Information</span>
            </div>
          } style={{ marginBottom: '1.5rem' }}>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item name="location" label="Location">
                  <Input 
                    placeholder="City, Country" 
                    prefix={<Iconify icon="eva:pin-fill" width="16px" />}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item 
                  name="website" 
                  label="Website"
                  rules={[{ type: "url", message: "Please enter a valid URL" }]}
                >
                  <Input 
                    placeholder="https://yourwebsite.com" 
                    prefix={<Iconify icon="eva:link-fill" width="16px" />}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="relationshipStatus" label="Relationship Status">
              <Select placeholder="Select your relationship status">
                <Option value="single">Single</Option>
                <Option value="in_relationship">In a Relationship</Option>
                <Option value="married">Married</Option>
                <Option value="its_complicated">It's Complicated</Option>
                <Option value="prefer_not_to_say">Prefer Not to Say</Option>
              </Select>
            </Form.Item>
          </Card>

          {/* Interests - Same as onboarding */}
          <Card title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Iconify icon="eva:heart-fill" width="20px" />
              <span>Interests ({selectedInterests.length}/8)</span>
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
              Select up to 8 interests that describe you
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
              {forceEdit ? 'Complete Profile' : 'Save Changes'}
            </Button>
          </div>

             {/* Questionnaire Section - Show for all current users for testing */}
             {(checkQuestionnaireCompletion() || isCurrentUserProfile) && (
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Iconify icon="eva:star-fill" width="20px" />
                  <span>Astrological Profile</span>
                </div>
              }
              style={{ marginBottom: '1.5rem' }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    {checkQuestionnaireCompletion() 
                      ? "Want to update your astrological preferences or questionnaire answers?"
                      : "Complete your astrological profile to enhance YDestiny compatibility!"
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
                  {checkQuestionnaireCompletion() ? "Retake Questionnaire" : "Start Questionnaire"}
                </Button>
                
                <div style={{ marginTop: '0.5rem' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    This will update your compatibility matches
                  </Text>
                </div>
              </div>
            </Card>
          )}
        </Form>

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
              Enable Location Access
            </Title>
            
            <Text type="secondary" style={{ fontSize: "15px", lineHeight: "1.5" }}>
              We'd like to detect your location to help you connect with people nearby. 
              Your location is only used to improve your experience and is never shared without your permission.
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
              Skip
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
              Allow Location
            </Button>
          </div>

          <Text type="secondary" style={{ fontSize: "12px", marginTop: "1rem", display: "block" }}>
            <Iconify icon="eva:shield-fill" width="14px" style={{ marginRight: "4px" }} />
            Your privacy is important to us
          </Text>
        </Modal>
      </Spin>
    </div>
  );
};

export default ProfileEditSection; 