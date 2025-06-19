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

  // Check if user has photos
  const hasPhotos = user.images && user.images.length > 0;
  if (!hasPhotos) {
    missingSteps.push('photos');
    if (!nextStep) nextStep = '/onboarding/photos';
  }

  // Check if user has basic profile info (we'll be flexible here)
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

  const isComplete = hasPhotos && isMarkedComplete;

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
  const completedSteps = totalSteps - status.missingSteps.length;
  const percentage = Math.round((completedSteps / totalSteps) * 100);

  return {
    completedSteps,
    totalSteps,
    percentage,
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