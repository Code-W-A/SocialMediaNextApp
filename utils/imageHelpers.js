/**
 * Utility functions for handling user images with the correct Firebase structure
 */

/**
 * Validate if a URL is a valid image URL
 * @param {string} url - URL to validate
 * @returns {boolean} Whether the URL is valid
 */
const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    // Check if it's a valid URL with http/https protocol
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Get the main profile image URL from user images array
 * @param {Array} images - Array of image objects with structure: {fileName, fileUri, isMain}
 * @param {string} fallbackUrl - Fallback image URL if no main image is found
 * @returns {string} Image URL
 */
export const getMainProfileImage = (images = [], fallbackUrl = "/images/placeholder-avatar.png") => {
  // Validate input
  if (!Array.isArray(images)) {
    return fallbackUrl;
  }
  
  // First, try to find the image marked as main
  const mainImage = images.find(img => img?.isMain === true);
  if (mainImage?.fileUri && isValidImageUrl(mainImage.fileUri)) {
    return mainImage.fileUri;
  }
  
  // If no main image, use the first available valid image
  const firstValidImage = images.find(img => img?.fileUri && isValidImageUrl(img.fileUri));
  if (firstValidImage) {
    return firstValidImage.fileUri;
  }
  
  // Return fallback if no valid images available
  return fallbackUrl;
};

/**
 * Get all profile images with validation
 * @param {Array} images - Array of image objects
 * @returns {Array} Array of valid image URLs
 */
export const getAllProfileImages = (images = []) => {
  if (!Array.isArray(images)) return [];
  
  return images
    .filter(img => img?.fileUri && isValidImageUrl(img.fileUri))
    .map(img => img.fileUri);
};

/**
 * Create a new image object with the correct structure
 * @param {string} fileName - Unique file name (usually UUID)
 * @param {string} fileUri - Full Firebase storage URL
 * @param {boolean} isMain - Whether this is the main profile image
 * @returns {Object} Image object with correct structure
 */
export const createImageObject = (fileName, fileUri, isMain = false) => {
  if (!fileName || !fileUri) {
    console.error('Invalid image object parameters:', { fileName, fileUri });
    return null;
  }
  
  return {
    fileName,
    fileUri,
    isMain: Boolean(isMain)
  };
};

/**
 * Process and validate image array
 * @param {Array} images - Array of image objects to process
 * @returns {Array} Processed and validated image array
 */
export const processImageArray = (images = []) => {
  if (!Array.isArray(images)) return [];
  
  const validImages = images.filter(img => 
    img && 
    img.fileName && 
    img.fileUri && 
    isValidImageUrl(img.fileUri)
  );
  
  // Ensure at least one image is marked as main
  if (validImages.length > 0 && !validImages.some(img => img.isMain)) {
    validImages[0].isMain = true;
  }
  
  return validImages;
};

/**
 * Get image URL with error handling
 * @param {string} url - Image URL
 * @param {string} fallback - Fallback URL
 * @returns {string} Valid image URL or fallback
 */
export const getImageUrlWithFallback = (url, fallback = "/images/placeholder-avatar.png") => {
  return isValidImageUrl(url) ? url : fallback;
};

/**
 * Check if user has any valid profile images
 * @param {Array} images - Array of image objects
 * @returns {boolean} Whether user has valid images
 */
export const hasValidProfileImages = (images) => {
  return Array.isArray(images) && images.some(img => 
    img?.fileUri && isValidImageUrl(img.fileUri)
  );
};

/**
 * Update images array to set a new main image
 * @param {Array} images - Current images array
 * @param {string} fileName - File name of the image to set as main
 * @returns {Array} Updated images array
 */
export const setMainImage = (images = [], fileName) => {
  return images.map(img => ({
    ...img,
    isMain: img.fileName === fileName
  }));
}; 