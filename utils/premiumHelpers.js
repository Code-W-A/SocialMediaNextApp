/**
 * Premium subscription helpers and utilities
 * This file contains all premium-related logic and validations
 */

// Premium feature limits and checks

// Free tier limits
export const FREE_LIMITS = {
  DAILY_POSTS: 2,
  DAILY_FEED_VIEWS: 5,
  DAILY_MATCHES: 3,
  ACTIVE_CONVERSATIONS: 3,
  SUPER_LIKES: 0,
  REWINDS: 0,
  BOOSTS: 0,
};

// Premium tier limits
export const PREMIUM_LIMITS = {
  DAILY_POSTS: Infinity,
  DAILY_FEED_VIEWS: Infinity,
  DAILY_MATCHES: Infinity,
  ACTIVE_CONVERSATIONS: Infinity,
  SUPER_LIKES: 5,
  REWINDS: 3,
  BOOSTS: 3, // 3 hours per week
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

// Premium feature descriptions for UI
export const PREMIUM_FEATURES_DESCRIPTIONS = {
  priority_matching: "Get higher priority in compatibility matching",
  premium_badge: "Show premium badge on your profile",
  enhanced_visibility: "Your profile appears higher in searches",
  priority_support: "Access to dedicated premium support",
  early_features: "Early access to new features",
  unlimited_likes: "Unlimited likes and super likes",
  advanced_filters: "Advanced search and filtering options",
  read_receipts: "See when messages are read",
  boost_profile: "Weekly profile boost for better visibility"
};

// Subscription status constants
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  TRIALING: 'trialing',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
  UNPAID: 'unpaid',
  INCOMPLETE: 'incomplete',
  INCOMPLETE_EXPIRED: 'incomplete_expired',
  PAUSED: 'paused'
};

// Valid premium statuses (user should have premium benefits)
export const VALID_PREMIUM_STATUSES = [
  SUBSCRIPTION_STATUS.ACTIVE,
  SUBSCRIPTION_STATUS.TRIALING,
  SUBSCRIPTION_STATUS.PAST_DUE // Grace period for failed payments
];

// Invalid premium statuses (user should lose premium benefits)
export const INVALID_PREMIUM_STATUSES = [
  SUBSCRIPTION_STATUS.CANCELED,
  SUBSCRIPTION_STATUS.UNPAID,
  SUBSCRIPTION_STATUS.INCOMPLETE,
  SUBSCRIPTION_STATUS.INCOMPLETE_EXPIRED,
  SUBSCRIPTION_STATUS.PAUSED
];

/**
 * Check if a user has active premium subscription
 * @param {Object} user - User object from Firestore
 * @returns {boolean} - True if user has premium access
 */
