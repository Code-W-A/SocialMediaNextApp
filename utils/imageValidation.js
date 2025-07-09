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
  'svg',
  'heic',
  'heif'
];

// Max file sizes (in bytes) - Removed strict limits, rely on compression
export const MAX_FILE_SIZES = {
  POST_IMAGE: 50 * 1024 * 1024, // 50MB - generous limit, rely on compression
  PROFILE_IMAGE: 50 * 1024 * 1024, // 50MB - generous limit, rely on compression
  BANNER_IMAGE: 50 * 1024 * 1024, // 50MB - generous limit, rely on compression
  MESSAGE_IMAGE: 50 * 1024 * 1024 // 50MB - generous limit, rely on compression
};

// Extend supported types list to include HEIC for conversion
export const NATIVE_SUPPORTED_IMAGE_TYPES = [...SUPPORTED_IMAGE_TYPES];
SUPPORTED_IMAGE_TYPES.push('image/heic', 'image/heif');

/**
 * Convert HEIC/HEIF files to JPEG using heic2any (only when needed)
 * Returns Promise<File>
 */
export const convertHeicIfNeeded = async (file) => {
  if (!file) return file;

  const extension = file.name.split('.').pop()?.toLowerCase();
  const isHeicType = ['image/heic', 'image/heif'].includes(file.type);
  const isHeicExt = ['heic', 'heif'].includes(extension);

  if (!isHeicType && !isHeicExt) return file; // Not a HEIC file by type nor extension

  try {
    const heic2any = (await import('heic2any')).default;
    const outputBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
    const convertedFile = new File([outputBlob], file.name.replace(/\.heic|\.heif/i, '.jpg'), { type: 'image/jpeg' });
    console.log('📸 [HEIC Conversion] Converted HEIC to JPEG:', convertedFile);
    return convertedFile;
  } catch (err) {
    console.error('Failed to convert HEIC image', err);
    throw new Error('Unsupported image format (HEIC). Please convert to JPEG/PNG before uploading.');
  }
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

  // Extract extension first
  const extension = file.name.split('.').pop()?.toLowerCase();

  // --- MIME TYPE VALIDATION ---
  // Some browsers (especially on Windows) may provide empty or generic MIME types (e.g., "")
  // We treat unknown MIME as potentially valid if the extension is known.
  const hasValidMime = file.type && SUPPORTED_IMAGE_TYPES.includes(file.type);

  if (!hasValidMime) {
    // Fallback: validate by extension if MIME type is missing or not recognized
    if (!extension || !SUPPORTED_IMAGE_EXTENSIONS.includes(extension)) {
      result.error = `Unsupported image format. Accepted extensions: ${SUPPORTED_IMAGE_EXTENSIONS.join(', ')}`;
      return result;
    }
  }

  // --- EXTENSION VALIDATION (already extracted) ---
  if (extension && !SUPPORTED_IMAGE_EXTENSIONS.includes(extension)) {
    result.error = `Invalid file extension: ${extension}`;
    return result;
  }

  // Check file size based on context
  const maxSize = MAX_FILE_SIZES[`${context.toUpperCase()}_IMAGE`] || MAX_FILE_SIZES.POST_IMAGE;
  if (file.size > maxSize) {
    result.error = `File too large. Maximum size: ${(maxSize / 1024 / 1024).toFixed(1)}MB`;
    return result;
  }

  // Add warnings for very large files only
  if (file.size > 25 * 1024 * 1024) { // Only warn for files > 25MB
    result.warnings.push('Very large file - will be compressed for optimal storage');
  }

  // Special handling for SVG files
  if ((file.type === 'image/svg+xml' || extension === 'svg') && context === 'profile') {
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
export const canvasToFile = (canvas, fileName, mimeType = 'image/jpeg', quality = 0.85) => {
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
    quality = 0.85 // Better compression for Firebase storage
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

    // Convert to file with smart compression
    const processedFile = await smartCompressImage(
      processedCanvas, 
      `processed_${Date.now()}.jpg`, 
      file, // Original file for size reference
      context
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
 * Get intelligent quality based on file size and context
 * @param {File} file - Image file
 * @param {string} context - Image context
 * @returns {number} Optimal quality (0-1)
 */
export const getIntelligentQuality = (file, context = 'post') => {
  const fileSizeMB = file.size / 1024 / 1024;
  
  // Base quality by context
  const baseQuality = {
    profile: 0.85,
    post: 0.85,
    banner: 0.85,
    message: 0.8
  };
  
  let quality = baseQuality[context] || 0.85;
  
  // Reduce quality for very large files
  if (fileSizeMB > 20) {
    quality = 0.75; // More compression for files > 20MB
  } else if (fileSizeMB > 10) {
    quality = 0.8; // Some compression for files > 10MB
  } else if (fileSizeMB > 5) {
    quality = 0.82; // Light compression for files > 5MB
  }
  
  return quality;
};

/**
 * Smart image compression with size optimization
 * @param {HTMLCanvasElement} canvas - Canvas to compress
 * @param {string} fileName - Output file name
 * @param {File} originalFile - Original file for size reference
 * @param {string} context - Image context
 * @returns {Promise<File>} Compressed file
 */
export const smartCompressImage = async (canvas, fileName, originalFile, context = 'post') => {
  const quality = getIntelligentQuality(originalFile, context);
  
  // Try compression with intelligent quality
  let compressedFile = await canvasToFile(canvas, fileName, 'image/jpeg', quality);
  
  // If still too large (> 2MB), apply additional compression
  if (compressedFile.size > 2 * 1024 * 1024) {
    const reducedQuality = Math.max(0.6, quality - 0.15);
    compressedFile = await canvasToFile(canvas, fileName, 'image/jpeg', reducedQuality);
  }
  
  console.log(`📸 [Image Compression] Original: ${(originalFile.size / 1024 / 1024).toFixed(2)}MB → Compressed: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB (Quality: ${quality})`);
  
  return compressedFile;
};

/**
 * Robust image processing pipeline with multiple fallback strategies
 * Handles problematic images that normal browser loading can't process
 */
export const createRobustImagePreview = async (file) => {
  console.log(`🔍 [RobustImagePreview] Starting processing for: ${file.name} (${file.type}, ${(file.size/1024/1024).toFixed(2)}MB)`);
  
  const strategies = [
    { name: 'Browser URL.createObjectURL', method: tryBrowserPreview },
    { name: 'createImageBitmap resized', method: tryImageBitmapPreview },
    { name: 'Canvas-based decode', method: tryCanvasPreview },
    { name: 'jpeg-js fallback', method: tryJpegJsPreview }
  ];

  for (const strategy of strategies) {
    try {
      console.log(`🔄 [RobustImagePreview] Trying: ${strategy.name}`);
      const result = await strategy.method(file);
      console.log(`✅ [RobustImagePreview] Success with: ${strategy.name}`);
      return result;
    } catch (error) {
      console.warn(`❌ [RobustImagePreview] Failed ${strategy.name}:`, error.message);
    }
  }
  
  throw new Error('All image processing strategies failed. This image cannot be displayed in the browser.');
};

// Strategy 1: Normal browser preview
const tryBrowserPreview = async (file) => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    
    const timeout = setTimeout(() => {
      img.onload = img.onerror = null;
      URL.revokeObjectURL(url);
      reject(new Error('Browser preview timeout (6s)'));
    }, 6000);
    
    img.onload = () => {
      clearTimeout(timeout);
      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        URL.revokeObjectURL(url);
        reject(new Error('Image loaded but has zero dimensions'));
        return;
      }
      resolve({ url, width: img.naturalWidth, height: img.naturalHeight, strategy: 'browser' });
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(url);
      reject(new Error('Browser failed to decode image'));
    };
    
    img.src = url;
  });
};

