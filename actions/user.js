"use server";

import { 
  mockUsers, 
  mockCurrentUser, 
  mockFollows 
} from "@/mock/mockData";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db } from "@/lib/firebase";
import { serializeFirebaseData } from '@/utils/firebaseHelpers';
import { now } from '@/utils/dateHelpers';

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

      
      const userDataResult = {
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
      };

      return { 
        data: serializeFirebaseData(userDataResult)
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
  
  console.log('🎭 [updateBanner] Starting banner update:', { 
    userId: id, 
    hasBanner: !!banner, 
    prevBannerId 
  });
  
  try {
    let banner_id = null;
    let banner_url = null;

    if (banner) {
      console.log('📤 [updateBanner] Processing banner upload...');
      
      // Convert base64 to blob
      const response = await fetch(banner);
      const blob = await response.blob();
      
      console.log('📊 [updateBanner] Banner blob created:', {
        size: blob.size,
        type: blob.type
      });

      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = blob.type.split('/')[1] || 'jpg';
      const fileName = `banner_${timestamp}.${fileExtension}`;
      const filePath = `banners/${id}/${fileName}`;
      
      console.log('☁️ [updateBanner] Uploading to Firebase Storage:', { 
        fileName, 
        filePath,
        size: blob.size 
      });
      
      // Upload to Firebase Storage
      const storage = getStorage();
      const storageRef = ref(storage, filePath);
      const snapshot = await uploadBytes(storageRef, blob);
      banner_url = await getDownloadURL(snapshot.ref);
      banner_id = fileName;
      
      console.log('✅ [updateBanner] Banner uploaded successfully:', { 
        banner_url, 
        banner_id 
      });

      // Delete previous banner if exists
      if (prevBannerId) {
        try {
          console.log('🗑️ [updateBanner] Deleting previous banner:', prevBannerId);
          const prevStorageRef = ref(storage, `banners/${id}/${prevBannerId}`);
          await deleteObject(prevStorageRef);
          console.log('✅ [updateBanner] Previous banner deleted successfully');
        } catch (deleteError) {
          console.warn('⚠️ [updateBanner] Could not delete previous banner:', deleteError.message);
          // Continue even if delete fails - not critical
        }
      }
    } else {
      console.log('🚫 [updateBanner] No banner provided, clearing banner data');
    }

    // Update Firestore
    console.log('💾 [updateBanner] Updating Firestore with banner data...');
    const userRef = doc(db, 'Users', id);
    
    const updateData = {
      banner_url,
      banner_id,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(userRef, updateData);
    
    console.log('✅ [updateBanner] Firestore updated successfully:', updateData);
    
    return {
      success: true,
      banner_url,
      banner_id
    };
    
  } catch (error) {
    console.error('❌ [updateBanner] Error updating banner:', error);
    console.error('📊 [updateBanner] Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw new Error(`Failed to update banner: ${error.message}`);
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

    // Validate required fields
    if (!id) {
      throw new Error("User ID is required");
    }

    // Validate and sanitize string fields
    const sanitizeString = (str, maxLength = 255) => {
      if (!str) return '';
      return String(str).trim().substring(0, maxLength);
    };

    // Validate and sanitize array fields
    const sanitizeArray = (arr, maxItems = 50) => {
      if (!Array.isArray(arr)) return [];
      return arr.slice(0, maxItems).filter(item => item != null);
    };

    // Validate website URL
    const validateWebsite = (url) => {
      if (!url) return '';
      try {
        const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
        return urlObj.href;
      } catch {
        return '';
      }
    };

    // Validate GPS coordinates
    const validateGpsCoordinates = (coords) => {
      if (!coords || typeof coords !== 'object') return null;
      
      const lat = parseFloat(coords.latitude);
      const lng = parseFloat(coords.longitude);
      
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return null;
      }
      
      return { latitude: lat, longitude: lng };
    };

    // Prepare update data with proper field mapping and validation
    const updateData = {
      // Use new field names as primary, fallback to legacy
      firstName: sanitizeString(firstName || first_name, 50),
      lastName: sanitizeString(lastName || last_name, 50),
      first_name: sanitizeString(firstName || first_name, 50), // Keep legacy field for compatibility
      last_name: sanitizeString(lastName || last_name, 50), // Keep legacy field for compatibility
      username: sanitizeString(username, 30),
      bio: sanitizeString(bio, 500),
      location: sanitizeString(location, 100),
      website: validateWebsite(website),
      relationshipStatus: sanitizeString(relationshipStatus, 50),
      interests: sanitizeArray(interests, 20).map(i => sanitizeString(i, 50)),
      updatedAt: serverTimestamp(),
    };

    // Add optional fields only if provided
    if (email_address) {
      updateData.email_address = sanitizeString(email_address, 255);
    }
    
    if (image_url) {
      updateData.image_url = sanitizeString(image_url, 500);
    }

    // Add GPS coordinates if provided and valid
    const validatedCoords = validateGpsCoordinates(gpsCoordinates);
    if (validatedCoords) {
      updateData.gpsCoordinates = validatedCoords;
    }

    // Validate and add images if provided
    if (images && Array.isArray(images)) {
      const validImages = images
        .slice(0, 10) // Max 10 images
        .filter(img => 
          img && 
          typeof img === 'object' && 
          img.fileName && 
          img.fileUri &&
          typeof img.fileName === 'string' &&
          typeof img.fileUri === 'string'
        )
        .map(img => ({
          fileName: sanitizeString(img.fileName, 255),
          fileUri: sanitizeString(img.fileUri, 500),
          isMain: Boolean(img.isMain)
        }));
      
      // Ensure at least one image is marked as main
      if (validImages.length > 0 && !validImages.some(img => img.isMain)) {
        validImages[0].isMain = true;
      }
      
      updateData.images = validImages;
    }

    // Remove undefined values to avoid overwriting existing data with undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    console.log('Updating user profile with validated data:', updateData);

    const userRef = doc(db, "Users", id);
    await updateDoc(userRef, updateData);

    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error(error.message || "Failed to update profile");
  }
};

// Update last time active for user - with rate limiting
const lastActivityUpdate = new Map();

export const updateLastTimeActive = async (userId) => {
  try {
    if (!userId) return;
    
    // Rate limit: only update once per minute per user
    const now = Date.now();
    const lastUpdate = lastActivityUpdate.get(userId) || 0;
    
    if (now - lastUpdate < 60000) { // 1 minute
      console.log('Skipping last time active update - too frequent');
      return;
    }
    
    const userRef = doc(db, 'Users', userId);
    await updateDoc(userRef, {
      lastTimeActive: serverTimestamp()
    });
    
    lastActivityUpdate.set(userId, now);
    console.log('Last time active updated for user:', userId);
  } catch (error) {
    console.error('Error updating last time active:', error);
    // Don't throw error as this is not critical functionality
  }
};

// Real-time presence tracking functions
export const updateUserPresence = async (userId, status = 'online') => {
  try {
    if (!userId) {
      console.log("❌ No userId provided to updateUserPresence");
      return;
    }
    
    console.log("🔥 Updating user presence:", { userId, status });
    
    const userRef = doc(db, "Users", userId);
    const presenceData = {
      status, // 'online', 'away', 'offline'
      lastSeen: serverTimestamp(),
      lastActivity: serverTimestamp(),
    };
    
    console.log("📝 Writing presence data:", presenceData);
    
    // Check if user document exists first
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      console.log("❌ User document does not exist, cannot update presence");
      return;
    }
    
    // Update user document with presence info
    await updateDoc(userRef, {
      presence: presenceData,
      updatedAt: serverTimestamp()
    });
    
    console.log("✅ User presence updated successfully in Firestore");
  } catch (error) {
    console.error("❌ Error updating user presence:", error);
    console.error("❌ Error details:", error.message);
  }
};

