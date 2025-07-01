"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { checkOnboardingStatus } from '@/utils/onboardingHelpers';
import { Spin } from 'antd';

const OnboardingGuard = ({ children }) => {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      const status = checkOnboardingStatus(user);
      if (!status.isComplete) {
        // If onboarding is not complete, redirect to next step
        router.push(status.nextStep || '/onboarding');
      }
    }
  }, [user, loading, router]);

  // Show loading while checking auth state
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

  // Show loading while checking onboarding status
  if (user) {
    const status = checkOnboardingStatus(user);
    if (!status.isComplete) {
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
  }

  return children;
};

export default OnboardingGuard; 