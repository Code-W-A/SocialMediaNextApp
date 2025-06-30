"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { updateUserActivity } from '@/actions/chat';

const ACTIVITY_THROTTLE_MS = 30000; // 30 seconds
const AWAY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const HEARTBEAT_INTERVAL_MS = 60000; // 1 minute

export function useOnlineStatus(userId) {
  const [isOnline, setIsOnline] = useState(navigator?.onLine ?? true);
  const [isAway, setIsAway] = useState(false);
  const lastActivityRef = useRef(Date.now());
  const awayTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const lastUpdateRef = useRef(0);
  const mountedRef = useRef(true);

  // Throttled activity update
  const updateActivity = useCallback(async () => {
    if (!userId || !mountedRef.current) return;
    
    const now = Date.now();
    if (now - lastUpdateRef.current < ACTIVITY_THROTTLE_MS) {
      return;
    }

    try {
      await updateUserActivity(userId);
      lastUpdateRef.current = now;
    } catch (error) {
      // Handle activity update error silently
    }
  }, [userId]);

  // Reset away timeout
  const resetAwayTimeout = useCallback(() => {
    if (awayTimeoutRef.current) {
      clearTimeout(awayTimeoutRef.current);
    }

    if (isAway) {
      setIsAway(false);
    }

    awayTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setIsAway(true);
      }
    }, AWAY_TIMEOUT_MS);
  }, [isAway]);

  // Handle user activity
  const handleActivity = useCallback(() => {
    if (!mountedRef.current) return;
    
    lastActivityRef.current = Date.now();
    resetAwayTimeout();
    updateActivity();
  }, [resetAwayTimeout, updateActivity]);

  // Set user online
  const setUserOnline = useCallback(async () => {
    if (!userId || !mountedRef.current) return;
    
    try {
      await updateUserActivity(userId, true);
      setIsOnline(true);
    } catch (error) {
      // Handle online status error silently
    }
  }, [userId]);

  // Set user offline
  const setUserOffline = useCallback(async () => {
    if (!userId || !mountedRef.current) return;
    
    try {
      await updateUserActivity(userId, false);
      setIsOnline(false);
    } catch (error) {
      // Handle offline status error silently
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    // Set initial online status
    setUserOnline();

    // Activity event listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Page visibility API
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User might be away, but don't immediately set offline
        // The away timeout will handle this
      } else {
        // User is back, reset away status
        handleActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Online/offline event listeners
    const handleOnline = () => {
      setIsOnline(true);
      setUserOnline();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setUserOffline();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Beforeunload event (user leaving)
    const handleBeforeUnload = () => {
      // Set user offline when leaving
      navigator.sendBeacon?.('/api/user/offline', JSON.stringify({ userId }));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Initialize away timeout
    resetAwayTimeout();

    // Heartbeat to maintain presence
    heartbeatIntervalRef.current = setInterval(() => {
      if (mountedRef.current && !isAway && isOnline) {
        updateActivity();
      }
    }, HEARTBEAT_INTERVAL_MS);

    // Cleanup function
    return () => {
      mountedRef.current = false;
      
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (awayTimeoutRef.current) {
        clearTimeout(awayTimeoutRef.current);
      }
      
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      
      // Set offline when component unmounts
      setUserOffline();
    };
  }, [userId, handleActivity, resetAwayTimeout, setUserOnline, setUserOffline, updateActivity, isAway, isOnline]);

  return {
    isOnline,
    isAway,
    lastActivity: lastActivityRef.current,
    setUserOnline,
    setUserOffline,
    updateActivity
  };
} 