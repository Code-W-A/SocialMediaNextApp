import { mockCurrentUser } from "@/mock/mockData";

// Mock currentUser function to replace Clerk's currentUser
export const currentUser = async () => {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockCurrentUser;
};

// Mock useUser hook to replace Clerk's useUser
export const useUser = () => {
  return {
    user: mockCurrentUser,
    isLoaded: true,
    isSignedIn: true,
  };
};

// Mock sign in function
export const signIn = async (email, password) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock validation - accept any email/password for demo
  if (email && password && password.length >= 6) {
    return {
      success: true,
      user: mockCurrentUser
    };
  } else {
    return {
      success: false,
      error: "Invalid email or password"
    };
  }
};

// Mock sign up function
export const signUp = async ({ email, password, firstName, lastName }) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock validation
  if (email && password && firstName && lastName) {
    // Create new user object
    const newUser = {
      ...mockCurrentUser,
      email_addresses: [{ email_address: email }],
      first_name: firstName,
      last_name: lastName,
      id: `user_${Date.now()}` // Generate unique ID
    };
    
    return {
      success: true,
      user: newUser
    };
  } else {
    return {
      success: false,
      error: "Please fill in all required fields"
    };
  }
};

// Mock authentication context
export const MockAuthProvider = ({ children }) => {
  return children;
}; 