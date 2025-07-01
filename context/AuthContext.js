"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { mockCurrentUser } from '@/mock/mockData';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { updateLastTimeActive } from '@/actions/user';
import { serializeFirebaseData } from "@/utils/firebaseHelpers";
import { now } from "@/utils/dateHelpers";

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
  
  // Use refs for stable references
  const userCacheRef = useRef(null);
  const lastUserFetchRef = useRef(0);
  const debouncedTimeoutRef = useRef(null);
  const mountedRef = useRef(true);

  // Stable user data fetch function
  const fetchUserData = useCallback(async (firebaseUser, forceRefresh = false) => {
    if (!firebaseUser || !mountedRef.current) return null;

    const currentTime = Date.now();
    const cacheAge = currentTime - lastUserFetchRef.current;
    
    // Use cached data if less than 5 minutes old and not forcing refresh
    if (!forceRefresh && userCacheRef.current && cacheAge < 300000) {
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
        if (docData.subscriptionActive !== undefined && !docData.subscription?.status) {
          userData.subscription = {
            ...docData.subscription,
            status: 'active',
            isPremium: true,
            type: 'legacy_premium',
            source: 'subscriptionActive_property',
            grantedAt: now(),
          };
          
          // Update in Firestore (fire and forget)
          updateDoc(doc(db, 'Users', firebaseUser.uid), {
            subscription: userData.subscription
          }).catch(() => {
            // Handle error silently
          });
        }
      } else {
        // User document doesn't exist, create basic user object
        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        };
      }
      
      // Cache the user data
      userCacheRef.current = userData;
      lastUserFetchRef.current = currentTime;
      
      return userData;
    } catch (error) {
      // Return cached data if available, otherwise null
      return userCacheRef.current || null;
    }
  }, []);

  // Stable debounced last time active update
  const updateLastTimeActiveDebounced = useCallback((userId) => {
    if (!userId || !mountedRef.current) return;
    
    if (debouncedTimeoutRef.current) {
      clearTimeout(debouncedTimeoutRef.current);
    }
    
    debouncedTimeoutRef.current = setTimeout(async () => {
      if (mountedRef.current) {
        try {
          await updateLastTimeActive(userId);
        } catch (error) {
          // Handle error silently
        }
      }
    }, 60000); // 60 seconds debounce
  }, []);

  // Stable auth state handler
  const handleAuthStateChange = useCallback(async (firebaseUser) => {
    if (!mountedRef.current) return;
    
    if (firebaseUser) {
      try {
        const userData = await fetchUserData(firebaseUser);
        
        if (userData && mountedRef.current) {
          setUser(userData);
          setIsSignedIn(true);
          
          // Update last time active with debouncing
          updateLastTimeActiveDebounced(firebaseUser.uid);
        } else if (mountedRef.current) {
          setUser(null);
          setIsSignedIn(false);
        }
      } catch (error) {
        if (mountedRef.current) {
          setUser(null);
          setIsSignedIn(false);
        }
      }
    } else {
      // Clear cache when user logs out
      userCacheRef.current = null;
      lastUserFetchRef.current = 0;
      if (mountedRef.current) {
        setUser(null);
        setIsSignedIn(false);
      }
    }
    
    if (mountedRef.current) {
      setLoading(false);
    }
  }, [fetchUserData, updateLastTimeActiveDebounced]);

  useEffect(() => {
    mountedRef.current = true;
    
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);

    return () => {
      mountedRef.current = false;
      unsubscribe();
      if (debouncedTimeoutRef.current) {
        clearTimeout(debouncedTimeoutRef.current);
      }
    };
  }, [handleAuthStateChange]);

  const signIn = useCallback(async ({ email, password }) => {
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      
      // Force refresh user data on sign in
      const userData = await fetchUserData(firebaseUser, true);
      if (userData && mountedRef.current) {
        setUser(userData);
        setIsSignedIn(true);
      }
      
      return { success: true, user: firebaseUser };
    } catch (error) {
      console.error('Sign in error:', error);
      
      return { 
        success: false, 
        error: error.message,
        code: error.code // Return the error code so frontend can translate
      };
    }
  }, [fetchUserData]);

  const signUp = useCallback(async ({ email, password, firstName, lastName, username, gender }) => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase Auth profile
      if (firstName || lastName) {
        await updateProfile(firebaseUser, {
          displayName: `${firstName || ''} ${lastName || ''}`.trim()
        });
      }
      
      // Create user document in Firestore
      const userData = {
        firstName,
        lastName,
        username,
        email: firebaseUser.email,
        gender,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        subscription: {
          status: 'free',
          isPremium: false
        }
      };
      
      await setDoc(doc(db, 'Users', firebaseUser.uid), userData);
      
      // Fetch and set user data
      const completeUserData = await fetchUserData(firebaseUser, true);
      if (completeUserData && mountedRef.current) {
        setUser(completeUserData);
        setIsSignedIn(true);
      }
      
      return { success: true, user: firebaseUser };
    } catch (error) {
      let errorMessage = 'Failed to create account';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email address is already registered';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
        default:
          errorMessage = error.message || 'Account creation failed';
      }
      
      return { success: false, error: errorMessage };
    }
  }, [fetchUserData]);

  const signOut = useCallback(async () => {
    try {
      // Clear cache and state
      userCacheRef.current = null;
      lastUserFetchRef.current = 0;
      
      if (debouncedTimeoutRef.current) {
        clearTimeout(debouncedTimeoutRef.current);
      }
      
      await firebaseSignOut(auth);
      
      if (mountedRef.current) {
        setUser(null);
        setIsSignedIn(false);
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (auth.currentUser && mountedRef.current) {
      const userData = await fetchUserData(auth.currentUser, true);
      if (userData && mountedRef.current) {
        setUser(userData);
      }
      return userData;
    }
    return null;
  }, [fetchUserData]);

  const loginWithGoogle = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Load or create user data
      await fetchUserData(result.user, true);
      
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [fetchUserData]);

  const resetPassword = useCallback(async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const refreshUserData = useCallback(async () => {
    if (auth.currentUser && mountedRef.current) {
      // Clear cache for current user
      userCacheRef.current = null;
      lastUserFetchRef.current = 0;
      return await fetchUserData(auth.currentUser, true);
    }
    return null;
  }, [fetchUserData]);

  const value = {
    user,
    loading,
    isSignedIn,
    signIn,
    signUp,
    signOut,
    refreshUser,
    loginWithGoogle,
    resetPassword,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 