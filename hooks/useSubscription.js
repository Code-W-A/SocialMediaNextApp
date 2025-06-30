"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserSubscription, createCheckoutSession, createPortalSession } from '@/actions/subscription';
import { useUser } from '@/hooks/useFirebaseAuth';
import { message } from 'antd';

export const useSubscription = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  // Get user's subscription status
  const {
    data: subscription,
    isLoading: isLoadingSubscription,
    error: subscriptionError,
  } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: () => getUserSubscription(user?.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Create checkout session mutation
  const createCheckoutMutation = useMutation({
    mutationFn: (customerEmail) => createCheckoutSession(user?.id, customerEmail),
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      console.error('Error creating checkout session:', error);
      message.error('Eroare la crearea sesiunii de plată. Încearcă din nou.');
    },
  });

  // Create portal session mutation
  const createPortalMutation = useMutation({
    mutationFn: (customerId) => createPortalSession(customerId),
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      console.error('Error creating portal session:', error);
      message.error('Eroare la accesarea portalului de facturare. Încearcă din nou.');
    },
  });

  // Client-side expiration check (backup to webhooks)
  const checkSubscriptionExpiration = () => {
    if (!subscription || !subscription.currentPeriodEnd) return subscription?.isPremium || false;
    
    const now = new Date();
    const periodEnd = new Date(subscription.currentPeriodEnd);
    const isCanceled = subscription.cancelAtPeriodEnd;
    
    // If subscription is canceled and period has ended, it should not be premium
    if (isCanceled && now > periodEnd) {
      console.warn('⚠️ Subscription expired but still marked as premium. This should trigger a status check.');
      // Refresh subscription data to get latest status from server
      queryClient.invalidateQueries(['subscription', user?.id]);
      return false;
    }
    
    return subscription.isPremium;
  };

  // Helper functions
  const isPremium = checkSubscriptionExpiration();
  const isActive = subscription?.status === 'active';
  const isTrialing = subscription?.status === 'trialing';
  const isCanceled = subscription?.cancelAtPeriodEnd || false;

  // Start premium subscription
  const startPremiumSubscription = (customerEmail = user?.email) => {
    if (!user?.id) {
      message.error('Trebuie să fii autentificat pentru a face upgrade la Premium.');
      return;
    }
    createCheckoutMutation.mutate(customerEmail);
  };

  // Manage subscription (billing portal)
  const manageSubscription = () => {
    if (!subscription?.customerId) {
      message.error('Nu s-a găsit informația despre abonament.');
      return;
    }
    createPortalMutation.mutate(subscription.customerId);
  };

  // Refresh subscription data
  const refreshSubscription = () => {
    queryClient.invalidateQueries(['subscription', user?.id]);
  };

  return {
    // Subscription data
    subscription,
    isLoadingSubscription,
    subscriptionError,
    
    // Status checks
    isPremium,
    isActive,
    isTrialing,
    isCanceled,
    
    // Actions
    startPremiumSubscription,
    manageSubscription,
    refreshSubscription,
    
    // Loading states
    isCreatingCheckout: createCheckoutMutation.isLoading,
    isCreatingPortal: createPortalMutation.isLoading,
  };
}; 