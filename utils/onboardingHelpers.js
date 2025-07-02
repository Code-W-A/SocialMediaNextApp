/**
 * Check onboarding completion status and return next step
 */

export const checkOnboardingStatus = (user) => {
  if (!user) {
    return { 
      isComplete: false, 
      nextStep: '/onboarding/photos', 
      missingSteps: ['photos', 'interests', 'questionnaire'] 
    };
  }

  const missingSteps = [];

  // Check if user has photos (REQUIRED step for all users)
  const hasPhotos = user.images && user.images.length > 0;
  if (!hasPhotos) {
    missingSteps.push('photos');
  }

  // Check if user has selected interests (simplified onboarding)
  const hasInterests = user.interests && Array.isArray(user.interests) && user.interests.length > 0;
  if (!hasInterests) {
    missingSteps.push('interests');
  }

  // Check if user completed questionnaire
  const hasQuestionnaire = user.questionnaire && Object.keys(user.questionnaire).length >= 3;
  if (!hasQuestionnaire) {
    missingSteps.push('questionnaire');
  }

  // Check if onboarding is marked as complete
  const isMarkedComplete = user.onboardingCompleted === true;

  // Onboarding is complete only if ALL steps are completed: photos, interests AND questionnaire
  const isComplete = isMarkedComplete && hasPhotos && hasInterests && hasQuestionnaire;

  // Determine next step based on what's missing
  let nextStep = null;
  if (!isComplete) {
    if (!hasPhotos) {
      nextStep = '/onboarding/photos';
    } else if (!hasInterests) {
      nextStep = '/onboarding/profile';  // Still goes to profile page for interests
    } else if (!hasQuestionnaire) {
      nextStep = '/onboarding/questionnaire';
    } else {
      // All steps completed but not marked as complete
      nextStep = '/onboarding/complete';
    }
  } else {
    // Onboarding is complete, no additional checks needed
    console.log('✅ [checkOnboardingStatus] Onboarding complete, allowing user access');
  }

  return {
    isComplete,
    nextStep,
    missingSteps,
    hasPhotos,
    hasInterests,
    hasQuestionnaire,
    isMarkedComplete
  };
};

/**
 * Check if user has completed essential profile details 
 * This is checked AFTER onboarding completion
 * Only requires bio OR location to be considered complete (not all fields)
 */
export const checkProfileCompleteness = (user) => {
  if (!user) {
    return { 
      isComplete: false, 
      missingFields: ['bio', 'location'] 
    };
  }

  const missingFields = [];

  // Check essential fields - user needs at least bio OR location
  const hasBio = user.bio && user.bio.trim() !== '';
  const hasLocation = user.location && user.location.trim() !== '';
  
  if (!hasBio) {
    missingFields.push('bio');
  }
  if (!hasLocation) {
    missingFields.push('location');
  }

  // Profile is complete if user has at least bio OR location
  const isComplete = hasBio || hasLocation;

  // Optional fields for better profile (not required)
  const optionalFields = [];
  if (!user.website || user.website.trim() === '') {
    optionalFields.push('website');
  }
  if (!user.relationshipStatus || user.relationshipStatus.trim() === '') {
    optionalFields.push('relationshipStatus');
  }

  return {
    isComplete,
    missingFields: isComplete ? [] : missingFields,
    optionalFields,
    completionPercentage: Math.round(((2 - missingFields.length) / 2) * 100)
  };
};

