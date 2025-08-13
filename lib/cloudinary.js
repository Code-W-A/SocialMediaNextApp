import cloudinary from "cloudinary";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLD_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLD_API_SECR,
});

/**
 * Generate optimized Cloudinary URL with automatic optimizations
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Transformation options
 * @returns {string} Optimized image URL
 */
export const getOptimizedCloudinaryUrl = (publicId, options = {}) => {
  const {
    width = 800,
    height = 800,
    quality = 'auto',
    format = 'auto',
    crop = 'limit',
    fetchFormat = 'auto',
    dpr = 'auto'
  } = options;

  return cloudinary.v2.url(publicId, {
    transformation: [
      {
        width,
        height,
        crop,
        quality,
        fetch_format: fetchFormat,
        f_auto: true, // Auto format selection
        q_auto: true, // Auto quality optimization
        dpr // Auto DPR for retina displays
      }
    ]
  });
};

/**
 * Upload image to Cloudinary with optimizations
 * @param {File|Buffer} file - Image file to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
export const uploadToCloudinary = async (file, options = {}) => {
  const {
    folder = 'social-app',
    quality = 'auto',
    format = 'auto',
    eager = [
      { width: 400, height: 400, crop: 'fill', quality: 'auto', format: 'auto' }, // Thumbnail
      { width: 800, height: 800, crop: 'limit', quality: 'auto', format: 'auto' }, // Medium
      { width: 1200, height: 1200, crop: 'limit', quality: 'auto', format: 'auto' } // Large
    ]
  } = options;

  try {
    // Convert File to base64 if needed
    let uploadSource = file;
    if (file instanceof File) {
      uploadSource = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }

    const result = await cloudinary.v2.uploader.upload(uploadSource, {
      folder,
      quality,
      format,
      eager,
      use_filename: true,
      unique_filename: true,
      overwrite: false
    });

    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

export const cld = globalThis.cloudinary || cloudinary;

if (process.env.NODE_ENV !== "production") globalThis.cloudinary = cld;
