/**
 * Utility functions for handling user images with the correct Firebase structure
 */

/**
 * Get the main profile image URL from user images array
 * @param {Array} images - Array of image objects with structure: {fileName, fileUri, isMain}
 * @param {string} fallbackUrl - Fallback image URL if no main image is found
 * @returns {string} Image URL
 */
export const getMainProfileImage = (images = [], fallbackUrl = "/images/placeholder-avatar.png") => {
  // First, try to find the image marked as main
  const mainImage = images.find(img => img.isMain === true);
  if (mainImage?.fileUri) {
    return mainImage.fileUri;
  }
  
  // If no main image, use the first available image
  if (images.length > 0 && images[0]?.fileUri) {
    return images[0].fileUri;
  }
  
  // Return fallback if no images available
  return fallbackUrl;
};

/**
 * Get all profile images URLs from user images array
 * @param {Array} images - Array of image objects
 * @returns {Array} Array of image URLs
 */
export const getAllProfileImages = (images = []) => {
  return images
    .filter(img => img.fileUri)
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
  return {
    fileName,
    fileUri,
    isMain
  };
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