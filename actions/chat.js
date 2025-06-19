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
  and
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Create a new conversation between two users
export const createConversation = async ({ user1Id, user2Id }) => {
  try {
    if (!user1Id || !user2Id) {
      throw new Error("Both user IDs are required");
    }

    if (user1Id === user2Id) {
      throw new Error("Cannot create conversation with yourself");
    }

    // Check if conversation already exists
    const conversationsRef = collection(db, "Conversations");
    const existingQuery = query(
      conversationsRef,
      or(
        and(where("participants", "array-contains", user1Id), where("participants", "array-contains", user2Id)),
        and(where("participants", "array-contains", user2Id), where("participants", "array-contains", user1Id))
      )
    );
    
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      // Return existing conversation
      const existingConv = existingSnapshot.docs[0];
      return { 
        success: true, 
        conversationId: existingConv.id,
        isNew: false 
      };
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