// Premium feature limits and checks

// Remove all limits - everyone has unlimited access
export const FREE_LIMITS = {
  DAILY_POSTS: Infinity,
  DAILY_FEED_VIEWS: Infinity,
  DAILY_MATCHES: Infinity,
  ACTIVE_CONVERSATIONS: Infinity,
  SUPER_LIKES: Infinity,
  REWINDS: Infinity,
  BOOSTS: Infinity,
};

// Premium tier limits - same as free now
export const PREMIUM_LIMITS = {
  DAILY_POSTS: Infinity,
  DAILY_FEED_VIEWS: Infinity,
  DAILY_MATCHES: Infinity,
  ACTIVE_CONVERSATIONS: Infinity,
  SUPER_LIKES: Infinity,
  REWINDS: Infinity,
  BOOSTS: Infinity,
};

// Feature types
export const FEATURES = {
  UNLIMITED_POSTS: 'unlimited_posts',
  UNLIMITED_FEED: 'unlimited_feed',
  UNLIMITED_MATCHES: 'unlimited_matches',
  UNLIMITED_MESSAGES: 'unlimited_messages',
  DETAILED_COMPATIBILITY: 'detailed_compatibility',
  SUPER_LIKES: 'super_likes',
  PROFILE_BOOST: 'profile_boost',
  PRIORITY_MESSAGES: 'priority_messages',
  WHO_LIKED_ME: 'who_liked_me',
  ADVANCED_FILTERS: 'advanced_filters',
  UNLIMITED_ONLINE_STATUS: 'unlimited_online_status',
  REWIND: 'rewind',
  VERIFIED_BADGE: 'verified_badge',
};

// Check if user has premium subscription
export const isPremiumUser = (userSubscription) => {
  // Check for V1 migration users
  if (userSubscription?.type === 'v1_migration' && userSubscription?.status === 'active') {
    return true;
  }
  
  // Check if user has subscriptionActive property (auto-grant premium)
  if (userSubscription?.subscriptionActive !== undefined) {
    return true;
  }
  
  // Check standard premium status
  return userSubscription?.isPremium || userSubscription?.status === 'active' || false;
};

// Check if user can access a specific feature - everyone can access everything now
export const canAccessFeature = (feature, userSubscription) => {
  // All features are available to everyone
  return true;
};

// Get user's daily limits - everyone has unlimited
export const getUserLimits = (userSubscription) => {
  // Everyone gets unlimited access
  return PREMIUM_LIMITS;
};

// Check if user has reached daily limit - always false now
export const hasReachedDailyLimit = (action, count, userSubscription) => {
  return false;
};

// Get remaining daily actions - always infinity
export const getRemainingDailyActions = (action, count, userSubscription) => {
  return Infinity;
};

// Premium feature descriptions for UI
export const PREMIUM_FEATURES_DESCRIPTIONS = {
  priority_compatibility: {
    title: 'Prioritate în Compatibilități',
    description: 'Primești mai multe compatibilități și apari primul în listele celorlalți',
    icon: 'eva:heart-fill',
  },
  verified_badge: {
    title: 'Insignă Premium',
    description: 'Profilul tău va avea o insignă specială care arată că ești un utilizator premium',
    icon: 'eva:shield-fill',
  },
  priority_support: {
    title: 'Suport Prioritar',
    description: 'Acces la suport dedicat cu răspuns rapid',
    icon: 'eva:headphones-fill',
  },
  profile_boost: {
    title: 'Vizibilitate Crescută',
    description: 'Profilul tău va fi evidențiat și va apărea mai sus în căutări',
    icon: 'eva:trending-up-fill',
  },
  exclusive_features: {
    title: 'Funcții Exclusive',
    description: 'Acces timpuriu la funcții noi și experimentale',
    icon: 'eva:star-fill',
  },
};

// Get premium upgrade prompts - updated message
export const getPremiumUpgradePrompt = (feature) => {
  return {
    title: 'Devino Premium',
    message: 'Cu abonamentul Premium de doar 5€/lună, vei primi prioritate în compatibilități și alte beneficii exclusive!',
    features: Object.values(PREMIUM_FEATURES_DESCRIPTIONS),
  };
};

// Check if user can perform action - always true now
export const canPerformAction = (action, dailyUsage, userSubscription) => {
  return { canPerform: true, remaining: Infinity };
}; 