export const getOnboardingProgress = (user) => {
  const status = checkOnboardingStatus(user);
  const totalSteps = 3;
  
  // Calculate completed steps based on what we have
  let completedSteps = 0;
  if (status.hasPhotos) completedSteps++;
  if (status.hasInterests) completedSteps++;
  if (status.hasQuestionnaire) completedSteps++;
  
  const percentage = Math.round((completedSteps / totalSteps) * 100);

  // Use the intelligent next step from checkOnboardingStatus
  const nextStep = status.nextStep;

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
 * Validate and ensure final data structure matches expected format
 * Call this after onboarding completion to fix any inconsistencies
 */
export const validateFinalDataStructure = async (userId, userDoc, db, serverTimestamp) => {
  try {
    console.log('🔍 [validateFinalDataStructure] Starting validation for user:', userId);
    
    const currentData = userDoc.data();
    console.log('📋 [validateFinalDataStructure] Current data:', currentData);
    
    // Ensure all required fields are present with correct types
    const fixedData = {
      // Basic user info - ensure proper types
      firstName: String(currentData.firstName || ''),
      lastName: String(currentData.lastName || ''),
      username: String(currentData.username || ''),
      email: String(currentData.email || ''),
      gender: String(currentData.gender || ''),
      
      // Profile info - ensure proper types
      bio: String(currentData.bio || ''),
      location: String(currentData.location || ''),
      website: String(currentData.website || ''),
      relationshipStatus: String(currentData.relationshipStatus || ''),
      
      // Numeric fields
      age: Number(currentData.age) || null,
      
      // Array fields - ensure they're arrays
      interests: Array.isArray(currentData.interests) ? currentData.interests : [],
      images: Array.isArray(currentData.images) ? currentData.images : [],
      followers: Array.isArray(currentData.followers) ? currentData.followers : [],
      following: Array.isArray(currentData.following) ? currentData.following : [],
      
      // Object fields - ensure proper structure
      questionnaire: currentData.questionnaire && typeof currentData.questionnaire === 'object' 
        ? currentData.questionnaire 
        : null,
      gpsCoordinates: currentData.gpsCoordinates && 
                      typeof currentData.gpsCoordinates === 'object' &&
                      typeof currentData.gpsCoordinates.latitude === 'number' &&
                      typeof currentData.gpsCoordinates.longitude === 'number'
        ? currentData.gpsCoordinates 
        : null,
      
      // Boolean fields
      verified: Boolean(currentData.verified),
      onboardingCompleted: Boolean(currentData.onboardingCompleted),
      
      // Timestamps - preserve existing or create new
      createdAt: currentData.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastTimeActive: currentData.lastTimeActive || serverTimestamp(),
      
      // Presence object - ensure proper structure
      presence: currentData.presence && typeof currentData.presence === 'object'
        ? {
            status: String(currentData.presence.status || 'online'),
            lastActivity: currentData.presence.lastActivity || serverTimestamp()
          }
        : {
            status: 'online',
            lastActivity: serverTimestamp()
          }
    };
    
    console.log('✅ [validateFinalDataStructure] Fixed data structure:', fixedData);
    
    // Only update if there are actual differences
    const needsUpdate = JSON.stringify(currentData) !== JSON.stringify({...currentData, ...fixedData});
    
    if (needsUpdate) {
      const { updateDoc, doc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'Users', userId), fixedData);
      console.log('📝 [validateFinalDataStructure] Updated user document with fixed structure');
    } else {
      console.log('✨ [validateFinalDataStructure] Data structure already correct, no update needed');
    }
    
    return fixedData;
  } catch (error) {
    console.error('❌ [validateFinalDataStructure] Error validating data structure:', error);
    throw error;
  }
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
 * Check if user has completed interests selection during onboarding
 */
export const hasCompletedInterests = (user) => {
  if (!user) return false;
  
  // During onboarding, we only check for interests
  const hasInterests = user.interests && Array.isArray(user.interests) && user.interests.length > 0;
  
  return hasInterests;
};

/**
 * Check overall onboarding completion (simplified)
 */
export const isOnboardingComplete = (user) => {
  if (!user) return false;
  
  const interestsComplete = hasCompletedInterests(user);
  const questionnaireComplete = hasCompletedQuestionnaire(user);
  const hasImages = user.images && Array.isArray(user.images) && user.images.length > 0;
  
  console.log("🔍 [isOnboardingComplete] Overall check:", {
    interestsComplete,
    questionnaireComplete,
    hasImages,
    onboardingCompleted: user.onboardingCompleted
  });
  
  return interestsComplete && questionnaireComplete && hasImages;
};

/**
 * Check if user should be redirected to complete profile
 * This is used after onboarding completion
 * DISABLED: No longer forcing profile completion
 */
export const shouldCompleteProfile = (user) => {
  // Always return false - no forced profile completion
  return false;
};