"use client";
import React, { useState, useCallback } from 'react';
import ImageCropModal from './ImageCropModal';
import { validateImageFile } from '@/utils/imageValidation';
import { useLanguage } from '@/lib/i18n';

/**
 * PostImageCrop - Specialized component for post image cropping
 * Supports square, landscape, and portrait aspect ratios
 */
const PostImageCrop = ({
  visible,
  onCancel,
  onCropComplete,
  file,
  title,
  defaultAspectRatio = 'square',
  maxWidth = 1080, // Posts can be larger
  quality = 0.9 // Standard quality for posts
}) => {
  const { t } = useLanguage();

  const handleCropComplete = useCallback((cropData) => {
    // Add post-specific metadata
    const postCropData = {
      ...cropData,
      isPostImage: true,
      context: 'post'
    };
    
    onCropComplete(postCropData);
  }, [onCropComplete]);

  const postTitle = title || t('imageCrop.postImageTitle') || 'Crop Post Image';

  return (
    <ImageCropModal
      visible={visible}
      onCancel={onCancel}
      onCropComplete={handleCropComplete}
      file={file}
      title={postTitle}
      aspectRatios={['square', 'landscape', 'portrait']} // All three options for posts
      defaultAspectRatio={defaultAspectRatio}
      maxWidth={maxWidth}
      quality={quality}
      showAspectRatioSelector={true} // Show aspect ratio selector for posts
      showZoomSlider={true}
      showImageInfo={true}
    />
  );
};

export default PostImageCrop; 