// Set user online when they connect
export const setUserOnline = async (userId) => {
  try {
    if (!userId) return;
    
    console.log("🟢 Setting user online:", userId);
    await updateUserPresence(userId, 'online');
    
    // Set up automatic offline detection after inactivity
    const userRef = doc(db, "Users", userId);
    await updateDoc(userRef, {
      'presence.connectedAt': serverTimestamp(),
      'presence.sessionId': `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
    
  } catch (error) {
    console.error("❌ Error setting user online:", error);
  }
};

// Set user offline when they disconnect
export const setUserOffline = async (userId) => {
  try {
    if (!userId) return;
    
    console.log("🔴 Setting user offline:", userId);
    await updateUserPresence(userId, 'offline');
    
  } catch (error) {
    console.error("❌ Error setting user offline:", error);
  }
};

// Set user away (idle/inactive)
export const setUserAway = async (userId) => {
  try {
    if (!userId) return;
    
    console.log("🟡 Setting user away:", userId);
    await updateUserPresence(userId, 'away');
    
  } catch (error) {
    console.error("❌ Error setting user away:", error);
  }
};

// Update last activity timestamp
export const updateLastActivity = async (userId) => {
  try {
    if (!userId) return;
    
    const userRef = doc(db, "Users", userId);
    await updateDoc(userRef, {
      'presence.lastActivity': serverTimestamp(),
      'presence.status': 'online' // Reset to online if they were away
    });
    
  } catch (error) {
    console.error("❌ Error updating last activity:", error);
  }
};

// Get users with their presence status
export const getUsersWithPresence = async (userIds) => {
  try {
    if (!userIds || userIds.length === 0) return [];
    
    console.log("👥 Getting users with presence:", userIds.length);
    
    const users = [];
    for (const userId of userIds) {
      const userDoc = await getDoc(doc(db, "Users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const presence = userData.presence || {
          status: 'offline',
          lastSeen: serverTimestamp(),
          lastActivity: serverTimestamp()
        };
        
        // Calculate if user should be considered offline due to inactivity
        let lastActivity = new Date();
        if (presence.lastActivity) {
          // Handle both Firebase Timestamp and already converted timestamps
          if (typeof presence.lastActivity.toDate === 'function') {
            lastActivity = presence.lastActivity.toDate();
          } else if (presence.lastActivity.seconds) {
            // Convert from Firebase timestamp format
            lastActivity = new Date(presence.lastActivity.seconds * 1000 + (presence.lastActivity.nanoseconds || 0) / 1000000);
          } else if (typeof presence.lastActivity === 'string') {
            lastActivity = new Date(presence.lastActivity);
          }
        }
        
        const now = new Date();
        const inactiveMinutes = (now - lastActivity) / (1000 * 60);
        
        // Consider user offline if inactive for more than 5 minutes
        let actualStatus = presence.status;
        if (inactiveMinutes > 5) {
          actualStatus = 'offline';
        } else if (inactiveMinutes > 2 && presence.status === 'online') {
          actualStatus = 'away';
        }
        
        // Create the user object with properly serialized data
        const userWithPresence = {
          id: userDoc.id,
          ...userData,
          presence: {
            status: actualStatus,
            lastSeen: presence.lastSeen,
            lastActivity: presence.lastActivity,
            isOnline: actualStatus === 'online',
            inactiveMinutes: Math.floor(inactiveMinutes)
          }
        };
        
        // Serialize all Firebase data before returning
        users.push(serializeFirebaseData(userWithPresence));
      }
    }
    
    console.log("✅ Users with presence retrieved:", users.length);
    return users;
    
  } catch (error) {
    console.error("❌ Error getting users with presence:", error);
    return [];
  }
};
