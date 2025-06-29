"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
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
  const userCacheRef = useRef(null);
  const lastUserFetchRef = useRef(0);
  const debouncedUpdateLastTimeActive = useRef(null);

  // Optimized user data fetch with caching
  const fetchUserData = async (firebaseUser, forceRefresh = false) => {
    if (!firebaseUser) return null;

    const now = Date.now();
    const cacheAge = now - lastUserFetchRef.current;
    
    // Use cached data if less than 5 minutes old and not forcing refresh
    if (!forceRefresh && userCacheRef.current && cacheAge < 300000) { // 5 minutes cache
      console.log('Using cached user data');
      return userCacheRef.current;
    }

    try {
      const userDoc = await getDoc(doc(db, 'Users', firebaseUser.uid));
      let userData;
      
      if (userDoc.exists()) {
        const docData = userDoc.data();
        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          ...docData
        };
        
        // Auto-grant premium if user has subscriptionActive property
        if (docData.subscriptionActive !== undefined) {
          // User has subscriptionActive property, grant premium
          if (!docData.subscription || docData.subscription.status !== 'active') {
            // Update subscription data to reflect premium status
            userData.subscription = {
              ...docData.subscription,
              status: 'active',
              isPremium: true,
              type: 'legacy_premium',
              source: 'subscriptionActive_property',
              grantedAt: new Date(),
            };
            
            // Update in Firestore
            await updateDoc(doc(db, 'Users', firebaseUser.uid), {
              subscription: userData.subscription
            });
            
            console.log('Auto-granted premium to user with subscriptionActive property');
          }
        }
        
        // Cache the user data
        userCacheRef.current = userData;
        lastUserFetchRef.current = now;
        
        console.log('User data loaded from Firestore:', userData);
      } else {
        // User document doesn't exist, create basic user object
        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        };
        
        // Cache basic user data
        userCacheRef.current = userData;
        lastUserFetchRef.current = now;
        
        console.log('Basic user created:', userData);
      }
      
      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Return cached data if available, otherwise null
      return userCacheRef.current || null;
    }
  };

  // Debounced last time active update - increased delay
  const updateLastTimeActiveDebounced = useCallback((userId) => {
    if (debouncedUpdateLastTimeActive.current) {
      clearTimeout(debouncedUpdateLastTimeActive.current);
    }
    
    debouncedUpdateLastTimeActive.current = setTimeout(async () => {
      try {
        await updateLastTimeActive(userId);
      } catch (error) {
        console.error('Error updating last time active:', error);
      }
    }, 60000); // 60 seconds debounce (increased from 30)
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await fetchUserData(firebaseUser);
          
          if (userData) {
            setUser(userData);
            setIsSignedIn(true);
            
            // Update last time active with debouncing
            updateLastTimeActiveDebounced(firebaseUser.uid);
          } else {
            setUser(null);
            setIsSignedIn(false);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          setUser(null);
          setIsSignedIn(false);
        }
      } else {
        // Clear cache when user logs out
        userCacheRef.current = null;
        lastUserFetchRef.current = 0;
        setUser(null);
        setIsSignedIn(false);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (debouncedUpdateLastTimeActive.current) {
        clearTimeout(debouncedUpdateLastTimeActive.current);
      }
    };
  }, [updateLastTimeActiveDebounced]);

  const signIn = async ({ email, password }) => {
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      
      // Force refresh user data on sign in
      const userData = await fetchUserData(firebaseUser, true);
      if (userData) {
        setUser(userData);
        setIsSignedIn(true);
      }
      
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

      // Update cache with new user data
      const newUserData = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        ...userData
      };
      userCacheRef.current = newUserData;
      lastUserFetchRef.current = Date.now();

      return { success: true, user: firebaseUser };
    } catch (error) {
      console.error('Sign up error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to create account' 
      };
    }
  };

  const signOut = async () => {
    try {
      // Clear all cache and timeouts
      userCacheRef.current = null;
      lastUserFetchRef.current = 0;
      if (debouncedUpdateLastTimeActive.current) {
        clearTimeout(debouncedUpdateLastTimeActive.current);
      }
      
      await firebaseSignOut(auth);
      setUser(null);
      setIsSignedIn(false);
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  };

  // Function to refresh user data (for use after profile updates)
  const refreshUser = async () => {
    if (auth.currentUser) {
      const userData = await fetchUserData(auth.currentUser, true); // Force refresh
      if (userData) {
        setUser(userData);
      }
    }
  };

  const value = {
    user,
    loading,
    isSignedIn,
    signIn,
    signUp,
    signOut,
    refreshUser // Expose refresh function
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 