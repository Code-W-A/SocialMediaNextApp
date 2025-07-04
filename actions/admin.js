import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  addDoc,
  query,
  where,
  updateDoc,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  writeBatch
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

// Get all posts for admin moderation
export const getAllPostsForAdmin = async (limitCount = 20, lastCursor = null) => {
  try {
    console.log("🔥 getAllPostsForAdmin called:", { limitCount, lastCursor });
    
    const postsRef = collection(db, "Posts");
    let lastDocSnapshot = null;

    // If we have a cursor, get the document snapshot for proper pagination
    if (lastCursor) {
      try {
        const lastDocRef = doc(db, "Posts", lastCursor);
        lastDocSnapshot = await getDoc(lastDocRef);
        if (!lastDocSnapshot.exists()) {
          console.warn("⚠️ Last cursor document not found, starting from beginning");
          lastDocSnapshot = null;
        }
      } catch (error) {
        console.error("Error getting last document:", error);
        lastDocSnapshot = null;
      }
    }

    // Query all posts ordered by creation date
    const postsQuery = query(
      postsRef,
      orderBy("createdAt", "desc"),
      ...(lastDocSnapshot ? [startAfter(lastDocSnapshot)] : []),
      limit(limitCount)
    );

    const snapshot = await getDocs(postsQuery);
    console.log("📄 Raw posts retrieved:", snapshot.docs.length);

    if (snapshot.docs.length === 0) {
      return {
        data: [],
        metaData: {
          lastCursor: null,
          hasNextPage: false,
          totalCount: 0
        }
      };
    }

    // Get all author IDs
    const authorIds = [...new Set(snapshot.docs.map(doc => doc.data().authorId))];
    
    // Import user functions
    const { getUser } = await import('./user');
    const { serializeFirebaseData, toSerializableDate } = await import('../utils/firebaseHelpers');
    
    // Batch get authors
    const authorsMap = {};
    for (const authorId of authorIds) {
      try {
        const authorData = await getUser(authorId);
        if (authorData?.data) {
          authorsMap[authorId] = authorData.data;
        }
      } catch (error) {
        console.error(`Error fetching author ${authorId}:`, error);
        authorsMap[authorId] = {
          id: authorId,
          firstName: 'Unknown',
          lastName: 'User',
          username: 'unknown'
        };
      }
    }

    // Process posts with author data and comments
    const postsWithAuthors = await Promise.all(
      snapshot.docs.map(async (postDoc) => {
        const postData = postDoc.data();
        const authorData = authorsMap[postData.authorId];

        // Get comments for this post
        let comments = [];
        try {
          const commentsSnapshot = await getDocs(
            query(
              collection(db, "Posts", postDoc.id, "Comments"),
              orderBy("createdAt", "desc"),
              limit(5) // Get latest 5 comments for preview
            )
          );

          // Get comment authors
          const commentAuthorIds = [...new Set(commentsSnapshot.docs.map(doc => doc.data().authorId))];
          const commentAuthorsMap = {};
          
          for (const commentAuthorId of commentAuthorIds) {
            try {
              const commentAuthorData = await getUser(commentAuthorId);
              if (commentAuthorData?.data) {
                commentAuthorsMap[commentAuthorId] = commentAuthorData.data;
              }
            } catch (error) {
              commentAuthorsMap[commentAuthorId] = {
                id: commentAuthorId,
                firstName: 'Unknown',
                lastName: 'User',
                username: 'unknown'
              };
            }
          }

          comments = commentsSnapshot.docs.map(commentDoc => ({
            id: commentDoc.id,
            ...serializeFirebaseData(commentDoc.data()),
            createdAt: toSerializableDate(commentDoc.data().createdAt),
            author: commentAuthorsMap[commentDoc.data().authorId]
          }));

        } catch (commentsError) {
          console.error(`Error fetching comments for post ${postDoc.id}:`, commentsError);
        }

        return {
          id: postDoc.id,
          ...serializeFirebaseData(postData),
          createdAt: toSerializableDate(postData.createdAt),
          author: authorData,
          comments: comments,
          commentsCount: postData.commentsCount || 0
        };
      })
    );

    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    const hasNextPage = snapshot.docs.length === limitCount;

    console.log("✅ Processed posts for admin:", postsWithAuthors.length);

    return {
      data: postsWithAuthors,
      metaData: {
        lastCursor: lastDoc?.id || null,
        hasNextPage,
        totalCount: postsWithAuthors.length
      }
    };

  } catch (error) {
    console.error("❌ Error in getAllPostsForAdmin:", error);
    throw new Error(`Failed to fetch posts for admin: ${error.message}`);
  }
};

