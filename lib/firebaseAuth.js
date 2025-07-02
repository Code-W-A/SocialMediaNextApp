import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { serializeFirebaseData } from '@/utils/firebaseHelpers';

// Mock currentUser function to replace mockAuth's currentUser
export const currentUser = async () => {
  if (auth.currentUser) {
    try {
      const userDoc = await getDoc(doc(db, 'Users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = {
          id: auth.currentUser.uid,
          email: auth.currentUser.email,
          ...userDoc.data()
        };
        return serializeFirebaseData(userData);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  }
  return null;
};

// Mock useUser hook to replace mockAuth's useUser
export const useUser = () => {
  const user = auth.currentUser;
  return {
    user: user ? { 
      id: user.uid, 
      email: user.email,
      first_name: user.displayName?.split(' ')[0] || '',
      last_name: user.displayName?.split(' ')[1] || '',
      email_addresses: [{ email_address: user.email }]
    } : null,
    isLoaded: true,
    isSignedIn: !!user,
  };
};

// Firebase sign in function
export const signIn = async (email, password) => {
  try {
    const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: firebaseUser };
  } catch (error) {
    console.error('Sign in error:', error);
    let errorMessage = 'Failed to sign in';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later';
        break;
      default:
        errorMessage = error.message;
    }
    
    return { 
      success: false, 
      error: errorMessage 
    };
  }
};

// Firebase sign up function
export const signUp = async ({ email, password, firstName, lastName, username, gender }) => {
  try {
    // Create Firebase user
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update Firebase user profile - use proper username, not display name
    await updateProfile(firebaseUser, { displayName: `${firstName} ${lastName}` });

    // Create user document in Firestore with the correct structure
    const userData = {
      email,
      firstName,
      lastName,
      username: username || `${firstName.toLowerCase()}_${lastName.toLowerCase()}`, // Proper username
      gender: gender || 'other',
      images: [], // Empty array for profile images initially, matching existing structure
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // Profile fields - initialize as empty but present
      bio: '',
      location: '',
      website: '',
      relationshipStatus: '',
      interests: [],
      // Social fields
      verified: false,
      followers: [],
      following: [],
      // Onboarding fields - will be filled during onboarding
      age: null,
      questionnaire: null,
      gpsCoordinates: null,
      onboardingCompleted: false,
      // Presence tracking
      presence: {
        status: 'online',
        lastActivity: serverTimestamp()
      },
      lastTimeActive: serverTimestamp()
    };

    await setDoc(doc(db, 'Users', firebaseUser.uid), userData);

    return { 
      success: true, 
      user: {
        ...firebaseUser,
        id: firebaseUser.uid,
        email_addresses: [{ email_address: email }],
        first_name: firstName,
        last_name: lastName
      }
    };
  } catch (error) {
    console.error('Sign up error:', error);
    let errorMessage = 'Failed to create account';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'An account with this email already exists';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password is too weak';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      default:
        errorMessage = error.message;
    }
    
    return { 
      success: false, 
      error: errorMessage 
    };
  }
};

// Firebase sign out function
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to sign out' 
    };
  }
};

// Firebase password reset function
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    let errorMessage = 'Failed to send reset email';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email address';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many requests. Please try again later';
        break;
      default:
        errorMessage = error.message;
    }
    
    return { 
      success: false, 
      error: errorMessage 
    };
  }
};

// Mock authentication provider for compatibility
export const MockAuthProvider = ({ children }) => {
  return children;
}; 