// Strategy 2: createImageBitmap with resizing
const tryImageBitmapPreview = async (file, maxSize = 4096) => {
  try {
    const bitmap = await createImageBitmap(file, { 
      resizeWidth: maxSize, 
      resizeHeight: maxSize,
      resizeQuality: 'high'
    });
    
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    
    const url = canvas.toDataURL('image/jpeg', 0.9);
    return { url, width: canvas.width, height: canvas.height, strategy: 'imageBitmap' };
  } catch (error) {
    throw new Error(`ImageBitmap failed: ${error.message}`);
  }
};

// Strategy 3: Canvas-based decode
const tryCanvasPreview = async (file) => {
  const canvas = await createCanvasFromFile(file);
  if (canvas.width === 0 || canvas.height === 0) {
    throw new Error('Canvas decode resulted in zero dimensions');
  }
  
  // Check if canvas is completely black (common CMYK issue)
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, Math.min(50, canvas.width), Math.min(50, canvas.height));
  const isCompletelyBlack = imageData.data.every((value, index) => 
    index % 4 === 3 ? true : value === 0 // Skip alpha channel
  );
  
  if (isCompletelyBlack) {
    throw new Error('Canvas decode resulted in completely black image (likely CMYK)');
  }
  
  const url = canvas.toDataURL('image/jpeg', 0.9);
  return { url, width: canvas.width, height: canvas.height, strategy: 'canvas' };
};

