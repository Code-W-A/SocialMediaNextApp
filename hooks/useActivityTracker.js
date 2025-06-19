"use client";
import { useEffect, useRef } from 'react';
import { useUser } from '@/hooks/useFirebaseAuth';
import { updateLastTimeActive } from '@/actions/user';

export const useActivityTracker = () => {
  const { user } = useUser();
  const lastUpdateRef = useRef(null);
  const intervalRef = useRef(null);

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

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user?.id]);

  // Update activity when tab becomes visible
  useEffect(() => {
    if (!user?.id) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateLastTimeActive(user.id);
        lastUpdateRef.current = new Date().getTime();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id]);
}; 