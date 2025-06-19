"use client";
import React, { useState, useEffect } from "react";
import { Button, Typography, Upload, message, Progress, Image } from "antd";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useFirebaseAuth";
import Iconify from "@/components/Iconify";
import css from "@/styles/AuthPages.module.css";
import photoCss from "@/styles/PhotoUpload.module.css";
import layoutCss from "@/styles/onboardingLayout.module.css";
import { storage, db } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { createImageObject } from "@/utils/imageHelpers";
import { v4 as uuidv4 } from 'uuid';

const { Title, Text } = Typography;
const { Dragger } = Upload;

export default function PhotosPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [previewImages, setPreviewImages] = useState([]);

  // Load existing images from Firestore on component mount
  useEffect(() => {
    const loadExistingImages = async () => {
      if (user?.images && user.images.length > 0) {
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

          console.log('Loaded existing images:', user.images.length);
        } catch (error) {
          console.error('Error loading existing images:', error);
        }
      }
    };

    if (user) {
      loadExistingImages();
    }
  }, [user]);

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
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Image must be smaller than 5MB!');
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
      {/* Header Section */}
      <div className={layoutCss.headerSection}>
        <Text strong style={{ fontSize: "14px", color: "#666", marginBottom: "8px", display: "block" }}>
          Step 1 of 3: Add Profile Photos
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
            Add Your Photos 📸
          </Title>
          <Text type="secondary" className={css.authSubtitle}>
            Upload at least 1 photo to continue. Add up to 6 photos to make a great first impression and attract more connections.
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
                  Click or drag files to upload
                </Title>
                <Text type="secondary">
                  Support for single or bulk upload. PNG, JPG up to 5MB each
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
                    }}
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
            Back
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
            {loading ? "Uploading..." : uploadedImages.length > 0 ? `Continue with ${uploadedImages.length} photo${uploadedImages.length > 1 ? 's' : ''}` : 'Add photos to continue'}
          </Button>
        </div>
      </div>
    </div>
  );
} 