// Strategy 4: jpeg-js fallback
const tryJpegJsPreview = async (file) => {
  if (file.type !== 'image/jpeg') {
    throw new Error('Not a JPEG - jpeg-js only supports JPEG');
  }
  
  const jpegJs = (await import('jpeg-js')).default || (await import('jpeg-js'));
  const arrayBuffer = await file.arrayBuffer();
  const raw = jpegJs.decode(new Uint8Array(arrayBuffer), { useTArray: true, formatAsRGBA: true });
  
  let { width, height, data } = raw;
  
  // Downscale if too large
  const maxSize = 4096;
  if (Math.max(width, height) > maxSize) {
    const scale = maxSize / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (width === raw.width && height === raw.height) {
    const imageData = new ImageData(new Uint8ClampedArray(data), raw.width, raw.height);
    ctx.putImageData(imageData, 0, 0);
  } else {
    // Scale via temporary canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = raw.width;
    tempCanvas.height = raw.height;
    const tctx = tempCanvas.getContext('2d');
    const imgData = new ImageData(new Uint8ClampedArray(data), raw.width, raw.height);
    tctx.putImageData(imgData, 0, 0);
    ctx.drawImage(tempCanvas, 0, 0, width, height);
  }
  
  const url = canvas.toDataURL('image/jpeg', 0.9);
  return { url, width, height, strategy: 'jpeg-js' };
};

/**
 * Attempt to fix unreadable JPEGs (e.g., CMYK, huge resolution) by decoding with jpeg-js and re-encoding via canvas.
 * Returns a new File or throws if cannot fix.
 */
export const attemptFixUnreadableJpeg = async (file, resizeMax = 4096) => {
  console.log(`🔧 [FixUnreadableJpeg] Attempting to fix: ${file.name}`);
  
  try {
    const result = await createRobustImagePreview(file);
    
    // Convert data URL back to File
    const response = await fetch(result.url);
    const blob = await response.blob();
    const fixedFile = new File([blob], file.name.replace(/\.jpg$/i, '_fixed.jpg'), { type: 'image/jpeg' });
    
    console.log(`✅ [FixUnreadableJpeg] Successfully fixed using: ${result.strategy}`);
    return fixedFile;
  } catch (error) {
    console.error('❌ [FixUnreadableJpeg] All strategies failed:', error);
    throw error;
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

/**
 * Standardize any image to a clean JPEG format
 * Removes EXIF metadata, ICC profiles, and ensures browser compatibility
 * @param {File} file - Input image file
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Standardized image data
 */
export const standardizeImage = async (file, options = {}) => {
  const {
    maxWidthOrHeight = 2000,
    quality = 0.9,
    outputFormat = 'image/jpeg',
    preserveExif = false
  } = options;

  console.log(`📸 [StandardizeImage] Processing: ${file.name} (${file.type}, ${(file.size/1024/1024).toFixed(2)}MB)`);

  try {
    // Step 1: Convert HEIC/HEIF to JPEG if needed
    let processedFile = file;
    if (['image/heic', 'image/heif'].includes(file.type)) {
      console.log('🔄 [StandardizeImage] Converting HEIC/HEIF to JPEG...');
      processedFile = await convertHeicIfNeeded(file);
    }

    // Step 2: Use browser-image-compression for robust standardization
    const imageCompression = (await import('browser-image-compression')).default;
    
    const compressionOptions = {
      maxWidthOrHeight,
      useWebWorker: true,
      fileType: outputFormat,
      quality,
      preserveExif: preserveExif,
      // Force specific settings for standardization
      alwaysKeepResolution: false,
      exifOrientation: 1, // Reset EXIF orientation
      initialQuality: 1 // Start with full quality, then compress
    };

    console.log('🔄 [StandardizeImage] Standardizing with browser-image-compression...');
    const standardizedFile = await imageCompression(processedFile, compressionOptions);

    // Step 3: Create a clean blob to ensure no metadata remnants
    const cleanBlob = new Blob([standardizedFile], { type: outputFormat });
    
    // Step 4: Convert to File object with clean name
    const cleanFileName = `standardized_${Date.now()}.jpg`;
    const cleanFile = new File([cleanBlob], cleanFileName, { 
      type: outputFormat,
      lastModified: Date.now()
    });

    // Step 5: Create preview URL for immediate use
    const previewUrl = URL.createObjectURL(cleanFile);

    // Step 6: Verify the result works
    await new Promise((resolve, reject) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        reject(new Error('Standardized image verification timeout'));
      }, 3000);

      img.onload = () => {
        clearTimeout(timeout);
        if (img.naturalWidth === 0 || img.naturalHeight === 0) {
          reject(new Error('Standardized image has zero dimensions'));
        } else {
          resolve();
        }
      };

      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Standardized image failed to load'));
      };

      img.src = previewUrl;
    });

    console.log(`✅ [StandardizeImage] Success! Original: ${(file.size/1024/1024).toFixed(2)}MB → Standardized: ${(cleanFile.size/1024/1024).toFixed(2)}MB`);

    return {
      file: cleanFile,
      blob: cleanBlob,
      previewUrl,
      originalFile: file,
      originalSize: file.size,
      standardizedSize: cleanFile.size,
      compressionRatio: ((file.size - cleanFile.size) / file.size * 100).toFixed(1),
      isStandardized: true
    };

  } catch (error) {
    console.error('❌ [StandardizeImage] Failed:', error);
    throw new Error(`Failed to standardize image: ${error.message}`);
  }
};

/**
 * Batch standardize multiple images
 * @param {File[]} files - Array of image files
 * @param {Object} options - Processing options
 * @returns {Promise<Object[]>} Array of standardized image data
 */
export const standardizeImages = async (files, options = {}) => {
  console.log(`📸 [StandardizeImages] Processing ${files.length} images...`);
  
  const results = [];
  const errors = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const result = await standardizeImage(file, options);
      results.push(result);
      console.log(`✅ [StandardizeImages] Processed ${i + 1}/${files.length}: ${file.name}`);
    } catch (error) {
      console.error(`❌ [StandardizeImages] Failed ${i + 1}/${files.length}: ${file.name}`, error);
      errors.push({ file, error: error.message });
    }
  }

  return {
    results,
    errors,
    successCount: results.length,
    errorCount: errors.length
  };
}; 