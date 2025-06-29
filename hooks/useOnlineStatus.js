"use client";
import { useEffect, useRef, useCallback } from "react";
import { setUserOnline, setUserOffline, updateUserActivity } from "@/actions/user";

const useOnlineStatus = (userId) => {
  const isOnlineRef = useRef(false);
  const isAwayRef = useRef(false);
  const activityTimeoutRef = useRef(null);
  const awayTimeoutRef = useRef(null);
  const pendingStatusUpdateRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const lastTypingUpdateRef = useRef(0);
  const isMountedRef = useRef(true);

  // Debounced activity update with longer delay
  const debouncedUpdateActivity = useCallback(async () => {
    if (!userId || !isMountedRef.current) return;
    
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    
    // Only update if more than 2 minutes have passed
    if (timeSinceLastActivity < 120000) { // 2 minutes
      console.log("⏭️ Skipping activity update - too soon");
      return;
    }
    
    try {
      console.log("📊 Updating user activity");
      await updateUserActivity(userId);
      lastActivityRef.current = now;
    } catch (error) {
      console.error("Failed to update activity:", error);
    }
  }, [userId]);

  // Debounced status update with pending update tracking
  const debouncedStatusUpdate = useCallback((statusUpdateFunc) => {
    return new Promise(async (resolve) => {
      if (pendingStatusUpdateRef.current) {
        clearTimeout(pendingStatusUpdateRef.current);
      }
      
      pendingStatusUpdateRef.current = setTimeout(async () => {
        if (!isMountedRef.current) {
          resolve();
          return;
        }
        
        try {
          await statusUpdateFunc();
          resolve();
        } catch (error) {
          console.error("Status update failed:", error);
          resolve();
        }
      }, 30000); // 30 seconds debounce for status changes
    });
  }, []);

  // Throttled activity handler with reduced frequency
  const throttledActivity = useCallback(() => {
    if (!userId || !isMountedRef.current) return;
    
    const now = Date.now();
    lastActivityRef.current = now;
    
    // Clear away timeout
    if (awayTimeoutRef.current) {
      clearTimeout(awayTimeoutRef.current);
    }
    
    // Set user as away after 5 minutes of inactivity (increased from 2 minutes)
    awayTimeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      
      console.log("⏰ User is away due to inactivity");
      isAwayRef.current = true;
      // Don't update status to away - let the backend handle it based on lastActivity
    }, 300000); // 5 minutes
    
    // Clear activity timeout
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    
    // Update activity in Firestore with reduced frequency
    activityTimeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      debouncedUpdateActivity();
    }, 300000); // Update activity every 5 minutes (increased from 30 seconds)
  }, [userId, debouncedUpdateActivity]);

  useEffect(() => {
    if (!userId) {
      console.log("❌ No userId provided to useOnlineStatus");
      return;
    }

    console.log("🔥 Setting up online status for user:", userId);
    isMountedRef.current = true;

    const setOnline = async () => {
      try {
        console.log("🟢 Attempting to set user online:", userId);
        await debouncedStatusUpdate(() => setUserOnline(userId));
        isOnlineRef.current = true;
        isAwayRef.current = false;
        console.log("✅ User set to online successfully");
      } catch (error) {
        console.error("❌ Failed to set online status:", error);
      }
    };

    setOnline();

    // Set offline when page unloads
    const handleBeforeUnload = async () => {
      if (isOnlineRef.current && isMountedRef.current) {
        try {
          console.log("🚪 User leaving - setting offline");
          // Clear pending updates
          if (pendingStatusUpdateRef.current) {
            clearTimeout(pendingStatusUpdateRef.current);
          }
          await setUserOffline(userId);
          isOnlineRef.current = false;
        } catch (error) {
          console.error("Failed to set offline status:", error);
        }
      }
    };

    // Handle visibility changes with debouncing
    const handleVisibilityChange = () => {
      if (!isMountedRef.current) return;
      
      if (document.hidden) {
        console.log("📱 Page hidden - user might be away");
        isAwayRef.current = true;
        // Don't immediately set offline, give user time to come back
        if (activityTimeoutRef.current) {
          clearTimeout(activityTimeoutRef.current);
        }
      } else {
        console.log("📱 Page visible - user is back");
        isAwayRef.current = false;
        throttledActivity();
        
        // Re-set online status if was away for a while
        if (!isOnlineRef.current) {
          setOnline();
        }
      }
    };

    // Reduced activity events - removed mousemove and click to reduce overhead
    const activityEvents = ['keydown', 'scroll', 'touchstart'];

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    activityEvents.forEach(event => {
      document.addEventListener(event, throttledActivity, { passive: true });
    });

    // Initial activity
    throttledActivity();

    // Cleanup
    return () => {
      console.log("🧹 Cleaning up online status tracking");
      isMountedRef.current = false;
      
      // Clear timeouts
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
      if (awayTimeoutRef.current) {
        clearTimeout(awayTimeoutRef.current);
      }
      if (pendingStatusUpdateRef.current) {
        clearTimeout(pendingStatusUpdateRef.current);
      }
      
      // Set offline
      if (isOnlineRef.current) {
        setUserOffline(userId).catch(console.error);
      }
      
      // Remove listeners
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      activityEvents.forEach(event => {
        document.removeEventListener(event, throttledActivity);
      });
    };
  }, [userId, debouncedUpdateActivity, debouncedStatusUpdate, throttledActivity]);

  // Reduced periodic activity update frequency
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(async () => {
      if (isOnlineRef.current && !document.hidden && !isAwayRef.current && isMountedRef.current) {
        try {
          console.log("💓 Heartbeat - updating presence");
          await debouncedUpdateActivity();
        } catch (error) {
          console.error("Failed to update periodic activity:", error);
        }
      }
    }, 300000); // Update every 5 minutes (increased from 1 minute)

    return () => clearInterval(interval);
  }, [userId, debouncedUpdateActivity]);
};

export default useOnlineStatus; 