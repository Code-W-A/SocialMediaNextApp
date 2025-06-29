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

  // Check for essential profile fields - be more flexible with field names
  const hasFirstName = userInfo.first_name || userInfo.firstName || 
                      currentUser?.first_name || currentUser?.firstName;
  const hasLastName = userInfo.last_name || userInfo.lastName || 
                     currentUser?.last_name || currentUser?.lastName;
  const hasUsername = userInfo.username || currentUser?.username || 
                     userInfo.email?.split('@')[0] || currentUser?.email?.split('@')[0];
  
  if (!hasFirstName) missingFields.push('First Name');
  if (!hasLastName) missingFields.push('Last Name');
  if (!hasUsername) missingFields.push('Username');
  if (!userInfo.bio && !currentUser?.bio) missingFields.push('Bio');
  
  // Check for profile image from different possible sources - be more lenient
  const hasProfileImage = userInfo.image_url || 
                         userInfo.imageUrl || 
                         currentUser?.image_url ||
                         currentUser?.imageUrl ||
                         (userInfo.images && userInfo.images.length > 0) ||
                         (currentUser?.images && currentUser.images.length > 0) ||
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
 * Get display name with multiple fallbacks
 * @param {Object} userData - User data object
 * @returns {string} Display name
 */
export const getDisplayName = (userData) => {
  if (!userData) return 'Unknown User';
  
  const user = userData.data || userData;
  
  // Try multiple combinations for display name
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  
  if (user.firstName || user.first_name) {
    return user.firstName || user.first_name;
  }
  
  if (user.username) {
    return user.username;
  }
  
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  return 'Unknown User';
};

/**
 * Get username with multiple fallbacks
 * @param {Object} userData - User data object
 * @returns {string} Username
 */
export const getUsername = (userData) => {
  if (!userData) return '';
  
  const user = userData.data || userData;
  
  return user.username || user.email?.split('@')[0] || '';
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
 * Get bio with fallbacks
 * @param {Object} userData - User data object
 * @param {Object} currentUser - Current logged in user
 * @returns {string} Bio text
 */
export const getBio = (userData, currentUser = null) => {
  const user = userData?.data || userData;
  return user?.bio || currentUser?.bio || '';
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

/**
 * Check if user must be forced to complete profile before accessing the app
 * @param {Object} userData - User data object  
 * @param {Object} currentUser - Current logged in user
 * @returns {boolean} Whether user should be forced to complete profile
 */
export const shouldForceProfileCompletion = (userData, currentUser = null) => {
  if (!userData && !currentUser) return true;
  
  const profileCompletion = checkProfileCompletion(userData, currentUser);
  
  // More lenient check - only force if missing critical fields
  const criticalFields = ['First Name', 'Last Name'];
  const missingCriticalFields = profileCompletion.missingFields.filter(field => 
    criticalFields.includes(field)
  );
  
  // Only force completion if missing critical fields AND user has no username at all
  const user = userData?.data || userData || currentUser;
  const hasAnyIdentifier = user?.username || user?.email || 
                          user?.firstName || user?.first_name ||
                          user?.lastName || user?.last_name;
  
  return missingCriticalFields.length > 0 && !hasAnyIdentifier;
};

/**
 * Check if current path should bypass profile completion check
 * @param {string} pathname - Current path
 * @returns {boolean} Whether to bypass profile completion check
 */
export const shouldBypassProfileCompletion = (pathname) => {
  const allowedPaths = [
    '/sign-in',
    '/sign-up', 
    '/onboarding',
    '/api',
    '/profile', // Allow access to profile pages to complete profile
    '/settings' // Allow access to settings
  ];
  
  return allowedPaths.some(path => pathname?.startsWith(path));
};

/**
 * Check if navigation should be blocked due to incomplete profile
 * @param {Object} user - Current user object
 * @param {string} targetPath - The path user is trying to navigate to
 * @returns {boolean} Whether navigation should be blocked
 */
export const shouldBlockNavigation = (user, targetPath) => {
  // Allow navigation to profile pages and auth pages
  if (shouldBypassProfileCompletion(targetPath)) {
    return false;
  }
  
  // Check if user needs to complete profile
  return shouldForceProfileCompletion({ data: user }, user);
}; 