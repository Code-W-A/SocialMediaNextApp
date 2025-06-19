import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

// Mock currentUser function to replace mockAuth's currentUser
export const currentUser = async () => {
  if (auth.currentUser) {
    try {
      const userDoc = await getDoc(doc(db, 'Users', auth.currentUser.uid));
      if (userDoc.exists()) {
        return {
          id: auth.currentUser.uid,
          email: auth.currentUser.email,
          ...userDoc.data()
        };
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
    
    // Update Firebase user profile
    const displayName = username || `${firstName} ${lastName}`.trim();
    await updateProfile(firebaseUser, { displayName });

    // Create user document in Firestore with the existing structure
    const userData = {
      email,
      username: displayName,
      gender: gender || 'other',
      firstName,
      lastName,
      images: [], // Empty array for profile images initially, matching existing structure
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // Add any other default fields
      bio: '',
      location: '',
      website: '',
      verified: false,
      followers: [],
      following: []
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

// Mock authentication provider for compatibility
export const MockAuthProvider = ({ children }) => {
  return children;
}; 