import { useState, useEffect, useCallback } from 'react';
import { subscribeToUserConversations } from '@/actions/chat';
import { getMyCompatibleUsers } from '@/actions/admin';

export const useNotifications = (currentUser) => {
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [newCompatibilitiesCount, setNewCompatibilitiesCount] = useState(0);
  const [lastCompatibilityCheck, setLastCompatibilityCheck] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [newCompatibilities, setNewCompatibilities] = useState([]);

  // Clean up old localStorage keys on user change
  useEffect(() => {
    if (currentUser?.id) {
      // Clean up old compatibility localStorage keys
      const oldKey = `compatibilities_${currentUser.id}`;
      if (localStorage.getItem(oldKey)) {
        localStorage.removeItem(oldKey);
        console.log('🧹 Cleaned up old compatibility localStorage key');
      }
    }
  }, [currentUser?.id]);

  // Subscribe to conversations for unread messages count
  useEffect(() => {
    if (!currentUser?.id) {
      setUnreadMessagesCount(0);
      setUnreadMessages([]);
      return;
    }

    const unsubscribe = subscribeToUserConversations(
      currentUser.id,
      (conversations) => {
        // Calculate total unread messages and collect details
        const totalUnread = conversations.reduce((total, conv) => {
          return total + (conv.unreadCount || 0);
        }, 0);
        
        // Get conversations with unread messages
        const unreadConversations = conversations.filter(conv => 
          conv.unreadCount > 0 && conv.otherUser
        );
        
        setUnreadMessagesCount(totalUnread);
        setUnreadMessages(unreadConversations);
      }
    );

    return unsubscribe;
  }, [currentUser?.id]);

  // Check for new compatibilities
  const checkNewCompatibilities = useCallback(async () => {
    if (!currentUser?.id) return;

    console.log('🔍 Checking for new compatibilities...');
    
    try {
      const compatibilities = await getMyCompatibleUsers(currentUser.id);
      const currentTime = Date.now();
      
      console.log('📊 Total compatibilities:', compatibilities.length);
      
      // Get stored seen compatibility IDs from localStorage (ones user has actually seen)
      const seenStorageKey = `compatibilities_seen_v2_${currentUser.id}`;
      const seenCompatibilities = JSON.parse(localStorage.getItem(seenStorageKey) || '[]');
      
      console.log('👁️ Previously seen compatibilities:', seenCompatibilities.length);
      
      // Find new compatibilities (ones not in seen list)
      const newCompatibilitiesFound = compatibilities.filter(comp => 
        !seenCompatibilities.includes(comp.id)
      );
      
      // DON'T update localStorage yet - only when user actually sees them
      
      // Only show new compatibilities if this isn't the first check
      if (lastCompatibilityCheck) {
        console.log('🔔 New compatibilities found:', newCompatibilitiesFound.length);
        setNewCompatibilitiesCount(newCompatibilitiesFound.length);
        setNewCompatibilities(newCompatibilitiesFound);
      } else {
        console.log('🔔 First compatibility check - not showing notifications');
        setNewCompatibilitiesCount(0);
        setNewCompatibilities([]);
      }
      
      setLastCompatibilityCheck(currentTime);
      
    } catch (error) {
      console.error("Error checking new compatibilities:", error);
    }
  }, [currentUser?.id, lastCompatibilityCheck]);

  // Periodically check for new compatibilities (every 5 minutes)
  useEffect(() => {
    if (!currentUser?.id) return;

    console.log('🔍 Starting compatibility check interval for user:', currentUser.id);
    
    // Initial check after a short delay to allow other components to load
    const initialTimer = setTimeout(() => {
      checkNewCompatibilities();
    }, 2000);

    // Periodic check every 5 minutes
    const interval = setInterval(() => {
      console.log('⏰ Periodic compatibility check');
      checkNewCompatibilities();
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [checkNewCompatibilities, currentUser?.id]);

  // Mark compatibilities as seen
  const markCompatibilitiesAsSeen = useCallback(() => {
    if (!currentUser?.id) return;
    
    console.log('✅ Marking compatibilities as seen:', newCompatibilities.length);
    
    // Save currently shown compatibilities as seen in localStorage
    const seenStorageKey = `compatibilities_seen_v2_${currentUser.id}`;
    const currentSeenCompatibilities = JSON.parse(localStorage.getItem(seenStorageKey) || '[]');
    
    // Add new compatibilities to seen list
    const newSeenIds = newCompatibilities.map(comp => comp.id);
    const updatedSeenCompatibilities = [...new Set([...currentSeenCompatibilities, ...newSeenIds])];
    
    console.log('💾 Updating seen compatibilities:', updatedSeenCompatibilities.length);
    localStorage.setItem(seenStorageKey, JSON.stringify(updatedSeenCompatibilities));
    
    // Clear notifications
    setNewCompatibilitiesCount(0);
    setNewCompatibilities([]);
    setLastCompatibilityCheck(Date.now());
  }, [currentUser?.id, newCompatibilities]);

  return {
    unreadMessagesCount,
    newCompatibilitiesCount,
    unreadMessages,
    newCompatibilities,
    markCompatibilitiesAsSeen,
    checkNewCompatibilities
  };
}; 