"use server";

import { 
  mockUsers, 
  mockCurrentUser, 
  mockFollows 
} from "@/mock/mockData";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Global variables to simulate database state
let mockUsersState = [...mockUsers];
let mockFollowsState = [...mockFollows];
let nextFollowId = Math.max(...mockFollows.map(f => f.id)) + 1;

// Mock current user function
const getCurrentUser = () => {
  return Promise.resolve(mockCurrentUser);
};

export const createUser = async (user) => {
  const { id, first_name, last_name, email_address, image_url, username } = user;
  try {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userExists = mockUsersState.find(u => u.id === id);
    if (userExists) {
      updateUser(user);
      return;
    }
    
    const newUser = {
        id,
        first_name,
        last_name,
        email_address,
        image_url,
        username,
      banner_url: null,
      banner_id: null,
    };
    
    mockUsersState.push(newUser);
    console.log("New user created in mock db");
  } catch (e) {
    console.log(e);
    return {
      error: "Failed to save new user in db",
    };
  }

  console.log("User created in mock database");
};

export const updateUser = async (user) => {
  const { id, first_name, last_name, email_address, image_url, username } = user;
  try {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userIndex = mockUsersState.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      mockUsersState[userIndex] = {
        ...mockUsersState[userIndex],
        first_name,
        last_name,
        email_address,
        image_url,
        username,
      };
    }
  } catch (e) {
    console.log(e);
    return {
      error: "Failed to update user in db",
    };
  }

  console.log("User updated in mock database");
};

export const getUser = async (id) => {
  try {
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'Users', id));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('Firestore user data retrieved:', userData);
      
      return { 
        data: {
          id: userDoc.id,
          // Firebase structure fields
          firstName: userData.firstName,
          lastName: userData.lastName,
          username: userData.username,
          email: userData.email,
          bio: userData.bio || '',
          location: userData.location || '',
          website: userData.website || '',
          relationshipStatus: userData.relationshipStatus || '',
          interests: userData.interests || [],
          images: userData.images || [],
          gpsCoordinates: userData.gpsCoordinates || null,
          banner_url: userData.banner_url || null,
          banner_id: userData.banner_id || null,
          verified: userData.verified || false,
          followers: userData.followers || [],
          following: userData.following || [],
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
          lastTimeActive: userData.lastTimeActive,
          
          // Legacy field mappings for backward compatibility
          first_name: userData.firstName || userData.first_name,
          last_name: userData.lastName || userData.last_name,
          email_address: userData.email || userData.email_address,
          image_url: userData.image_url,
          
          isIncomplete: false,
        }
      };
    } else {
      // User document doesn't exist, return incomplete profile data
      console.log('User document not found for ID:', id);
      return { 
        data: {
          id: id,
          firstName: null,
          lastName: null,
          first_name: null,
          last_name: null,
          email_address: null,
          email: null,
          image_url: null,
          username: null,
          bio: '',
          location: '',
          website: '',
          relationshipStatus: '',
          interests: [],
          images: [],
          gpsCoordinates: null,
          banner_url: null,
          banner_id: null,
          isIncomplete: true,
        }
      };
    }
  } catch (error) {
    console.error("Error fetching user from Firestore:", error);
    // Return incomplete data even on error
    return { 
      data: {
        id: id,
        firstName: null,
        lastName: null,
        first_name: null,
        last_name: null,
        email_address: null,
        email: null,
        image_url: null,
        username: null,
        bio: '',
        location: '',
        website: '',
        relationshipStatus: '',
        interests: [],
        images: [],
        gpsCoordinates: null,
        banner_url: null,
        banner_id: null,
        isIncomplete: true,
        error: true,
      }
    };
  }
};

export const deleteUser = async (id) => {
  try {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userIndex = mockUsersState.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      mockUsersState.splice(userIndex, 1);
    }
  } catch (e) {
    console.log(e);
    return {
      error: "Failed to delete user in db",
    };
  }

  console.log("User deleted in mock database");
};

