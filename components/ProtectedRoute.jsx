"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { shouldRedirectToOnboarding, checkOnboardingStatus } from '@/utils/onboardingHelpers';
import { shouldForceProfileCompletion, shouldBypassProfileCompletion } from '@/utils/profileHelpers';
import { Spin } from 'antd';

const ProtectedRoute = ({ children }) => {
  const { user, loading, isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return; // Don't run effects until mounted

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
        return;
      }

      // Check if user needs to complete profile after onboarding
      if (!shouldBypassProfileCompletion(pathname)) {
        const needsProfileCompletion = shouldForceProfileCompletion({ data: user }, user);
        
        if (needsProfileCompletion && !pathname?.includes('/profile')) {
          console.log('🚨 Forcing profile completion redirect');
          router.push(`/profile/${user.id}?person=${user.firstName || user.first_name || 'User'}`);
          return;
        }
      }
    }
  }, [loading, isSignedIn, user, router, pathname, mounted]);

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

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