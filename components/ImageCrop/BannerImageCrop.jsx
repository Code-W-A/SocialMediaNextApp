"use client";
import React, { useState, useCallback } from 'react';
import ImageCropModal from './ImageCropModal';
import { validateImageFile } from '@/utils/imageValidation';
import { useLanguage } from '@/lib/i18n';

/**
 * BannerImageCrop - Specialized component for banner image cropping
 * Always crops to landscape aspect ratio (16:9) for banners
 */
const BannerImageCrop = ({
  visible,
  onCancel,
  onCropComplete,
  file,
  title,
  maxWidth = 1200, // Maintained for banner quality
  quality = 0.85 // High quality maintained for banners
}) => {
  const { t } = useLanguage();

  const handleCropComplete = useCallback((cropData) => {
    // Banner images always get landscape crop
    const bannerCropData = {
      ...cropData,
      isBannerImage: true,
      aspectRatio: 'landscape',
      context: 'banner'
    };
    
    onCropComplete(bannerCropData);
  }, [onCropComplete]);

  const bannerTitle = title || t('imageCrop.bannerImageTitle') || 'Crop Banner Image';

  return (
    <ImageCropModal
      visible={visible}
      onCancel={onCancel}
      onCropComplete={handleCropComplete}
      file={file}
      title={bannerTitle}
      aspectRatios={['landscape']} // Only landscape for banners
      defaultAspectRatio="landscape"
      maxWidth={maxWidth}
      quality={quality}
      showAspectRatioSelector={false} // Hide aspect ratio selector since it's always landscape
      showZoomSlider={true}
      showImageInfo={true}
    />
  );
};

export default BannerImageCrop; 