// Delete post as admin
export const deletePostAsAdmin = async (postId, adminUserId) => {
  try {
    console.log("🗑️ deletePostAsAdmin called:", { postId, adminUserId });
    
    if (!postId || !adminUserId) {
      throw new Error("Post ID and admin user ID are required");
    }

    // Get post data first for logging
    const postRef = doc(db, "Posts", postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error("Post not found");
    }

    const postData = postDoc.data();
    console.log("📝 Deleting post:", {
      postId,
      authorId: postData.authorId,
      deletedBy: adminUserId
    });

    // Use batch for atomic operations
    const batch = writeBatch(db);
    
    // Delete the post
    batch.delete(postRef);

    // Delete all comments in the post
    try {
      const commentsSnapshot = await getDocs(collection(db, "Posts", postId, "Comments"));
      commentsSnapshot.docs.forEach((commentDoc) => {
        batch.delete(commentDoc.ref);
      });
      console.log(`🗑️ Deleting ${commentsSnapshot.docs.length} comments`);
    } catch (commentsError) {
      console.error("Error deleting comments:", commentsError);
    }

    // Commit the batch
    await batch.commit();
    
    console.log("✅ Post and comments deleted successfully");
    
    return { 
      success: true, 
      message: `Post deleted successfully by admin`,
      deletedPostId: postId,
      deletedBy: adminUserId
    };

  } catch (error) {
    console.error("❌ Error deleting post as admin:", error);
    throw new Error(`Failed to delete post: ${error.message}`);
  }
};

// Delete comment as admin
export const deleteCommentAsAdmin = async (postId, commentId, adminUserId) => {
  try {
    console.log("🗑️ deleteCommentAsAdmin called:", { postId, commentId, adminUserId });
    
    if (!postId || !commentId || !adminUserId) {
      throw new Error("Post ID, comment ID and admin user ID are required");
    }

    // Get comment data first for logging
    const commentRef = doc(db, "Posts", postId, "Comments", commentId);
    const commentDoc = await getDoc(commentRef);
    
    if (!commentDoc.exists()) {
      throw new Error("Comment not found");
    }

    const commentData = commentDoc.data();
    console.log("💬 Deleting comment:", {
      commentId,
      postId,
      authorId: commentData.authorId,
      deletedBy: adminUserId
    });

    // Use batch for atomic operations
    const batch = writeBatch(db);
    
    // Delete the comment
    batch.delete(commentRef);

    // Update post's comments count
    const postRef = doc(db, "Posts", postId);
    const postDoc = await getDoc(postRef);
    
    if (postDoc.exists()) {
      const currentData = postDoc.data();
      const newCount = Math.max(0, (currentData.commentsCount || 0) - 1);
      
      batch.update(postRef, {
        commentsCount: newCount,
        updatedAt: serverTimestamp()
      });
      
      console.log("📊 Updated post comments count:", newCount);
    }

    // Commit the batch
    await batch.commit();
    
    console.log("✅ Comment deleted successfully by admin");
    
    return { 
      success: true, 
      message: `Comment deleted successfully by admin`,
      deletedCommentId: commentId,
      postId: postId,
      deletedBy: adminUserId
    };

  } catch (error) {
    console.error("❌ Error deleting comment as admin:", error);
    throw new Error(`Failed to delete comment: ${error.message}`);
  }
};

/**
 * Grant premium to a user manually from admin dashboard
 */
export const grantPremiumToUser = async (userId, premiumType = 'admin_granted', endDate = null) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Validate premium type
    const validTypes = ['admin_granted', 'lifetime', 'temporary'];
    if (!validTypes.includes(premiumType)) {
      throw new Error('Invalid premium type');
    }

    // Validate end date for temporary premium
    if (premiumType === 'temporary' && !endDate) {
      throw new Error('End date is required for temporary premium');
    }

    // Create premium subscription data using same structure as Stripe
    let currentPeriodEnd;
    if (premiumType === 'lifetime') {
      currentPeriodEnd = new Date(2099, 11, 31); // Far future date
    } else if (premiumType === 'temporary') {
      currentPeriodEnd = new Date(endDate);
    } else {
      currentPeriodEnd = new Date(2099, 11, 31); // Default to lifetime
    }

    const premiumData = {
      subscription: {
        status: 'active',
        isPremium: true,
        type: premiumType,
        source: 'admin_granted',
        customerId: null,
        subscriptionId: `admin_granted_${userId}_${Date.now()}`,
        currentPeriodStart: new Date(),
        currentPeriodEnd: currentPeriodEnd,
        cancelAtPeriodEnd: false,
        priceId: null,
        grantedAt: new Date(),
        grantedBy: 'admin',
        updatedAt: new Date()
      }
    };

    // Update user document
    const userRef = doc(db, 'Users', userId);
    await updateDoc(userRef, premiumData);

    console.log(`✅ Successfully granted ${premiumType} premium to user ${userId}`);
    
    return {
      success: true,
      message: `Premium ${premiumType} granted successfully`,
      premiumData: premiumData.subscription
    };
  } catch (error) {
    console.error('Error granting premium to user:', error);
    throw error;
  }
};

/**
 * Remove premium from a user manually from admin dashboard
 */
export const removePremiumFromUser = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Remove premium subscription data
    const premiumRemovalData = {
      subscription: {
        status: 'canceled',
        isPremium: false,
        canceledAt: new Date(),
        canceledBy: 'admin',
        updatedAt: new Date()
      }
    };

    // Update user document
    const userRef = doc(db, 'Users', userId);
    await updateDoc(userRef, premiumRemovalData);

    console.log(`✅ Successfully removed premium from user ${userId}`);
    
    return {
      success: true,
      message: 'Premium removed successfully'
    };
  } catch (error) {
    console.error('Error removing premium from user:', error);
    throw error;
  }
}; 