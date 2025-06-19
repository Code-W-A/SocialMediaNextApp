import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  getDoc,
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  or,
  and,
  writeBatch,
  setDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Create a new conversation between two users
export const createConversation = async ({ user1Id, user2Id }) => {
  try {
    if (!user1Id || !user2Id) {
      throw new Error("Both user IDs are required");
    }

    if (user1Id === user2Id) {
      throw new Error("Cannot create conversation with yourself");
    }

    // Check if conversation already exists using a single array-contains filter
    const conversationsRef = collection(db, "Conversations");
    const queryByUser1 = query(
      conversationsRef,
      where("participants", "array-contains", user1Id)
    );

    const existingSnapshot = await getDocs(queryByUser1);

    // Iterate and check if any conversation already includes the second user
    for (const docSnap of existingSnapshot.docs) {
      const data = docSnap.data();
      if (data.participants && data.participants.includes(user2Id)) {
        return {
          success: true,
          conversationId: docSnap.id,
          isNew: false
        };
      }
    }

    // Create new conversation
    const newConversation = {
      participants: [user1Id, user2Id],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: null,
      lastMessageTime: null,
      unreadCounts: {
        [user1Id]: 0,
        [user2Id]: 0
      }
    };

    const docRef = await addDoc(conversationsRef, newConversation);
    
    return { 
      success: true, 
      conversationId: docRef.id,
      isNew: true 
    };
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
};

// Get user's conversations
export const getUserConversations = async (userId) => {
  try {
    if (!userId) return [];
    
    const conversationsRef = collection(db, "Conversations");
    const q = query(
      conversationsRef, 
      where("participants", "array-contains", userId),
      orderBy("updatedAt", "desc")
    );
    
    const snapshot = await getDocs(q);
    const conversations = [];
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      
      // Get the other participant's info
      const otherUserId = data.participants.find(id => id !== userId);
      const otherUserDoc = await getDoc(doc(db, "Users", otherUserId));
      
      if (otherUserDoc.exists()) {
        conversations.push({
          id: docSnapshot.id,
          ...data,
          otherUser: {
            id: otherUserDoc.id,
            ...otherUserDoc.data()
          },
          unreadCount: data.unreadCounts?.[userId] || 0
        });
      }
    }
    
    return conversations;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};

// Send a message in a conversation
export const sendMessage = async ({ conversationId, senderId, text, type = "text" }) => {
  try {
    if (!conversationId || !senderId || !text.trim()) {
      throw new Error("Conversation ID, sender ID, and message text are required");
    }

    // Add message to Messages subcollection
    const messagesRef = collection(db, "Conversations", conversationId, "Messages");
    const messageDoc = await addDoc(messagesRef, {
      senderId,
      text: text.trim(),
      type,
      timestamp: serverTimestamp(),
      read: false
    });

    // Update conversation with last message
    const conversationRef = doc(db, "Conversations", conversationId);
    const conversationDoc = await getDoc(conversationRef);
    
    if (conversationDoc.exists()) {
      const conversationData = conversationDoc.data();
      const participants = conversationData.participants;
      const otherUserId = participants.find(id => id !== senderId);
      
      // Update unread counts
      const newUnreadCounts = {
        ...conversationData.unreadCounts,
        [otherUserId]: (conversationData.unreadCounts?.[otherUserId] || 0) + 1,
        [senderId]: 0 // Reset sender's unread count
      };

      await updateDoc(conversationRef, {
        lastMessage: {
          id: messageDoc.id,
          text: text.trim(),
          senderId,
          timestamp: serverTimestamp(),
          type
        },
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
        unreadCounts: newUnreadCounts
      });
    }

    return {
      success: true,
      messageId: messageDoc.id
    };
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Get messages for a conversation
export const getConversationMessages = async (conversationId, limitCount = 50) => {
  try {
    if (!conversationId) return [];
    
    const messagesRef = collection(db, "Conversations", conversationId, "Messages");
    const q = query(
      messagesRef,
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).reverse(); // Reverse to get chronological order
    
    return messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

// Mark messages as read in a conversation
export const markMessagesAsRead = async (conversationId, userId) => {
  try {
    if (!conversationId || !userId) return;
    
    // Update conversation unread count
    const conversationRef = doc(db, "Conversations", conversationId);
    const conversationDoc = await getDoc(conversationRef);
    
    if (conversationDoc.exists()) {
      const conversationData = conversationDoc.data();
      const newUnreadCounts = {
        ...conversationData.unreadCounts,
        [userId]: 0
      };

      await updateDoc(conversationRef, {
        unreadCounts: newUnreadCounts
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
};

// Real-time listener for conversations
export const subscribeToUserConversations = (userId, callback) => {
  if (!userId) {
    callback([]);
    return () => {};
  }
  
  const conversationsRef = collection(db, "Conversations");
  const q = query(
    conversationsRef, 
    where("participants", "array-contains", userId),
    orderBy("updatedAt", "desc")
  );
  
  return onSnapshot(q, async (snapshot) => {
    try {
      const conversations = [];
      
      if (snapshot.empty) {
        callback([]);
        return;
      }
      
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        
        // Get the other participant's info
        const otherUserId = data.participants.find(id => id !== userId);
        if (!otherUserId) continue;
        
        try {
          const otherUserDoc = await getDoc(doc(db, "Users", otherUserId));
          
          if (otherUserDoc.exists()) {
            conversations.push({
              id: docSnapshot.id,
              ...data,
              otherUser: {
                id: otherUserDoc.id,
                ...otherUserDoc.data()
              },
              unreadCount: data.unreadCounts?.[userId] || 0
            });
          }
        } catch (userError) {
          console.error(`Error fetching user ${otherUserId}:`, userError);
          // Continue with other conversations even if one user fetch fails
        }
      }
      
      callback(conversations);
    } catch (error) {
      console.error("Error in conversations subscription:", error);
      callback([]); // Return empty array on error
    }
  }, (error) => {
    console.error("Conversations subscription error:", error);
    callback([]); // Return empty array on subscription error
  });
};

// Real-time listener for messages in a conversation
export const subscribeToConversationMessages = (conversationId, callback, limitCount = 50) => {
  if (!conversationId) return () => {};
  
  const messagesRef = collection(db, "Conversations", conversationId, "Messages");
  const q = query(
    messagesRef,
    orderBy("timestamp", "desc"),
    limit(limitCount)
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).reverse(); // Reverse to get chronological order
    
    callback(messages);
  });
};

// Get conversation by ID
export const getConversationById = async (conversationId) => {
  try {
    if (!conversationId) return null;
    
    const conversationRef = doc(db, "Conversations", conversationId);
    const conversationDoc = await getDoc(conversationRef);
    
    if (!conversationDoc.exists()) {
      return null;
    }
    
    return {
      id: conversationDoc.id,
      ...conversationDoc.data()
    };
  } catch (error) {
    console.error("Error fetching conversation:", error);
    throw error;
  }
};

// Delete a conversation (admin only)
export const deleteConversation = async (conversationId) => {
  try {
    if (!conversationId) throw new Error("Conversation ID is required");
    
    // First delete all messages in the conversation
    const messagesRef = collection(db, "Conversations", conversationId, "Messages");
    const messagesSnapshot = await getDocs(messagesRef);
    
    const deletePromises = messagesSnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    await Promise.all(deletePromises);
    
    // Then delete the conversation
    const conversationRef = doc(db, "Conversations", conversationId);
    await deleteDoc(conversationRef);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting conversation:", error);
    throw error;
  }
};

// Typing indicator functions
export const setTyping = async (conversationId, userId, isTyping) => {
  try {
    if (!conversationId || !userId) return;
    
    const typingRef = doc(db, "Conversations", conversationId, "Typing", userId);
    
    if (isTyping) {
      await updateDoc(typingRef, {
        isTyping: true,
        timestamp: serverTimestamp(),
        userId
      }).catch(() => {
        // If document doesn't exist, create it
        return addDoc(collection(db, "Conversations", conversationId, "Typing"), {
          isTyping: true,
          timestamp: serverTimestamp(),
          userId
        });
      });
    } else {
      await deleteDoc(typingRef).catch(() => {
        // Document might not exist, ignore error
      });
    }
  } catch (error) {
    console.error("Error setting typing status:", error);
  }
};

// Subscribe to typing indicators for a conversation
export const subscribeToTyping = (conversationId, currentUserId, callback) => {
  if (!conversationId) return () => {};
  
  const typingRef = collection(db, "Conversations", conversationId, "Typing");
  
  return onSnapshot(typingRef, (snapshot) => {
    const typingUsers = [];
    const now = new Date();
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const typingTime = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
      
      // Consider typing indicator valid for 3 seconds
      if (data.isTyping && data.userId !== currentUserId && (now - typingTime) < 3000) {
        typingUsers.push(data.userId);
      }
    });
    
    callback(typingUsers);
  });
};

// Message reactions functions
export const addReaction = async (conversationId, messageId, userId, emoji) => {
  try {
    if (!conversationId || !messageId || !userId || !emoji) return;
    
    const reactionDoc = doc(db, "Conversations", conversationId, "Messages", messageId, "Reactions", `${userId}_${emoji}`);
    
    await setDoc(reactionDoc, {
      userId,
      emoji,
      timestamp: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error adding reaction:", error);
    throw error;
  }
};

export const removeReaction = async (conversationId, messageId, userId, emoji) => {
  try {
    if (!conversationId || !messageId || !userId || !emoji) return;
    
    const reactionDoc = doc(db, "Conversations", conversationId, "Messages", messageId, "Reactions", `${userId}_${emoji}`);
    await deleteDoc(reactionDoc);
    
    return { success: true };
  } catch (error) {
    console.error("Error removing reaction:", error);
    throw error;
  }
};

export const subscribeToMessageReactions = (conversationId, messageId, callback) => {
  if (!conversationId || !messageId) return () => {};
  
  const reactionsRef = collection(db, "Conversations", conversationId, "Messages", messageId, "Reactions");
  
  return onSnapshot(reactionsRef, (snapshot) => {
    const reactions = {};
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const emoji = data.emoji;
      
      if (!reactions[emoji]) {
        reactions[emoji] = [];
      }
      reactions[emoji].push({
        userId: data.userId,
        timestamp: data.timestamp
      });
    });
    
    callback(reactions);
  });
};

// Read receipts functions
export const markMessageAsRead = async (conversationId, messageId, userId) => {
  try {
    if (!conversationId || !messageId || !userId) return;
    
    const readReceiptRef = doc(db, "Conversations", conversationId, "Messages", messageId, "ReadReceipts", userId);
    
    await setDoc(readReceiptRef, {
      userId,
      readAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error marking message as read:", error);
    throw error;
  }
};

export const markConversationAsRead = async (conversationId, userId) => {
  try {
    if (!conversationId || !userId) return;
    
    // Get all unread messages in conversation
    const messagesRef = collection(db, "Conversations", conversationId, "Messages");
    const messagesQuery = query(messagesRef, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(messagesQuery);
    
    const batch = writeBatch(db);
    
    snapshot.forEach((messageDoc) => {
      const messageData = messageDoc.data();
      // Only mark messages from other users as read
      if (messageData.senderId !== userId) {
        const readReceiptRef = doc(db, "Conversations", conversationId, "Messages", messageDoc.id, "ReadReceipts", userId);
        batch.set(readReceiptRef, {
          userId,
          readAt: serverTimestamp()
        });
      }
    });
    
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    throw error;
  }
};

export const subscribeToReadReceipts = (conversationId, messageId, callback) => {
  if (!conversationId || !messageId) return () => {};
  
  const readReceiptsRef = collection(db, "Conversations", conversationId, "Messages", messageId, "ReadReceipts");
  
  return onSnapshot(readReceiptsRef, (snapshot) => {
    const readReceipts = [];
    
    snapshot.forEach((doc) => {
      readReceipts.push({
        userId: doc.data().userId,
        readAt: doc.data().readAt
      });
    });
    
    callback(readReceipts);
  });
};

export const getUnreadMessageCount = async (conversationId, userId) => {
  try {
    if (!conversationId || !userId) return 0;
    
    const messagesRef = collection(db, "Conversations", conversationId, "Messages");
    const messagesQuery = query(
      messagesRef, 
      where("senderId", "!=", userId),
      orderBy("senderId"),
      orderBy("timestamp", "desc")
    );
    
    const snapshot = await getDocs(messagesQuery);
    let unreadCount = 0;
    
    for (const messageDoc of snapshot.docs) {
      const readReceiptRef = doc(db, "Conversations", conversationId, "Messages", messageDoc.id, "ReadReceipts", userId);
      const readReceiptSnap = await getDoc(readReceiptRef);
      
      if (!readReceiptSnap.exists()) {
        unreadCount++;
      }
    }
    
    return unreadCount;
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
};

// Search in conversation function
export const searchInConversation = async (conversationId, searchText) => {
  try {
    if (!conversationId || !searchText.trim()) return [];
    
    const messagesRef = collection(db, "Conversations", conversationId, "Messages");
    const messagesQuery = query(messagesRef, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(messagesQuery);
    
    const searchResults = [];
    const searchLower = searchText.toLowerCase();
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.text && data.text.toLowerCase().includes(searchLower)) {
        searchResults.push({
          id: doc.id,
          ...data,
          highlightedText: highlightSearchText(data.text, searchText)
        });
      }
    });
    
    return searchResults;
  } catch (error) {
    console.error("Error searching in conversation:", error);
    return [];
  }
};

// Helper function to highlight search text
const highlightSearchText = (text, searchText) => {
  if (!searchText.trim()) return text;
  
  const regex = new RegExp(`(${searchText})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

// Image upload and sharing functions
export const uploadMessageImage = async (file, conversationId) => {
  try {
    if (!file || !conversationId) throw new Error("File and conversation ID required");
    
    // Create unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `message_${timestamp}.${fileExt}`;
    const filePath = `conversations/${conversationId}/images/${fileName}`;
    
    // Upload to Firebase Storage
    const storage = getStorage();
    const storageRef = ref(storage, filePath);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      url: downloadURL,
      fileName: file.name,
      fileSize: file.size,
      filePath: filePath
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export const sendImageMessage = async ({ conversationId, senderId, imageData, caption = "" }) => {
  try {
    if (!conversationId || !senderId || !imageData) {
      throw new Error("Missing required fields");
    }

    const messagesRef = collection(db, "Conversations", conversationId, "Messages");
    
    const messageDoc = await addDoc(messagesRef, {
      senderId,
      type: "image",
      imageUrl: imageData.url,
      imageName: imageData.fileName,
      imageSize: imageData.fileSize,
      caption: caption.trim(),
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp()
    });

    // Update conversation's last message
    const conversationRef = doc(db, "Conversations", conversationId);
    await updateDoc(conversationRef, {
      lastMessage: caption ? `📷 ${caption}` : "📷 Photo",
      lastMessageTime: serverTimestamp(),
      lastMessageType: "image"
    });

    return { success: true, messageId: messageDoc.id };
  } catch (error) {
    console.error("Error sending image message:", error);
    throw error;
  }
};

// Edit and Delete message functions
export const editMessage = async (conversationId, messageId, newText) => {
  try {
    if (!conversationId || !messageId || !newText.trim()) {
      throw new Error("Conversation ID, message ID, and new text are required");
    }

    const messageRef = doc(db, "Conversations", conversationId, "Messages", messageId);
    
    await updateDoc(messageRef, {
      text: newText.trim(),
      edited: true,
      editedAt: serverTimestamp(),
      lastEditAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error("Error editing message:", error);
    throw error;
  }
};

export const deleteMessage = async (conversationId, messageId, deleteFor = "me") => {
  try {
    if (!conversationId || !messageId) {
      throw new Error("Conversation ID and message ID are required");
    }

    const messageRef = doc(db, "Conversations", conversationId, "Messages", messageId);
    
    if (deleteFor === "everyone") {
      // Delete for everyone - mark as deleted but keep metadata
      await updateDoc(messageRef, {
        deleted: true,
        deletedAt: serverTimestamp(),
        text: "This message was deleted",
        type: "deleted"
      });
    } else {
      // Delete for me only - add to user's deleted messages list
      await updateDoc(messageRef, {
        [`deletedFor.${deleteFor}`]: true,
        [`deletedAt.${deleteFor}`]: serverTimestamp()
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};

export const getMessageHistory = async (conversationId, messageId) => {
  try {
    if (!conversationId || !messageId) return null;
    
    const messageRef = doc(db, "Conversations", conversationId, "Messages", messageId);
    const messageDoc = await getDoc(messageRef);
    
    if (messageDoc.exists()) {
      return {
        id: messageDoc.id,
        ...messageDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error getting message history:", error);
    return null;
  }
};

// Online status functions
export const setUserOnlineStatus = async (userId, isOnline = true) => {
  try {
    if (!userId) return;
    
    const userRef = doc(db, "Users", userId);
    
    await updateDoc(userRef, {
      isOnline: isOnline,
      lastSeen: serverTimestamp(),
      lastActivity: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error setting online status:", error);
    throw error;
  }
};

export const subscribeToUserOnlineStatus = (userId, callback) => {
  if (!userId) return () => {};
  
  const userRef = doc(db, "Users", userId);
  
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      const userData = doc.data();
      callback({
        isOnline: userData.isOnline || false,
        lastSeen: userData.lastSeen,
        lastActivity: userData.lastActivity
      });
    }
  });
};

export const updateUserActivity = async (userId) => {
  try {
    if (!userId) return;
    
    const userRef = doc(db, "Users", userId);
    
    await updateDoc(userRef, {
      lastActivity: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating user activity:", error);
    // Don't throw error for activity updates to avoid disrupting UX
  }
};

// Helper to get time since last seen
export const getTimeSinceLastSeen = (lastSeen) => {
  if (!lastSeen) return "Never";
  
  const lastSeenTime = lastSeen?.toDate ? lastSeen.toDate() : new Date(lastSeen);
  const now = new Date();
  const diffInMinutes = Math.floor((now - lastSeenTime) / (1000 * 60));
  
  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}; 