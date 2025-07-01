"use server";

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { currentUser } from '@/lib/firebaseAuth';

// Create new admin chat support ticket
export const createAdminChat = async (chatData) => {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error('User must be authenticated');
    }

    const chatDoc = {
      userId: user.id,
      userEmail: chatData.email,
      userName: chatData.name || `${user.firstName} ${user.lastName}` || user.email,
      userImage: user.images?.[0]?.fileUri || null,
      subject: chatData.subject,
      initialMessage: chatData.message,
      language: chatData.language || 'ro',
      status: 'pending', // pending, active, closed
      priority: 'medium', // low, medium, high
      isAdminOnline: false,
      adminId: null,
      adminName: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: {
        text: chatData.message,
        timestamp: serverTimestamp(),
        from: 'user',
        read: false
      },
      unreadCount: 1,
      messages: [
        {
          id: `msg_${Date.now()}`,
          text: chatData.message,
          timestamp: serverTimestamp(),
          from: 'user',
          read: false
        }
      ]
    };

    const docRef = await addDoc(collection(db, 'adminChats'), chatDoc);
    
    return { 
      success: true, 
      chatId: docRef.id,
      message: 'Chat support created successfully'
    };
  } catch (error) {
    console.error('Error creating admin chat:', error);
    throw error;
  }
};

// Send message in admin chat
export const sendAdminChatMessage = async (chatId, messageText, isAdmin = false, adminName = null) => {
  try {
    const user = await currentUser();
    if (!user && !isAdmin) {
      throw new Error('User must be authenticated');
    }

    const chatRef = doc(db, 'adminChats', chatId);
    const chatDoc = await getDoc(chatRef);
    
    if (!chatDoc.exists()) {
      throw new Error('Chat not found');
    }

    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: messageText,
      timestamp: serverTimestamp(),
      from: isAdmin ? 'admin' : 'user',
      adminName: isAdmin ? adminName : null,
      read: false
    };

    const updateData = {
      updatedAt: serverTimestamp(),
      lastMessage: {
        text: messageText,
        timestamp: serverTimestamp(),
        from: isAdmin ? 'admin' : 'user'
      },
      messages: arrayUnion(newMessage)
    };

    // Update status to active if it's pending
    if (chatDoc.data().status === 'pending') {
      updateData.status = 'active';
    }

    // Update unread count
    if (isAdmin) {
      updateData.unreadCount = 0; // Admin read all messages
    } else {
      updateData.unreadCount = (chatDoc.data().unreadCount || 0) + 1;
    }

    await updateDoc(chatRef, updateData);

    return { success: true, message: 'Message sent successfully' };
  } catch (error) {
    console.error('Error sending admin chat message:', error);
    throw error;
  }
};

// Get user's admin chats
export const getUserAdminChats = async (userId = null) => {
  try {
    console.log('🔍 [getUserAdminChats] Starting with userId:', userId);
    
    // If userId is provided, use it; otherwise try currentUser
    let userIdToUse = userId;
    
    if (!userIdToUse) {
      console.log('⚡ [getUserAdminChats] No userId provided, trying currentUser()');
      const user = await currentUser();
      console.log('👤 [getUserAdminChats] currentUser() result:', user ? 'Found user' : 'No user');
      
      if (!user) {
        console.error('❌ [getUserAdminChats] User authentication failed');
        throw new Error('User must be authenticated');
      }
      userIdToUse = user.id;
      console.log('✅ [getUserAdminChats] Using currentUser ID:', userIdToUse);
    } else {
      console.log('✅ [getUserAdminChats] Using provided userId:', userIdToUse);
    }

    console.log('📊 [getUserAdminChats] Querying chats for userId:', userIdToUse);
    const q = query(
      collection(db, 'adminChats'),
      where('userId', '==', userIdToUse),
      orderBy('updatedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    console.log('📋 [getUserAdminChats] Query completed, found docs:', snapshot.docs.length);
    
    const chats = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      lastMessage: {
        ...doc.data().lastMessage,
        timestamp: doc.data().lastMessage?.timestamp?.toDate()
      }
    }));

    console.log('✅ [getUserAdminChats] Returning chats:', chats.length);
    return chats;
  } catch (error) {
    console.error('Error getting user admin chats:', error);
    throw error;
  }
};

