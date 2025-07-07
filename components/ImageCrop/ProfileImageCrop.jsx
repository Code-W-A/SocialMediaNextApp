"use client";
import React, { useState, useCallback } from 'react';
import ImageCropModal from './ImageCropModal';
import { validateImageFile } from '@/utils/imageValidation';
import { useLanguage } from '@/lib/i18n';

/**
 * ProfileImageCrop - Specialized component for profile image cropping
 * Always crops to square aspect ratio for profile images
 */
const ProfileImageCrop = ({
  visible,
  onCancel,
  onCropComplete,
  file,
  title,
  maxWidth = 512, // Profile images are typically smaller
  quality = 0.95 // Higher quality for profile images
}) => {
  const { t } = useLanguage();

  const handleCropComplete = useCallback((cropData) => {
    // Profile images always get square crop
    const profileCropData = {
      ...cropData,
      isProfileImage: true,
      aspectRatio: 'square'
    };
    
    onCropComplete(profileCropData);
  }, [onCropComplete]);

  const profileTitle = title || t('imageCrop.profileImageTitle') || 'Crop Profile Image';

  return (
    <ImageCropModal
      visible={visible}
      onCancel={onCancel}
      onCropComplete={handleCropComplete}
      file={file}
      title={profileTitle}
      aspectRatios={['square']} // Only square for profile images
      defaultAspectRatio="square"
      maxWidth={maxWidth}
      quality={quality}
      showAspectRatioSelector={false} // Hide aspect ratio selector since it's always square
      showZoomSlider={true}
      showImageInfo={true}
    />
  );
};

export default ProfileImageCrop; 