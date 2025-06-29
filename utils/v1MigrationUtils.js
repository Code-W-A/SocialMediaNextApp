// Properties that indicate a V1 user
const V1_INDICATORS = [
  'subscriptionActive',
  'subName',
  'subscriptionType',
  'subscriptionStatus',
  'premiumActive',
  'premiumUser',
  'paidUser',
  'subscriptionId',
  'stripeCustomerId'
];

/**
 * Check if a user is a V1 user based on their properties
 */
export const isV1User = (userData) => {
  if (!userData) return false;
  
  // Check if user has any V1 subscription indicators
  return V1_INDICATORS.some(property => {
    const value = userData[property];
    return value !== undefined && value !== null && value !== false && value !== '';
  });
};

/**
 * Check if a user has already been migrated to V2 premium
 */
export const isV1UserMigrated = (userData) => {
  return userData?.v1Migration?.completed === true;
};

/**
 * Get V1 properties from user data
 */
export const getV1Properties = (userData) => {
  return V1_INDICATORS.filter(prop => userData?.[prop] !== undefined);
};

/**
 * Get V1 indicators array (for external use)
 */
export const getV1Indicators = () => {
  return [...V1_INDICATORS];
}; 