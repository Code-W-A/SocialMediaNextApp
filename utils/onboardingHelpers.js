/**
 * Check onboarding completion status and return next step
 */

export const checkOnboardingStatus = (user) => {
  if (!user) {
    return { 
      isComplete: false, 
      nextStep: '/onboarding', 
      missingSteps: ['photos', 'profile', 'questionnaire'] 
    };
  }

  const missingSteps = [];
  let nextStep = null;

  // Check if user has photos (REQUIRED step for all users)
  const hasPhotos = user.images && user.images.length > 0;
  if (!hasPhotos) {
    missingSteps.push('photos');
    if (!nextStep) nextStep = '/onboarding/photos';
  }

  // Check if user has basic profile info
  const hasProfile = user.bio || user.location || user.interests?.length > 0;
  if (!hasProfile) {
    missingSteps.push('profile');
    if (!nextStep) nextStep = '/onboarding/profile';
  }

  // Check if user completed questionnaire
  const hasQuestionnaire = user.questionnaire && Object.keys(user.questionnaire).length >= 3;
  if (!hasQuestionnaire) {
    missingSteps.push('questionnaire');
    if (!nextStep) nextStep = '/onboarding/questionnaire';
  }

  // Check if onboarding is marked as complete
  const isMarkedComplete = user.onboardingCompleted === true;

  // Onboarding is complete only if ALL steps are completed: photos, profile AND questionnaire
  const isComplete = isMarkedComplete && hasPhotos && hasProfile && hasQuestionnaire;

  return {
    isComplete,
    nextStep: isComplete ? null : (nextStep || '/onboarding'),
    missingSteps,
    hasPhotos,
    hasProfile,
    hasQuestionnaire,
    isMarkedComplete
  };
};

export const getOnboardingProgress = (user) => {
  const status = checkOnboardingStatus(user);
  const totalSteps = 3;
  
  // Calculate completed steps based on what we have
  let completedSteps = 0;
  if (status.hasPhotos) completedSteps++;
  if (status.hasProfile) completedSteps++;
  if (status.hasQuestionnaire) completedSteps++;
  
  const percentage = Math.round((completedSteps / totalSteps) * 100);

  // Determine next step based on what's missing
  let nextStep = '/onboarding';
  if (!status.hasPhotos) {
    nextStep = '/onboarding/photos';
  } else if (!status.hasProfile) {
    nextStep = '/onboarding/profile';
  } else if (!status.hasQuestionnaire) {
    nextStep = '/onboarding/questionnaire';
  }

  return {
    completedSteps,
    totalSteps,
    percentage,
    nextStep,
    ...status
  };
};

export const shouldRedirectToOnboarding = (user, currentPath) => {
  // Don't redirect if user is already on onboarding pages
  if (currentPath?.startsWith('/onboarding')) {
    return false;
  }

  // Don't redirect if user is on auth pages
  if (currentPath?.includes('/sign-in') || currentPath?.includes('/sign-up')) {
    return false;
  }

  const status = checkOnboardingStatus(user);
  return !status.isComplete;
};

/**
 * Check if user has completed questionnaire
 * Centralized function to avoid inconsistencies
 */
export const hasCompletedQuestionnaire = (user) => {
  if (!user) {
    console.log("❌ [hasCompletedQuestionnaire] No user provided");
    return false;
  }

  console.log("🔍 [hasCompletedQuestionnaire] Checking for user:", user.id || 'unknown');
  console.log("📊 [hasCompletedQuestionnaire] User questionnaire:", user.questionnaire);
  console.log("📊 [hasCompletedQuestionnaire] Questionnaire keys:", 
    user.questionnaire ? Object.keys(user.questionnaire) : "no questionnaire");

  // Check if questionnaire object exists
  const hasQuestionnaireObject = user?.questionnaire && 
    typeof user.questionnaire === 'object' && 
    !Array.isArray(user.questionnaire);

  if (!hasQuestionnaireObject) {
    console.log("❌ [hasCompletedQuestionnaire] No questionnaire object found");
    return false;
  }

  // Check for required fields
  const hasZodiacSign = user.questionnaire.zodiacSign && 
    user.questionnaire.zodiacSign.trim() !== '';
  const hasBirthDate = user.questionnaire.birthDate && 
    user.questionnaire.birthDate.trim() !== '';
  const hasRelationshipType = user.questionnaire.relationshipType && 
    user.questionnaire.relationshipType.trim() !== '';

  console.log("🔍 [hasCompletedQuestionnaire] Field checks:", {
    hasZodiacSign,
    hasBirthDate,
    hasRelationshipType,
    zodiacSign: user.questionnaire.zodiacSign,
    birthDate: user.questionnaire.birthDate,
    relationshipType: user.questionnaire.relationshipType
  });

  // All three required fields must be present
  const isComplete = hasZodiacSign && hasBirthDate && hasRelationshipType;

  console.log(`${isComplete ? '✅' : '❌'} [hasCompletedQuestionnaire] Result: ${isComplete}`);
  
  return isComplete;
};

/**
 * Debug function to check user data completeness
 */
export const debugUserData = (user, context = 'unknown') => {
  if (!user) {
    console.log(`🐛 [${context}] No user data available`);
    return;
  }

  console.log(`🐛 [${context}] User Debug:`, {
    id: user.id,
    hasQuestionnaire: !!user.questionnaire,
    questionnaireType: typeof user.questionnaire,
    questionnaireKeys: user.questionnaire ? Object.keys(user.questionnaire) : [],
    onboardingCompleted: user.onboardingCompleted,
    bio: user.bio ? 'present' : 'missing',
    relationshipStatus: user.relationshipStatus ? 'present' : 'missing',
    location: user.location ? 'present' : 'missing',
    interests: user.interests ? `${user.interests.length} items` : 'missing'
  });

  if (user.questionnaire) {
    console.log(`🐛 [${context}] Questionnaire Details:`, user.questionnaire);
  }
};

/**
 * Check if user has completed basic profile info during onboarding
 */
export const hasCompletedProfile = (user) => {
  if (!user) return false;
  
  // At minimum, should have bio OR location OR interests
  const hasBio = user.bio && user.bio.trim() !== '';
  const hasLocation = user.location && user.location.trim() !== '';
  const hasInterests = user.interests && Array.isArray(user.interests) && user.interests.length > 0;
  
  return hasBio || hasLocation || hasInterests;
};

/**
 * Check overall onboarding completion
 */
export const isOnboardingComplete = (user) => {
  if (!user) return false;
  
  const profileComplete = hasCompletedProfile(user);
  const questionnaireComplete = hasCompletedQuestionnaire(user);
  const hasImages = user.images && Array.isArray(user.images) && user.images.length > 0;
  
  console.log("🔍 [isOnboardingComplete] Overall check:", {
    profileComplete,
    questionnaireComplete,
    hasImages,
    onboardingCompleted: user.onboardingCompleted
  });
  
  return profileComplete && questionnaireComplete && hasImages;
}; 