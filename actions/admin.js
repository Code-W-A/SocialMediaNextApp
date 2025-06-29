import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  addDoc,
  query,
  where
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Get all users for admin dashboard
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, "Users");
    const snapshot = await getDocs(usersRef);
    
    const users = [];
    snapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        ...userData,
      });
    });
    
    return users;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

// Get user's compatibilities
export const getUserCompatibilities = async (userId) => {
  try {
    if (!userId) return [];
    
    const compatibilitiesRef = collection(db, "Compatibilities");
    const q = query(compatibilitiesRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    
    const compatibilityUserIds = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      compatibilityUserIds.push(data.targetUserId);
    });
    
    // Fetch user details for each compatibility
    const compatibleUsers = [];
    for (const targetUserId of compatibilityUserIds) {
      const userDoc = await getDoc(doc(db, "Users", targetUserId));
      if (userDoc.exists()) {
        compatibleUsers.push({
          id: userDoc.id,
          ...userDoc.data(),
        });
      }
    }
    
    return compatibleUsers;
  } catch (error) {
    console.error("Error fetching user compatibilities:", error);
    throw error;
  }
};

// Add compatibility between two users (bidirectional)
export const addCompatibility = async ({ userId, targetUserId }) => {
  try {
    if (!userId || !targetUserId) {
      throw new Error("Both userId and targetUserId are required");
    }
    
    if (userId === targetUserId) {
      throw new Error("Cannot add compatibility with yourself");
    }
    
    // Check if compatibility already exists
    const compatibilitiesRef = collection(db, "Compatibilities");
    const existingQuery = query(
      compatibilitiesRef, 
      where("userId", "==", userId),
      where("targetUserId", "==", targetUserId)
    );
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      throw new Error("Compatibility already exists");
    }
    
    // Add bidirectional compatibility
    await addDoc(compatibilitiesRef, {
      userId: userId,
      targetUserId: targetUserId,
      createdAt: new Date(),
      createdBy: "admin"
    });
    
    await addDoc(compatibilitiesRef, {
      userId: targetUserId,
      targetUserId: userId,
      createdAt: new Date(),
      createdBy: "admin"
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error adding compatibility:", error);
    throw error;
  }
};

// Remove compatibility between two users (bidirectional)
export const removeCompatibility = async ({ userId, targetUserId }) => {
  try {
    if (!userId || !targetUserId) {
      throw new Error("Both userId and targetUserId are required");
    }
    
    const compatibilitiesRef = collection(db, "Compatibilities");
    
    // Remove both directions of compatibility
    const query1 = query(
      compatibilitiesRef,
      where("userId", "==", userId),
      where("targetUserId", "==", targetUserId)
    );
    const snapshot1 = await getDocs(query1);
    snapshot1.forEach(async (docSnapshot) => {
      await deleteDoc(doc(db, "Compatibilities", docSnapshot.id));
    });
    
    const query2 = query(
      compatibilitiesRef,
      where("userId", "==", targetUserId),
      where("targetUserId", "==", userId)
    );
    const snapshot2 = await getDocs(query2);
    snapshot2.forEach(async (docSnapshot) => {
      await deleteDoc(doc(db, "Compatibilities", docSnapshot.id));
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error removing compatibility:", error);
    throw error;
  }
};

// Get compatibilities for a specific user (for user-facing features)
export const getMyCompatibilities = async (userId) => {
  try {
    if (!userId) return [];
    
    const compatibilitiesRef = collection(db, "Compatibilities");
    const q = query(compatibilitiesRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    
    const compatibilityUserIds = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      compatibilityUserIds.push(data.targetUserId);
    });
    
    return compatibilityUserIds;
  } catch (error) {
    console.error("Error fetching my compatibilities:", error);
    throw error;
  }
};

// Get compatible users with full profile data for messages/chat
export const getMyCompatibleUsers = async (userId) => {
  try {
    if (!userId) return [];
    
    const compatibilitiesRef = collection(db, "Compatibilities");
    const q = query(compatibilitiesRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    
    const compatibleUsers = [];
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      const targetUserId = data.targetUserId;
      
      // Get full user data
      try {
        const userDoc = await getDoc(doc(db, "Users", targetUserId));
        if (userDoc.exists()) {
          compatibleUsers.push({
            id: userDoc.id,
            ...userDoc.data(),
            compatibilityId: docSnapshot.id,
            compatibilityCreatedAt: data.createdAt
          });
        }
      } catch (userError) {
        console.error(`Error fetching user ${targetUserId}:`, userError);
      }
    }
    
    return compatibleUsers;
  } catch (error) {
    console.error("Error fetching compatible users:", error);
    throw error;
  }
};

// Check if two users are compatible
export const areUsersCompatible = async (userId1, userId2) => {
  try {
    if (!userId1 || !userId2) return false;
    
    const compatibilitiesRef = collection(db, "Compatibilities");
    const q = query(
      compatibilitiesRef,
      where("userId", "==", userId1),
      where("targetUserId", "==", userId2)
    );
    const snapshot = await getDocs(q);
    
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking compatibility:", error);
    return false;
  }
};

// Bulk add compatibilities between opposite genders with similar age ranges
export const addOppositeGenderCompatibilities = async () => {
  try {
    const users = await getAllUsers();
    const compatibilitiesRef = collection(db, "Compatibilities");
    const addedCount = { total: 0, skipped: 0 };
    
    for (const user of users) {
      if (!user.gender || !user.age) continue;
      
      // Find potential matches: opposite gender, age ±5 years
      const potentialMatches = users.filter(otherUser => {
        if (!otherUser.gender || !otherUser.age || otherUser.id === user.id) return false;
        
        // Check opposite gender
        const isOppositeGender = 
          (user.gender === 'male' && otherUser.gender === 'female') ||
          (user.gender === 'female' && otherUser.gender === 'male');
        
        if (!isOppositeGender) return false;
        
        // Check similar age (±5 years)
        const ageDiff = Math.abs(user.age - otherUser.age);
        return ageDiff <= 5;
      });
      
      // Add compatibilities for this user
      for (const match of potentialMatches) {
        try {
          // Check if compatibility already exists
          const existingQuery = query(
            compatibilitiesRef,
            where("userId", "==", user.id),
            where("targetUserId", "==", match.id)
          );
          const existingSnapshot = await getDocs(existingQuery);
          
          if (existingSnapshot.empty) {
            // Add bidirectional compatibility
            await addDoc(compatibilitiesRef, {
              userId: user.id,
              targetUserId: match.id,
              createdAt: new Date(),
              createdBy: "admin-bulk-opposite"
            });
            
            await addDoc(compatibilitiesRef, {
              userId: match.id,
              targetUserId: user.id,
              createdAt: new Date(),
              createdBy: "admin-bulk-opposite"
            });
            
            addedCount.total++;
          } else {
            addedCount.skipped++;
          }
        } catch (error) {
          console.error(`Error adding compatibility between ${user.id} and ${match.id}:`, error);
          addedCount.skipped++;
        }
      }
    }
    
    return { 
      success: true, 
      message: `Added ${addedCount.total} new compatibilities, skipped ${addedCount.skipped} existing ones`
    };
  } catch (error) {
    console.error("Error in bulk add opposite gender compatibilities:", error);
    throw error;
  }
};

// Bulk add compatibilities between same genders with any age range
export const addSameGenderCompatibilities = async () => {
  try {
    const users = await getAllUsers();
    const compatibilitiesRef = collection(db, "Compatibilities");
    const addedCount = { total: 0, skipped: 0 };
    
    for (const user of users) {
      if (!user.gender) continue;
      
      // Find potential matches: same gender, any age
      const potentialMatches = users.filter(otherUser => {
        if (!otherUser.gender || otherUser.id === user.id) return false;
        
        // Check same gender
        return user.gender === otherUser.gender;
      });
      
      // Add compatibilities for this user
      for (const match of potentialMatches) {
        try {
          // Check if compatibility already exists
          const existingQuery = query(
            compatibilitiesRef,
            where("userId", "==", user.id),
            where("targetUserId", "==", match.id)
          );
          const existingSnapshot = await getDocs(existingQuery);
          
          if (existingSnapshot.empty) {
            // Add bidirectional compatibility
            await addDoc(compatibilitiesRef, {
              userId: user.id,
              targetUserId: match.id,
              createdAt: new Date(),
              createdBy: "admin-bulk-same"
            });
            
            await addDoc(compatibilitiesRef, {
              userId: match.id,
              targetUserId: user.id,
              createdAt: new Date(),
              createdBy: "admin-bulk-same"
            });
            
            addedCount.total++;
          } else {
            addedCount.skipped++;
          }
        } catch (error) {
          console.error(`Error adding compatibility between ${user.id} and ${match.id}:`, error);
          addedCount.skipped++;
        }
      }
    }
    
    return { 
      success: true, 
      message: `Added ${addedCount.total} new compatibilities, skipped ${addedCount.skipped} existing ones`
    };
  } catch (error) {
    console.error("Error in bulk add same gender compatibilities:", error);
    throw error;
  }
};

// Get online compatible users for current user
export const getOnlineCompatibleUsers = async (userId) => {
  try {
    if (!userId) return [];
    
    console.log("🔥 getOnlineCompatibleUsers called for userId:", userId);
    
    // Get compatible users IDs
    const compatibleUserIds = await getMyCompatibilities(userId);
    console.log("👥 Found compatible user IDs:", compatibleUserIds.length);
    
    if (compatibleUserIds.length === 0) {
      console.log("⚠️ No compatible users found");
      return [];
    }
    
    // Get users with their real presence status from Firestore
    const { getUsersWithPresence } = await import('./user');
    const usersWithPresence = await getUsersWithPresence(compatibleUserIds);
    console.log("📊 Users with presence data:", usersWithPresence.length);
    
    // Filter to only show online and away users, sort by priority
    const activeOnlineUsers = usersWithPresence
      .filter(user => user.presence?.status === 'online' || user.presence?.status === 'away')
      .sort((a, b) => {
        // Prioritize online over away
        if (a.presence.status === 'online' && b.presence.status !== 'online') return -1;
        if (b.presence.status === 'online' && a.presence.status !== 'online') return 1;
        // Then sort by last activity (most recent first)
        return new Date(b.presence.lastActivity) - new Date(a.presence.lastActivity);
      })
      .slice(0, 8) // Show max 8 online users
      .map(user => ({
        ...user,
        // Map presence data to expected format
        status: user.presence.status,
        isOnline: user.presence.isOnline,
        lastSeen: user.presence.lastSeen,
        lastActivity: user.presence.lastActivity,
        inactiveMinutes: user.presence.inactiveMinutes
      }));
    
    console.log("🟢 Active online compatible users:", activeOnlineUsers.length);
    return activeOnlineUsers;
    
  } catch (error) {
    console.error("❌ Error fetching online compatible users:", error);
    return [];
  }
}; 