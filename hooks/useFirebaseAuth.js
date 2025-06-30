"use client";
import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';

// Custom hook that maintains compatibility with the existing useUser hook
export const useUser = () => {
  const { user, loading, isSignedIn } = useAuth();
  
  // Memoize the transformed user object to prevent recreation on every render
  const transformedUser = useMemo(() => {
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email,
      first_name: user.firstName || user.username?.split(' ')[0] || '',
      last_name: user.lastName || user.username?.split(' ')[1] || '',
      email_addresses: [{ email_address: user.email }],
      // Include all other user data
      ...user
    };
  }, [user]);

  // Memoize the return object to prevent recreating it on every render
  return useMemo(() => ({
    user: transformedUser,
    isLoaded: !loading,
    isSignedIn,
  }), [transformedUser, loading, isSignedIn]);
};

// Export the auth context hook as well
export { useAuth } from '@/context/AuthContext'; 