"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { checkOnboardingStatus } from '@/utils/onboardingHelpers';
import { Spin } from 'antd';

// To reset first-time premium redirect for testing:
// localStorage.removeItem('firstTimeHome') or localStorage.setItem('firstTimeHome', 'true')

const OnboardingGuard = ({ children }) => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [recheckTrigger, setRecheckTrigger] = useState(0);

  useEffect(() => {
    const checkAndRedirect = async () => {
      console.log('🔄 [OnboardingGuard] Effect triggered:', {
        loading,
        hasUser: !!user,
        userId: user?.id,
        timestamp: new Date().toISOString()
      });
      
      if (!loading && user) {
        // Add a small delay to ensure data is fully loaded
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const status = checkOnboardingStatus(user);
        console.log('🔍 [OnboardingGuard] Checking status:', {
          userId: user.id,
          isComplete: status.isComplete,
          nextStep: status.nextStep,
          hasPhotos: status.hasPhotos,
          hasInterests: status.hasInterests,
          hasQuestionnaire: status.hasQuestionnaire,
          isMarkedComplete: status.isMarkedComplete,
          needsProfileCompletion: status.needsProfileCompletion
        });
        
        if (!status.isComplete && status.nextStep) {
          console.log('🚨 [OnboardingGuard] Redirecting to:', status.nextStep);
          router.push(status.nextStep);
          return;
        }
        
        // Check for first-time visit to home and redirect to premium
        if (status.isComplete && typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          const firstTimeHomeFlag = localStorage.getItem('firstTimeHome');
          
          console.log('🔍 [OnboardingGuard] First-time check:', {
            currentPath,
            firstTimeHomeFlag,
            shouldRedirect: currentPath === '/home' && firstTimeHomeFlag !== 'false'
          });
          
          // Only redirect on /home path and if it's the first time
          if (currentPath === '/home' && firstTimeHomeFlag !== 'false') {
            console.log('🎯 [OnboardingGuard] First time on home, redirecting to premium');
            // Mark as no longer first time BEFORE redirect to prevent loops
            localStorage.setItem('firstTimeHome', 'false');
            router.push('/premium');
            return;
          }
        }
        
        console.log('✅ [OnboardingGuard] Onboarding complete, allowing access');
      }
      
      setIsChecking(false);
    };

    checkAndRedirect();
  }, [user, loading, router, recheckTrigger]);

  // Recheck periodically when on profile-related pages to catch late updates
  useEffect(() => {
    if (!loading && user && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      
      // If we're on home or profile pages, set up periodic rechecks
      if (currentPath.includes('/home') || currentPath.includes('/profile')) {
        console.log('⏰ [OnboardingGuard] Setting up periodic recheck for path:', currentPath);
        
        const recheckInterval = setInterval(() => {
          console.log('🔄 [OnboardingGuard] Periodic recheck triggered');
          setRecheckTrigger(prev => prev + 1);
        }, 3000); // Recheck every 3 seconds for the first minute
        
        // Clear after 1 minute
        const timeoutId = setTimeout(() => {
          clearInterval(recheckInterval);
          console.log('⏹️ [OnboardingGuard] Periodic recheck stopped');
        }, 60000);
        
        return () => {
          clearInterval(recheckInterval);
          clearTimeout(timeoutId);
        };
      }
    }
  }, [user, loading]);

  // Show loading while checking auth state or onboarding status
  if (loading || isChecking) {
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

  // Additional check to prevent rendering if user still needs onboarding
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