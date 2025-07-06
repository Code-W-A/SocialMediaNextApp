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
              const tempPreviews = tempImages.map((file, index) => ({
                url: file.url || (file.originFileObj ? URL.createObjectURL(file.originFileObj) : ''),
                uid: file.uid,
                file: file,
                index: index
              }));
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

            console.log('Loaded existing images from Firestore:', user.images.length);
          } catch (error) {
            console.error('Error loading existing images:', error);
          }
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

  const uploadProps = {
    name: 'file',
    multiple: true,
    accept: 'image/*',
    maxCount: 6,
    showUploadList: false, // Hide the default upload list
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return false;
      }
      return false; // Prevent automatic upload
    },
    onChange: (info) => {
      setUploadedImages(info.fileList);
      
      // Create preview URLs for uploaded images
      const previews = info.fileList.map((file, index) => {
        if (file.originFileObj) {
          const url = URL.createObjectURL(file.originFileObj);
          return { url, file, index, uid: file.uid };
        }
        return null;
      }).filter(Boolean);
      
      setPreviewImages(previews);
      
      // Reset main image index if it's out of bounds
      if (mainImageIndex >= info.fileList.length) {
        setMainImageIndex(0);
      }
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
          // Upload new image
          const fileName = uuidv4();
          const storageRef = ref(storage, `images/${fileName}`);
          
          // Upload file to Firebase Storage
          const snapshot = await uploadBytes(storageRef, file.originFileObj);
          const downloadURL = await getDownloadURL(snapshot.ref);
          
          // Create image object with correct structure
          const imageObject = createImageObject(fileName, downloadURL, i === mainImageIndex);
          imageObjects.push(imageObject);
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
                    multiple
                    accept="image/*"
                    style={{ display: "none" }}
                    id="additionalPhotosInput"
                    onChange={(e) => {
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
                        
                        if (!isImage) {
                          message.error(`${file.name} is not an image file`);
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
    </div>
  );
} 