// Get all admin chats (for admin dashboard)
export const getAllAdminChats = async (status = null) => {
  try {
    let q = query(
      collection(db, 'adminChats'),
      orderBy('updatedAt', 'desc')
    );

    if (status) {
      q = query(
        collection(db, 'adminChats'),
        where('status', '==', status),
        orderBy('updatedAt', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    const chats = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      lastMessage: {
        ...doc.data().lastMessage,
        timestamp: doc.data().lastMessage?.timestamp?.toDate()
      }
    }));

    return chats;
  } catch (error) {
    console.error('Error getting all admin chats:', error);
    throw error;
  }
};

// Get single admin chat
export const getAdminChat = async (chatId) => {
  try {
    const chatDoc = await getDoc(doc(db, 'adminChats', chatId));
    
    if (!chatDoc.exists()) {
      throw new Error('Chat not found');
    }

    const chatData = chatDoc.data();
    return {
      id: chatDoc.id,
      ...chatData,
      createdAt: chatData.createdAt?.toDate(),
      updatedAt: chatData.updatedAt?.toDate(),
      messages: chatData.messages?.map(msg => ({
        ...msg,
        timestamp: msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp)
      })) || []
    };
  } catch (error) {
    console.error('Error getting admin chat:', error);
    throw error;
  }
};

// Update chat status
export const updateChatStatus = async (chatId, status, adminName = null) => {
  try {
    const updateData = {
      status,
      updatedAt: serverTimestamp()
    };

    if (status === 'active' && adminName) {
      updateData.adminName = adminName;
      updateData.isAdminOnline = true;
    }

    if (status === 'closed') {
      updateData.isAdminOnline = false;
    }

    await updateDoc(doc(db, 'adminChats', chatId), updateData);
    
    return { success: true, message: `Chat status updated to ${status}` };
  } catch (error) {
    console.error('Error updating chat status:', error);
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (chatId, isAdmin = false) => {
  try {
    const chatRef = doc(db, 'adminChats', chatId);
    const chatDoc = await getDoc(chatRef);
    
    if (!chatDoc.exists()) {
      throw new Error('Chat not found');
    }

    const chatData = chatDoc.data();
    const updatedMessages = chatData.messages?.map(msg => {
      if (isAdmin && msg.from === 'user') {
        return { ...msg, read: true };
      } else if (!isAdmin && msg.from === 'admin') {
        return { ...msg, read: true };
      }
      return msg;
    }) || [];

    const updateData = {
      messages: updatedMessages,
      updatedAt: serverTimestamp()
    };

    if (isAdmin) {
      updateData.unreadCount = 0;
    }

    await updateDoc(chatRef, updateData);
    
    return { success: true };
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// Update chat priority
export const updateChatPriority = async (chatId, priority) => {
  try {
    await updateDoc(doc(db, 'adminChats', chatId), {
      priority,
      updatedAt: serverTimestamp()
    });
    
    return { success: true, message: `Chat priority updated to ${priority}` };
  } catch (error) {
    console.error('Error updating chat priority:', error);
    throw error;
  }
};

// Get chat statistics for admin dashboard
export const getChatStatistics = async () => {
  try {
    const allChatsSnapshot = await getDocs(collection(db, 'adminChats'));
    const chats = allChatsSnapshot.docs.map(doc => doc.data());
    
    const stats = {
      total: chats.length,
      pending: chats.filter(chat => chat.status === 'pending').length,
      active: chats.filter(chat => chat.status === 'active').length,
      closed: chats.filter(chat => chat.status === 'closed').length,
      highPriority: chats.filter(chat => chat.priority === 'high').length,
      unreadCount: chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0)
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting chat statistics:', error);
    throw error;
  }
}; 