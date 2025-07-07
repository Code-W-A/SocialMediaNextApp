"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useFirebaseAuth';
import ErrorBoundary from './ErrorBoundary';

const ErrorBoundaryWrapper = ({ children }) => {
  const router = useRouter();
  const { logout } = useAuth();

  const handleRedirectToLanding = async () => {
    try {
      console.log('🔄 [ErrorBoundary] Starting redirect to landing page...');
      
      // Attempt logout (but don't fail if it doesn't work)
      try {
        await logout();
        console.log('✅ [ErrorBoundary] User logged out successfully');
      } catch (logoutError) {
        console.warn('⚠️ [ErrorBoundary] Logout failed, but continuing with redirect:', logoutError);
      }

      // Clear any remaining storage items
      try {
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
          console.log('✅ [ErrorBoundary] Storage cleared successfully');
        }
      } catch (storageError) {
        console.warn('⚠️ [ErrorBoundary] Storage clear failed:', storageError);
      }

      // Force redirect to home page
      console.log('🏠 [ErrorBoundary] Redirecting to landing page...');
      window.location.href = '/';
      
    } catch (error) {
      console.error('❌ [ErrorBoundary] Error during redirect process:', error);
      // Fallback: Force redirect anyway
      window.location.href = '/';
    }
  };

  return (
    <ErrorBoundary onRedirectToLanding={handleRedirectToLanding}>
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundaryWrapper; 