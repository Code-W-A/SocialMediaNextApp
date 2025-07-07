/**
 * Image validation and processing utilities
 * Handles various image formats and fixes loading issues
 */

// Supported image MIME types
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/svg+xml'
];

// Supported image extensions
export const SUPPORTED_IMAGE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'bmp',
  'svg'
];

// Max file sizes (in bytes)
export const MAX_FILE_SIZES = {
  POST_IMAGE: 10 * 1024 * 1024, // 10MB for posts
  PROFILE_IMAGE: 5 * 1024 * 1024, // 5MB for profile images
  BANNER_IMAGE: 8 * 1024 * 1024, // 8MB for banner images
  MESSAGE_IMAGE: 8 * 1024 * 1024 // 8MB for message images
};

/**
 * Validate if file is a valid image
 * @param {File} file - File object to validate
 * @param {string} context - Context for validation (post, profile, message)
 * @returns {Object} Validation result
 */
export const validateImageFile = (file, context = 'post') => {
  const result = {
    isValid: false,
    error: null,
    warnings: []
  };

  if (!file) {
    result.error = 'No file provided';
    return result;
  }

  // Check if it's a file object
  if (!(file instanceof File)) {
    result.error = 'Invalid file object';
    return result;
  }

  // Check MIME type
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    result.error = `Unsupported image format: ${file.type}. Supported formats: JPG, PNG, WEBP, GIF`;
    return result;
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !SUPPORTED_IMAGE_EXTENSIONS.includes(extension)) {
    result.error = `Invalid file extension: ${extension}`;
    return result;
  }

  // Check file size based on context
  const maxSize = MAX_FILE_SIZES[`${context.toUpperCase()}_IMAGE`] || MAX_FILE_SIZES.POST_IMAGE;
  if (file.size > maxSize) {
    result.error = `File too large. Maximum size: ${(maxSize / 1024 / 1024).toFixed(1)}MB`;
    return result;
  }

  // Add warnings for large files
  if (file.size > maxSize * 0.8) {
    result.warnings.push('Large file size may affect upload speed');
  }

  // Special handling for SVG files
  if (file.type === 'image/svg+xml' && context === 'profile') {
    result.warnings.push('SVG files may not display correctly on all devices');
  }

  result.isValid = true;
  return result;
};

/**
 * Create a canvas element from an image file
 * @param {File} file - Image file
 * @returns {Promise<HTMLCanvasElement>} Canvas element
 */
export const createCanvasFromFile = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      resolve(canvas);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Crop image using canvas
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @param {Object} crop - Crop configuration
 * @param {number} outputWidth - Output width
 * @param {number} outputHeight - Output height
 * @returns {HTMLCanvasElement} Cropped canvas
 */
export const cropImageCanvas = (canvas, crop, outputWidth, outputHeight) => {
  const croppedCanvas = document.createElement('canvas');
  const ctx = croppedCanvas.getContext('2d');

  croppedCanvas.width = outputWidth;
  croppedCanvas.height = outputHeight;

  const scaleX = canvas.width / 100; // Convert percentage to pixels
  const scaleY = canvas.height / 100;

  ctx.drawImage(
    canvas,
    crop.x * scaleX, // Source x
    crop.y * scaleY, // Source y
    crop.width * scaleX, // Source width
    crop.height * scaleY, // Source height
    0, // Destination x
    0, // Destination y
    outputWidth, // Destination width
    outputHeight // Destination height
  );

  return croppedCanvas;
};

/**
 * Convert canvas to File object
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {string} fileName - Output file name
 * @param {string} mimeType - Output MIME type
 * @param {number} quality - Image quality (0-1)
 * @returns {Promise<File>} File object
 */
export const canvasToFile = (canvas, fileName, mimeType = 'image/jpeg', quality = 0.9) => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const file = new File([blob], fileName, { type: mimeType });
      resolve(file);
    }, mimeType, quality);
  });
};

/**
 * Get optimal dimensions for different aspect ratios
 * @param {string} aspectRatio - square, landscape, portrait
 * @param {number} maxWidth - Maximum width
 * @returns {Object} Width and height
 */
export const getOptimalDimensions = (aspectRatio, maxWidth = 1080) => {
  const dimensions = {
    square: { width: maxWidth, height: maxWidth },
    landscape: { width: maxWidth, height: Math.round(maxWidth * (9/16)) }, // 16:9
    portrait: { width: Math.round(maxWidth * (9/16)), height: maxWidth } // 9:16
  };

  return dimensions[aspectRatio] || dimensions.square;
};

/**
 * Process image for upload with validation and optimization
 * @param {File} file - Image file
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Processed image data
 */
export const processImageForUpload = async (file, options = {}) => {
  const {
    context = 'post',
    aspectRatio = 'square',
    crop = null,
    maxWidth = 1080,
    quality = 0.9
  } = options;

  // Validate file
  const validation = validateImageFile(file, context);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  try {
    // Create canvas from file
    const canvas = await createCanvasFromFile(file);
    
    let processedCanvas = canvas;

    // Apply crop if provided
    if (crop) {
      const dimensions = getOptimalDimensions(aspectRatio, maxWidth);
      processedCanvas = cropImageCanvas(canvas, crop, dimensions.width, dimensions.height);
    }

    // Convert to file
    const processedFile = await canvasToFile(
      processedCanvas, 
      `processed_${Date.now()}.jpg`, 
      'image/jpeg', 
      quality
    );

    return {
      file: processedFile,
      originalFile: file,
      dimensions: {
        width: processedCanvas.width,
        height: processedCanvas.height
      },
      size: processedFile.size,
      aspectRatio,
      warnings: validation.warnings
    };

  } catch (error) {
    throw new Error(`Failed to process image: ${error.message}`);
  }
};

/**
 * Create image preview URL with cleanup
 * @param {File} file - Image file
 * @returns {string} Preview URL
 */
export const createImagePreview = (file) => {
  return URL.createObjectURL(file);
};

/**
 * Cleanup image preview URL
 * @param {string} url - Preview URL to cleanup
 */
export const cleanupImagePreview = (url) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

/**
 * Get image file info
 * @param {File} file - Image file
 * @returns {Object} File information
 */
export const getImageFileInfo = (file) => {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    sizeFormatted: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    extension: file.name.split('.').pop()?.toLowerCase()
  };
}; 