export const updateBanner = async (params) => {
  const { id, banner, prevBannerId } = params;
  try {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let banner_id;
    let banner_url;

    if (banner) {
      // Mock file upload - just use the provided banner as URL
      banner_id = `banner_${id}_${Date.now()}`;
      banner_url = banner; // In mock, we'll just use the provided banner
    }
    
    const userIndex = mockUsersState.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      mockUsersState[userIndex] = {
        ...mockUsersState[userIndex],
        banner_url,
        banner_id,
      };
    }
    
    console.log("user banner updated");
  } catch (e) {
    console.log("Error updating user banner");
    throw e;
  }
};

export const updateFollow = async (params) => {
  const { id, type } = params;
  // type = follow or unfollow, id is target user id
  try {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const loggedInUser = await getCurrentUser();
    
    if (type === "follow") {
      // Check if already following
      const existingFollow = mockFollowsState.find(
        f => f.followerId === loggedInUser.id && f.followingId === id
      );
      
      if (!existingFollow) {
        const newFollow = {
          id: nextFollowId++,
          followerId: loggedInUser.id,
          followingId: id,
          createdAt: new Date(),
        };
        mockFollowsState.push(newFollow);
        console.log("User followed");
      }
    } else if (type === "unfollow") {
      const followIndex = mockFollowsState.findIndex(
        f => f.followerId === loggedInUser.id && f.followingId === id
      );
      
      if (followIndex !== -1) {
        mockFollowsState.splice(followIndex, 1);
      console.log("User unfollowed");
      }
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const getAllFollowersAndFollowings = async (id) => {
  try {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const followers = mockFollowsState
      .filter(f => f.followingId === id)
      .map(f => ({
        ...f,
        follower: mockUsersState.find(u => u.id === f.followerId),
      }));
    
    const following = mockFollowsState
      .filter(f => f.followerId === id)
      .map(f => ({
        ...f,
        following: mockUsersState.find(u => u.id === f.followingId),
      }));
    
    return {
      followers,
      following,
    };
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const getFollowSuggestions = async () => {
  try {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const currentUser = await getCurrentUser();

    // Get users that the current user is not following
    const currentUserFollowing = mockFollowsState
      .filter(f => f.followerId === currentUser.id)
      .map(f => f.followingId);
    
    const suggestions = mockUsersState
      .filter(u => u.id !== currentUser.id && !currentUserFollowing.includes(u.id))
      .slice(0, 5); // Return max 5 suggestions
    
    return {
      data: suggestions,
    };
  } catch (e) {
    throw e;
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const {
      id,
      firstName,
      lastName,
      username,
      bio,
      location,
      website,
      relationshipStatus,
      interests,
      images,
      gpsCoordinates,
      email_address,
      image_url,
      // Legacy fields for backward compatibility
      first_name,
      last_name,
    } = userData;

    // Prepare update data with proper field mapping
    const updateData = {
      // Use new field names as primary, fallback to legacy
      firstName: firstName || first_name,
      lastName: lastName || last_name,
      first_name: firstName || first_name, // Keep legacy field for compatibility
      last_name: lastName || last_name, // Keep legacy field for compatibility
      username,
      bio: bio || '',
      location: location || '',
      website: website || '',
      relationshipStatus: relationshipStatus || '',
      interests: interests || [],
      email_address,
      image_url,
      updatedAt: serverTimestamp(),
    };

    // Add GPS coordinates if provided
    if (gpsCoordinates) {
      updateData.gpsCoordinates = gpsCoordinates;
    }

    // Add images if provided
    if (images && Array.isArray(images)) {
      updateData.images = images;
    }

    // Remove undefined values to avoid overwriting existing data with undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    console.log('Updating user profile with data:', updateData);

    const userRef = doc(db, "Users", id);
    await updateDoc(userRef, updateData);

    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error(error.message || "Failed to update profile");
  }
};

// Update last time active for user
export const updateLastTimeActive = async (userId) => {
  try {
    if (!userId) return;
    
    const userRef = doc(db, 'Users', userId);
    await updateDoc(userRef, {
      lastTimeActive: serverTimestamp()
    });
    
    console.log('Last time active updated for user:', userId);
  } catch (error) {
    console.error('Error updating last time active:', error);
    // Don't throw error as this is not critical functionality
  }
};
