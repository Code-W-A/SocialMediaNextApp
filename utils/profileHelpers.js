import { getMainProfileImage } from './imageHelpers';

/**
 * Check if profile data is complete
 * @param {Object} userData - User data object
 * @param {Object} currentUser - Current logged in user (for profile image fallback)
 * @returns {Object} Profile completion status
 */
export const checkProfileCompletion = (userData, currentUser = null) => {
  if (!userData) return { isComplete: false, missingFields: [] };

  const missingFields = [];
  const userInfo = userData.data || userData;

  // Check for essential profile fields
  if (!userInfo.first_name && !userInfo.firstName) missingFields.push('First Name');
  if (!userInfo.last_name && !userInfo.lastName) missingFields.push('Last Name');
  if (!userInfo.username) missingFields.push('Username');
  if (!userInfo.bio) missingFields.push('Bio');
  
  // Check for profile image from different possible sources
  const hasProfileImage = userInfo.image_url || 
                         userInfo.imageUrl || 
                         getMainProfileImage(userInfo.images) !== "/images/placeholder-avatar.png" ||
                         (currentUser && getMainProfileImage(currentUser?.images) !== "/images/placeholder-avatar.png");
  
  if (!hasProfileImage) missingFields.push('Profile Picture');

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completionPercentage: Math.round(((5 - missingFields.length) / 5) * 100)
  };
};

/**
 * Get display name with fallbacks for different data structures
 * @param {Object} userData - User data object
 * @returns {string} Display name
 */
export const getDisplayName = (userData) => {
  if (!userData) return "Unknown User";
  const userInfo = userData.data || userData;
  
  // Try different combinations of name fields
  if (userInfo.first_name && userInfo.last_name) {
    return `${userInfo.first_name} ${userInfo.last_name}`;
  }
  if (userInfo.firstName && userInfo.lastName) {
    return `${userInfo.firstName} ${userInfo.lastName}`;
  }
  if (userInfo.first_name) return userInfo.first_name;
  if (userInfo.firstName) return userInfo.firstName;
  if (userInfo.username) return userInfo.username;
  if (userInfo.email) return userInfo.email.split('@')[0];
  
  return userInfo.username || userInfo.email?.split('@')[0] || "Unknown User";
};

/**
 * Get username with fallbacks for different data structures
 * @param {Object} userData - User data object
 * @returns {string} Username
 */
export const getUsername = (userData) => {
  if (!userData) return "unknown";
  const userInfo = userData.data || userData;
  
  if (userInfo.username) return userInfo.username;
  if (userInfo.email) return userInfo.email.split('@')[0];
  if (userInfo.first_name) return userInfo.first_name.toLowerCase();
  if (userInfo.firstName) return userInfo.firstName.toLowerCase();
  
  return "unknown";
};

/**
 * Get user display name for URL query parameter with fallbacks
 * @param {Object} user - User object
 * @returns {string} Display name for URL
 */
export const getUserDisplayName = (user) => {
  if (!user) return "unknown";
  
  // Try multiple name properties
  if (user.firstName) return user.firstName;
  if (user.first_name) return user.first_name;
  if (user.username) return user.username;
  if (user.email) return user.email.split('@')[0];
  
  return "user";
};

/**
 * Get profile image with multiple fallbacks
 * @param {Object} userData - User data object
 * @param {Object} currentUser - Current logged in user
 * @param {boolean} isCurrentUserProfile - Whether this is current user's profile
 * @returns {string} Profile image URL
 */
export const getProfileImage = (userData, currentUser = null, isCurrentUserProfile = false) => {
  if (isCurrentUserProfile && currentUser) {
    // For current user, try multiple sources
    return getMainProfileImage(currentUser?.images) || 
           currentUser?.imageUrl || 
           currentUser?.image_url || 
           userData?.data?.image_url || 
           "/images/placeholder-avatar.png";
  } else {
    // For other users
    return userData?.data?.image_url || 
           getMainProfileImage(userData?.data?.images) || 
           "/images/placeholder-avatar.png";
  }
};

/**
 * Check if user data has all required fields for basic functionality
 * @param {Object} userData - User data object
 * @returns {boolean} Whether user has minimum required data
 */
export const hasMinimumProfileData = (userData) => {
  if (!userData) return false;
  const userInfo = userData.data || userData;
  
  // At minimum, user should have either name or username
  return (userInfo.first_name || userInfo.firstName || userInfo.username || userInfo.email);
};

/**
 * Get profile completion message based on missing fields
 * @param {Array} missingFields - Array of missing field names
 * @returns {string} Completion message
 */
export const getProfileCompletionMessage = (missingFields) => {
  if (missingFields.length === 0) return "Your profile is complete!";
  if (missingFields.length === 1) return `Add your ${missingFields[0].toLowerCase()} to complete your profile.`;
  return `Complete your profile by adding: ${missingFields.join(', ').toLowerCase()}.`;
}; 