"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getV1UserStatus, 
  migrateV1UserToPremium, 
  markV1WelcomeShown 
} from '@/actions/v1Migration';
import { useUser } from '@/hooks/useFirebaseAuth';
import { message } from 'antd';

export const useV1Migration = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);

  // Get V1 user status
  const {
    data: v1Status,
    isLoading: isLoadingV1Status,
    error: v1StatusError,
  } = useQuery({
    queryKey: ['v1Status', user?.id],
    queryFn: () => getV1UserStatus(user?.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Auto-migrate V1 users
  const migrateMutation = useMutation({
    mutationFn: (userId) => migrateV1UserToPremium(userId),
    onSuccess: (data) => {
      console.log('✅ V1 user successfully migrated to premium');
      // Refresh both V1 status and subscription data
      queryClient.invalidateQueries(['v1Status', user?.id]);
      queryClient.invalidateQueries(['subscription', user?.id]);
      
      // Show welcome dialog
      setShowWelcomeDialog(true);
    },
    onError: (error) => {
      console.error('Error migrating V1 user:', error);
      // Don't show error message to user as this should be automatic
    },
  });

  // Mark welcome as shown
  const markWelcomeShownMutation = useMutation({
    mutationFn: (userId) => markV1WelcomeShown(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['v1Status', user?.id]);
      setShowWelcomeDialog(false);
    },
    onError: (error) => {
      console.error('Error marking welcome as shown:', error);
    },
  });

  // Auto-migrate V1 users when detected
  useEffect(() => {
    if (v1Status && v1Status.isV1User && !v1Status.isMigrated && user?.id) {
      console.log('🔄 Detected V1 user, starting auto-migration...');
      migrateMutation.mutate(user.id);
    }
  }, [v1Status, user?.id]);

  // Show welcome dialog for migrated users who haven't seen it
  useEffect(() => {
    if (v1Status && v1Status.isV1User && v1Status.isMigrated && !v1Status.hasShownWelcome) {
      setShowWelcomeDialog(true);
    }
  }, [v1Status]);

  // Helper functions
  const isV1User = v1Status?.isV1User || false;
  const isMigrated = v1Status?.isMigrated || false;
  const hasShownWelcome = v1Status?.hasShownWelcome || false;
  const shouldShowWelcome = showWelcomeDialog && isV1User && isMigrated;

  // Mark welcome as shown
  const handleWelcomeShown = () => {
    if (user?.id) {
      markWelcomeShownMutation.mutate(user.id);
    } else {
      setShowWelcomeDialog(false);
    }
  };

  return {
    // Status
    v1Status,
    isLoadingV1Status,
    v1StatusError,
    
    // Flags
    isV1User,
    isMigrated,
    hasShownWelcome,
    shouldShowWelcome,
    
    // Dialog control
    showWelcomeDialog: shouldShowWelcome,
    handleWelcomeShown,
    
    // Loading states
    isMigrating: migrateMutation.isLoading,
    isMarkingWelcomeShown: markWelcomeShownMutation.isLoading,
  };
}; 