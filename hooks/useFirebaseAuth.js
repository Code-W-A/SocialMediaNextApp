"use client";
import { useAuth } from '@/context/AuthContext';

// Custom hook that maintains compatibility with the existing useUser hook
export const useUser = () => {
  const { user, loading, isSignedIn } = useAuth();
  
  return {
    user: user ? {
      id: user.id,
      email: user.email,
      first_name: user.firstName || user.username?.split(' ')[0] || '',
      last_name: user.lastName || user.username?.split(' ')[1] || '',
      email_addresses: [{ email_address: user.email }],
      // Include all other user data
      ...user
    } : null,
    isLoaded: !loading,
    isSignedIn,
  };
};

// Export the auth context hook as well
export { useAuth } from '@/context/AuthContext'; 