export const isPremiumUser = (user) => {
  try {
    if (!user || !user.subscription) {
      return false;
    }

    const subscription = user.subscription;
    
    // Check if subscription exists and has valid status
    if (!subscription.status) {
      return false;
    }

    // Check if status is in valid premium statuses
    const hasValidStatus = VALID_PREMIUM_STATUSES.includes(subscription.status);
    
    if (!hasValidStatus) {
      return false;
    }

    // Additional validation for past_due status - check if within grace period (7 days)
    if (subscription.status === SUBSCRIPTION_STATUS.PAST_DUE) {
      const gracePeriodDays = 7;
      const lastPaymentFailure = subscription.lastPaymentFailureDate;
      
      if (lastPaymentFailure) {
        const failureDate = new Date(lastPaymentFailure.seconds ? 
          lastPaymentFailure.seconds * 1000 : lastPaymentFailure);
        const gracePeriodEnd = new Date(failureDate.getTime() + (gracePeriodDays * 24 * 60 * 60 * 1000));
        
        if (new Date() > gracePeriodEnd) {
          return false; // Grace period expired
        }
      }
    }

    // Check if subscription has expired
    if (subscription.currentPeriodEnd) {
      const endDate = subscription.currentPeriodEnd.seconds ? 
        new Date(subscription.currentPeriodEnd.seconds * 1000) : 
        new Date(subscription.currentPeriodEnd);
      
      // If subscription is canceled and period has ended, no premium access
      if (subscription.cancelAtPeriodEnd && new Date() > endDate) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
};

/**
 * Get detailed premium subscription information
 * @param {Object} user - User object from Firestore
 * @returns {Object|null} - Premium subscription details or null
 */
export const getPremiumSubscriptionInfo = (user) => {
  try {
    if (!isPremiumUser(user)) {
      return null;
    }

    const subscription = user.subscription;
    
    // Parse dates safely
    const parseDate = (dateField) => {
      if (!dateField) return null;
      if (dateField.seconds) return new Date(dateField.seconds * 1000);
      if (dateField._seconds) return new Date(dateField._seconds * 1000);
      return new Date(dateField);
    };

    const currentPeriodEnd = parseDate(subscription.currentPeriodEnd);
    const currentPeriodStart = parseDate(subscription.currentPeriodStart);
    const lastPaymentDate = parseDate(subscription.lastPaymentDate);
    const lastPaymentFailureDate = parseDate(subscription.lastPaymentFailureDate);

    // Calculate days until renewal/expiration
    const daysUntilRenewal = currentPeriodEnd ? 
      Math.ceil((currentPeriodEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

    // Check if subscription is expiring soon (within 7 days)
    const isExpiringSoon = daysUntilRenewal !== null && daysUntilRenewal <= 7 && daysUntilRenewal > 0;

    // Check if subscription has payment issues
    const hasPaymentIssues = subscription.status === SUBSCRIPTION_STATUS.PAST_DUE ||
      subscription.lastPaymentStatus === 'failed';

    return {
      status: subscription.status,
      isActive: subscription.status === SUBSCRIPTION_STATUS.ACTIVE,
      isTrialing: subscription.status === SUBSCRIPTION_STATUS.TRIALING,
      isPastDue: subscription.status === SUBSCRIPTION_STATUS.PAST_DUE,
      
      // Dates
      currentPeriodStart,
      currentPeriodEnd,
      lastPaymentDate,
      lastPaymentFailureDate,
      
      // Billing info
      customerId: subscription.customerId,
      subscriptionId: subscription.subscriptionId,
      priceId: subscription.priceId,
      
      // Status flags
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd || false,
      daysUntilRenewal,
      isExpiringSoon,
      hasPaymentIssues,
      
      // Payment info
      lastPaymentStatus: subscription.lastPaymentStatus,
      paymentFailureReason: subscription.paymentFailureReason,
      
      // Metadata
      checkoutCompleted: subscription.checkoutCompleted || false,
      renewalReminderSent: subscription.renewalReminderSent || false,
      trialEndingNotified: subscription.trialEndingNotified || false
    };
  } catch (error) {
    console.error('Error getting premium subscription info:', error);
    return null;
  }
};

/**
 * Check if user should receive premium features
 * This is the main function to use for feature gating
 * @param {Object} user - User object from Firestore
 * @returns {boolean} - True if user should have premium features
 */
export const shouldShowPremiumFeatures = (user) => {
  return isPremiumUser(user);
};

/**
 * Get premium badge props for UI components
 * @param {Object} user - User object from Firestore
 * @returns {Object|null} - Badge props or null if not premium
 */
export const getPremiumBadgeProps = (user) => {
  if (!isPremiumUser(user)) {
    return null;
  }

  const info = getPremiumSubscriptionInfo(user);
  if (!info) return null;

  let badgeColor = 'gold';
  let badgeText = 'Premium';
  
  if (info.isTrialing) {
    badgeColor = 'blue';
    badgeText = 'Premium Trial';
  } else if (info.isPastDue) {
    badgeColor = 'orange';
    badgeText = 'Premium (Payment Due)';
  } else if (info.cancelAtPeriodEnd) {
    badgeColor = 'volcano';
    badgeText = 'Premium (Ending Soon)';
  }

  return {
    color: badgeColor,
    text: badgeText,
    status: info.status,
    isExpiringSoon: info.isExpiringSoon,
    hasPaymentIssues: info.hasPaymentIssues
  };
};

/**
 * Validate subscription webhook data
 * @param {Object} subscription - Stripe subscription object
 * @returns {boolean} - True if subscription data is valid
 */
export const validateSubscriptionWebhookData = (subscription) => {
  try {
    // Essential required fields (always present in Stripe webhooks)
    const essentialFields = ['id', 'customer', 'status'];
    
    for (const field of essentialFields) {
      if (!subscription[field]) {
        console.error(`Missing essential field in subscription webhook: ${field}`);
        return false;
      }
    }

    // Validate status
    const validStatuses = Object.values(SUBSCRIPTION_STATUS);
    if (!validStatuses.includes(subscription.status)) {
      console.error(`Invalid subscription status: ${subscription.status}`);
      return false;
    }

    // Validate metadata contains userId
    if (!subscription.metadata?.userId) {
      console.error('Missing userId in subscription metadata');
      return false;
    }

    // Optional date validation (only if both dates are present)
    if (subscription.current_period_start && subscription.current_period_end) {
      const currentPeriodStart = new Date(subscription.current_period_start * 1000);
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      
      if (currentPeriodEnd <= currentPeriodStart) {
        console.error('Invalid subscription period: end date must be after start date');
        return false;
      }
    } else {
      console.log('ℹ️ Note: current_period_start/end not present in this webhook event (this is normal for some Stripe events)');
    }

    console.log('✅ Subscription webhook validation passed');
    return true;
  } catch (error) {
    console.error('Error validating subscription webhook data:', error);
    return false;
  }
};

/**
 * Check if user needs premium upgrade prompt
 * @param {Object} user - User object from Firestore
 * @returns {boolean} - True if should show upgrade prompt
 */
export const shouldShowUpgradePrompt = (user) => {
  if (isPremiumUser(user)) {
    return false;
  }

  // Could add logic here for:
  // - Users who have been active for X days
  // - Users who have used certain features
  // - Users who have reached free tier limits
  
  return true;
};

// Get user's daily limits
export const getUserLimits = (userSubscription) => {
  const isPremium = isPremiumUser(userSubscription);
  return isPremium ? PREMIUM_LIMITS : FREE_LIMITS;
};

// Check if user has reached daily limit for a specific action
export const hasReachedDailyLimit = (action, count, userSubscription) => {
  const limits = getUserLimits(userSubscription);
  const limit = limits[action];
  
  if (limit === Infinity) {
    return false;
  }
  
  return count >= limit;
};

// Get remaining daily actions
export const getRemainingDailyActions = (action, count, userSubscription) => {
  const limits = getUserLimits(userSubscription);
  const limit = limits[action];
  
  if (limit === Infinity) {
    return Infinity;
  }
  
  return Math.max(0, limit - count);
};

// Get premium upgrade prompts
export const getPremiumUpgradePrompt = (feature) => {
  const featureInfo = PREMIUM_FEATURES_DESCRIPTIONS[feature];
  
  return {
    title: 'Upgrade la Premium',
    message: `Pentru a accesa ${featureInfo?.title || 'această funcționalitate'}, ai nevoie de un abonament Premium.`,
    features: Object.values(PREMIUM_FEATURES_DESCRIPTIONS),
  };
};

// Check if user can perform action based on daily usage
export const canPerformAction = (action, dailyUsage, userSubscription) => {
  const limits = getUserLimits(userSubscription);
  const currentUsage = dailyUsage[action] || 0;
  const limit = limits[action.toUpperCase()];
  
  if (limit === Infinity) {
    return { canPerform: true, remaining: Infinity };
  }
  
  const canPerform = currentUsage < limit;
  const remaining = Math.max(0, limit - currentUsage);
  
  return { canPerform, remaining, limit };
};

// Export everything as default object as well for easier importing
export default {
  PREMIUM_FEATURES_DESCRIPTIONS,
  SUBSCRIPTION_STATUS,
  VALID_PREMIUM_STATUSES,
  INVALID_PREMIUM_STATUSES,
  isPremiumUser,
  getPremiumSubscriptionInfo,
  shouldShowPremiumFeatures,
  getPremiumBadgeProps,
  validateSubscriptionWebhookData,
  shouldShowUpgradePrompt,
  getUserLimits,
  hasReachedDailyLimit,
  getRemainingDailyActions,
  getPremiumUpgradePrompt,
  canPerformAction
}; 