"use client";
import { useEffect, useRef } from "react";
import { setUserOnlineStatus, updateUserActivity } from "@/actions/chat";

const useOnlineStatus = (userId) => {
  const activityTimeoutRef = useRef(null);
  const isOnlineRef = useRef(false);

  // Set user online when hook mounts
  useEffect(() => {
    if (!userId) return;

    const setOnline = async () => {
      try {
        await setUserOnlineStatus(userId, true);
        isOnlineRef.current = true;
      } catch (error) {
        console.error("Failed to set online status:", error);
      }
    };

    setOnline();

    // Set offline when page unloads
    const handleBeforeUnload = async () => {
      if (isOnlineRef.current) {
        try {
          await setUserOnlineStatus(userId, false);
          isOnlineRef.current = false;
        } catch (error) {
          console.error("Failed to set offline status:", error);
        }
      }
    };

    // Handle visibility change
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        // Page hidden - set offline after delay
        activityTimeoutRef.current = setTimeout(async () => {
          try {
            await setUserOnlineStatus(userId, false);
            isOnlineRef.current = false;
          } catch (error) {
            console.error("Failed to set offline status:", error);
          }
        }, 5000); // 5 second delay
      } else {
        // Page visible - clear timeout and set online
        if (activityTimeoutRef.current) {
          clearTimeout(activityTimeoutRef.current);
        }
        if (!isOnlineRef.current) {
          try {
            await setUserOnlineStatus(userId, true);
            isOnlineRef.current = true;
          } catch (error) {
            console.error("Failed to set online status:", error);
          }
        }
      }
    };

    // Track user activity
    const handleActivity = async () => {
      try {
        await updateUserActivity(userId);
        
        // Reset any offline timeout
        if (activityTimeoutRef.current) {
          clearTimeout(activityTimeoutRef.current);
        }
        
        // Set online if not already
        if (!isOnlineRef.current) {
          await setUserOnlineStatus(userId, true);
          isOnlineRef.current = true;
        }
      } catch (error) {
        console.error("Failed to update activity:", error);
      }
    };

    // Activity events
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Throttle activity updates to avoid spam
    let lastActivity = 0;
    const throttledActivity = () => {
      const now = Date.now();
      if (now - lastActivity > 30000) { // Update every 30 seconds max
        lastActivity = now;
        handleActivity();
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    activityEvents.forEach(event => {
      document.addEventListener(event, throttledActivity, { passive: true });
    });

    // Cleanup
    return () => {
      // Clear timeout
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
      
      // Set offline
      if (isOnlineRef.current) {
        setUserOnlineStatus(userId, false).catch(console.error);
      }
      
      // Remove listeners
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      activityEvents.forEach(event => {
        document.removeEventListener(event, throttledActivity);
      });
    };
  }, [userId]);

  // Periodic activity update (fallback)
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(async () => {
      if (isOnlineRef.current && !document.hidden) {
        try {
          await updateUserActivity(userId);
        } catch (error) {
          console.error("Failed to update periodic activity:", error);
        }
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [userId]);
};

export default useOnlineStatus; 