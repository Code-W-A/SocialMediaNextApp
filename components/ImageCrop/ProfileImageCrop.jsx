"use client";
import React, { useState, useCallback } from 'react';
import ImageCropModal from './ImageCropModal';
import { validateImageFile } from '@/utils/imageValidation';
import { useLanguage } from '@/lib/i18n';

/**
 * ProfileImageCrop - Specialized component for profile image cropping
 * Supports square and portrait aspect ratios for profile images
 */
const ProfileImageCrop = ({
  visible,
  onCancel,
  onCropComplete,
  file,
  title,
  defaultAspectRatio = 'square',
  maxWidth = 1000, // Conservative reduction from 1080
  quality = 0.85 // High quality maintained for profile images
}) => {
  const { t } = useLanguage();

  const handleCropComplete = useCallback((cropData) => {
    // Add profile-specific metadata
    const profileCropData = {
      ...cropData,
      isProfileImage: true,
      context: 'profile'
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
      aspectRatios={['square', 'portrait']} // Square and portrait options for profile images
      defaultAspectRatio={defaultAspectRatio}
      maxWidth={maxWidth}
      quality={quality}
      showAspectRatioSelector={true} // Show aspect ratio selector for choosing between square and portrait
      showZoomSlider={true}
      showImageInfo={true}
    />
  );
};

export default ProfileImageCrop; 