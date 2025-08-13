"use client";
import React from 'react';
import Image from 'next/image';
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary';

/**
 * OptimizedImage - Component for serving optimized images
 * Uses Cloudinary or Firebase Storage with optimal settings for bandwidth reduction
 */
const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  quality = 75, // Reduced default quality for bandwidth savings
  placeholder = "blur",
  blurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bvQ6++bondbuy++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6++6//Z",
  ...props
}) => {
  // Check if it's a Cloudinary URL or Firebase Storage URL
  const isCloudinary = src?.includes('cloudinary.com');
  const isFirebaseStorage = src?.includes('firebasestorage.googleapis.com');
  
  let optimizedSrc = src;
  
  if (isCloudinary) {
    // Extract public ID from Cloudinary URL and generate optimized version
    const publicIdMatch = src.match(/\/v\d+\/(.+?)(?:\.|$)/);
    if (publicIdMatch) {
      const publicId = publicIdMatch[1];
      optimizedSrc = getOptimizedCloudinaryUrl(publicId, {
        width: width || 800,
        height: height || 800,
        quality: 'auto',
        format: 'auto'
      });
    }
  } else if (isFirebaseStorage) {
    // For Firebase Storage, we can add query parameters for basic optimization
    const url = new URL(src);
    // Add cache control for better performance
    url.searchParams.set('alt', 'media');
    optimizedSrc = url.toString();
  }

  const imageProps = {
    src: optimizedSrc,
    alt,
    width: width || 800,
    height: height || 800,
    className,
    priority,
    sizes,
    quality,
    placeholder: placeholder === "blur" ? "blur" : undefined,
    blurDataURL: placeholder === "blur" ? blurDataURL : undefined,
    loading: priority ? "eager" : "lazy",
    style: {
      objectFit: 'cover',
      ...props.style
    },
    ...props
  };

  // Remove style from props to avoid duplication
  delete imageProps.style;

  return (
    <Image
      {...imageProps}
      style={{
        objectFit: 'cover',
        ...props.style
      }}
      onError={(e) => {
        console.warn('Image failed to load:', optimizedSrc);
        // Fallback to placeholder
        e.target.src = '/images/placeholder-avatar.png';
      }}
    />
  );
};

export default OptimizedImage; 