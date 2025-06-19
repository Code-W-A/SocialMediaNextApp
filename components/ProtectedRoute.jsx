"use client";
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { shouldRedirectToOnboarding, checkOnboardingStatus } from '@/utils/onboardingHelpers';
import { Spin } from 'antd';

const ProtectedRoute = ({ children }) => {
  const { user, loading, isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isSignedIn) {
      router.push('/sign-in');
      return;
    }

    // Check if user needs to complete onboarding
    if (!loading && isSignedIn && user) {
      if (shouldRedirectToOnboarding(user, pathname)) {
        const status = checkOnboardingStatus(user);
        console.log('Redirecting to onboarding:', status.nextStep);
        router.push(status.nextStep);
      }
    }
  }, [loading, isSignedIn, user, router, pathname]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return children;
};

export default ProtectedRoute; 