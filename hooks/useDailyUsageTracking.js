"use client";

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/hooks/useFirebaseAuth';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import dayjs from 'dayjs';
import { now } from '@/utils/dateHelpers';

const USAGE_STORAGE_KEY = 'daily_usage_tracking';

export const useDailyUsageTracking = () => {
  const { user } = useUser();
  const [dailyUsage, setDailyUsage] = useState({
    DAILY_POSTS: 0,
    DAILY_FEED_VIEWS: 0,
    DAILY_MATCHES: 0,
    ACTIVE_CONVERSATIONS: 0,
    SUPER_LIKES: 0,
    REWINDS: 0,
    BOOSTS: 0,
    lastReset: now(),
  });
  const [isLoading, setIsLoading] = useState(true);

  // Get today's date string for comparison
  const getTodayString = () => dayjs().format('YYYY-MM-DD');

  // Load usage from localStorage with date check
  const loadLocalUsage = useCallback(() => {
    try {
      const stored = localStorage.getItem(USAGE_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const storedDate = dayjs(data.lastReset).format('YYYY-MM-DD');
        const today = getTodayString();
        
        // Reset if it's a new day
        if (storedDate !== today) {
          const resetData = {
            DAILY_POSTS: 0,
            DAILY_FEED_VIEWS: 0,
            DAILY_MATCHES: 0,
            ACTIVE_CONVERSATIONS: 0,
            SUPER_LIKES: 0,
            REWINDS: 0,
            BOOSTS: 0,
            lastReset: now(),
          };
          localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(resetData));
          return resetData;
        }
        
        return data;
      }
    } catch (error) {
      console.error('Error loading daily usage from localStorage:', error);
    }
    
    return {
      DAILY_POSTS: 0,
      DAILY_FEED_VIEWS: 0,
      DAILY_MATCHES: 0,
      ACTIVE_CONVERSATIONS: 0,
      SUPER_LIKES: 0,
      REWINDS: 0,
      BOOSTS: 0,
      lastReset: now(),
    };
  }, []);

  // Save usage to localStorage
  const saveLocalUsage = useCallback((usage) => {
    try {
      localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(usage));
    } catch (error) {
      console.error('Error saving daily usage to localStorage:', error);
    }
  }, []);

  // Sync with Firestore
  const syncWithFirestore = useCallback(async () => {
    if (!user?.id) return;

    try {
      const userRef = doc(db, 'Users', user.id);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const firestoreUsage = userData.dailyUsage || {};
        const firestoreDate = firestoreUsage.lastReset ? 
          dayjs(firestoreUsage.lastReset.toDate ? firestoreUsage.lastReset.toDate() : firestoreUsage.lastReset).format('YYYY-MM-DD') : 
          null;
        const today = getTodayString();

        // If Firestore has today's data, use it
        if (firestoreDate === today) {
          const mergedUsage = {
            DAILY_POSTS: Math.max(dailyUsage.DAILY_POSTS, firestoreUsage.DAILY_POSTS || 0),
            DAILY_FEED_VIEWS: Math.max(dailyUsage.DAILY_FEED_VIEWS, firestoreUsage.DAILY_FEED_VIEWS || 0),
            DAILY_MATCHES: Math.max(dailyUsage.DAILY_MATCHES, firestoreUsage.DAILY_MATCHES || 0),
            ACTIVE_CONVERSATIONS: Math.max(dailyUsage.ACTIVE_CONVERSATIONS, firestoreUsage.ACTIVE_CONVERSATIONS || 0),
            SUPER_LIKES: Math.max(dailyUsage.SUPER_LIKES, firestoreUsage.SUPER_LIKES || 0),
            REWINDS: Math.max(dailyUsage.REWINDS, firestoreUsage.REWINDS || 0),
            BOOSTS: Math.max(dailyUsage.BOOSTS, firestoreUsage.BOOSTS || 0),
            lastReset: firestoreUsage.lastReset || now(),
          };
          
          setDailyUsage(mergedUsage);
          saveLocalUsage(mergedUsage);
        }
      }
    } catch (error) {
      console.error('Error syncing with Firestore:', error);
    }
  }, [user?.id, dailyUsage, saveLocalUsage]);

  // Update Firestore with current usage
  const updateFirestoreUsage = useCallback(async (usage) => {
    if (!user?.id) return;

    try {
      const userRef = doc(db, 'Users', user.id);
      await updateDoc(userRef, {
        dailyUsage: {
          ...usage,
          lastReset: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      });
    } catch (error) {
      console.error('Error updating Firestore usage:', error);
    }
  }, [user?.id]);

  // Increment usage for a specific action
  const incrementUsage = useCallback(async (action) => {
    const actionKey = action.toUpperCase();
    
    setDailyUsage(prev => {
      const newUsage = {
        ...prev,
        [actionKey]: (prev[actionKey] || 0) + 1,
      };
      
      // Save to localStorage immediately
      saveLocalUsage(newUsage);
      
      // Update Firestore asynchronously
      updateFirestoreUsage(newUsage);
      
      return newUsage;
    });
  }, [saveLocalUsage, updateFirestoreUsage]);

  // Set active conversations count (not incremental)
  const setActiveConversations = useCallback(async (count) => {
    setDailyUsage(prev => {
      const newUsage = {
        ...prev,
        ACTIVE_CONVERSATIONS: count,
      };
      
      saveLocalUsage(newUsage);
      updateFirestoreUsage(newUsage);
      
      return newUsage;
    });
  }, [saveLocalUsage, updateFirestoreUsage]);

  // Reset daily usage
  const resetDailyUsage = useCallback(() => {
    const resetData = {
      DAILY_POSTS: 0,
      DAILY_FEED_VIEWS: 0,
      DAILY_MATCHES: 0,
      ACTIVE_CONVERSATIONS: 0,
      SUPER_LIKES: 0,
      REWINDS: 0,
      BOOSTS: 0,
      lastReset: now(),
    };
    
    setDailyUsage(resetData);
    saveLocalUsage(resetData);
    
    if (user?.id) {
      updateFirestoreUsage(resetData);
    }
  }, [user?.id, saveLocalUsage, updateFirestoreUsage]);

  // Check if it's a new day and reset if needed
  useEffect(() => {
    const checkAndReset = () => {
      const storedDate = dayjs(dailyUsage.lastReset).format('YYYY-MM-DD');
      const today = getTodayString();
      
      if (storedDate !== today) {
        resetDailyUsage();
      }
    };

    // Check on mount and every minute
    checkAndReset();
    const interval = setInterval(checkAndReset, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [dailyUsage.lastReset, resetDailyUsage]);

  // Initialize on mount
  useEffect(() => {
    const localUsage = loadLocalUsage();
    setDailyUsage(localUsage);
    setIsLoading(false);
  }, [loadLocalUsage]);

  // Sync with Firestore when user changes
  useEffect(() => {
    if (user?.id && !isLoading) {
      syncWithFirestore();
    }
  }, [user?.id, isLoading, syncWithFirestore]);

  return {
    dailyUsage,
    incrementUsage,
    setActiveConversations,
    resetDailyUsage,
    isLoading,
  };
}; 