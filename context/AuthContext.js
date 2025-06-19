"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { mockCurrentUser } from '@/mock/mockData';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { updateLastTimeActive } from '@/actions/user';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const lastUpdateRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'Users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userObj = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              ...userData
            };
            console.log('User data loaded:', userObj);
            setUser(userObj);
            
            // Update last time active
            await updateLastTimeActive(firebaseUser.uid);
          } else {
            // User document doesn't exist, create basic user object
            const userObj = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            };
            console.log('Basic user created:', userObj);
            setUser(userObj);
          }
          setIsSignedIn(true);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
          setIsSignedIn(false);
        }
      } else {
        setUser(null);
        setIsSignedIn(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Activity tracking effect
  useEffect(() => {
    if (!user?.id) return;

    const updateActivity = async () => {
      const now = new Date().getTime();
      
      // Only update if more than 5 minutes have passed since last update
      if (!lastUpdateRef.current || now - lastUpdateRef.current > 5 * 60 * 1000) {
        await updateLastTimeActive(user.id);
        lastUpdateRef.current = now;
      }
    };

    // Track user activity events
    const handleActivity = () => {
      updateActivity();
    };

    // Activity events to track
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Add event listeners for user activity
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Update activity every 10 minutes as a fallback
    intervalRef.current = setInterval(updateActivity, 10 * 60 * 1000);

    // Initial update
    updateActivity();

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateActivity();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user?.id]);

  const signUp = async ({ email, password, firstName, lastName, username, gender }) => {
    try {
      // Create Firebase user
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase user profile
      await updateProfile(firebaseUser, {
        displayName: username || `${firstName} ${lastName}`.trim()
      });

      // Create user document in Firestore with the existing structure
      const userData = {
        email,
        username: username || `${firstName} ${lastName}`.trim(),
        gender: gender || 'other',
        firstName,
        lastName,
        images: [], // Empty array for profile images initially
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Add any other default fields you need
        bio: '',
        location: '',
        website: '',
        verified: false,
        followers: [],
        following: []
      };

      await setDoc(doc(db, 'Users', firebaseUser.uid), userData);

      return { success: true, user: firebaseUser };
    } catch (error) {
      console.error('Sign up error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to create account' 
      };
    }
  };

  const signIn = async (email, password) => {
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

  const signOut = async () => {
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

  // Mock function to maintain compatibility with existing code
  const currentUser = async () => {
    return user;
  };

  // Mock useUser hook to maintain compatibility
  const useUser = () => {
    return {
      user,
      isLoaded: !loading,
      isSignedIn,
    };
  };

  const value = {
    user,
    loading,
    isSignedIn,
    signUp,
    signIn,
    signOut,
    currentUser,
    useUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 