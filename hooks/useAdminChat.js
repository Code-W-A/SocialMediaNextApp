"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  createAdminChat, 
  sendAdminChatMessage, 
  getUserAdminChats, 
  getAllAdminChats, 
  getAdminChat,
  updateChatStatus,
  markMessagesAsRead,
  updateChatPriority,
  getChatStatistics
} from '@/actions/adminChat';
import { useUser } from '@/hooks/useFirebaseAuth';
import { message } from 'antd';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const useAdminChat = (chatId = null, enableUserChats = false) => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [isTyping, setIsTyping] = useState(false);
  const [realTimeMessages, setRealTimeMessages] = useState([]);

  // Debug logging
  console.log('🔧 [useAdminChat] Hook called with:', {
    chatId,
    enableUserChats,
    userId: user?.id,
    userExists: !!user
  });

  // Get user's admin chats - only enabled when explicitly requested
  const {
    data: userChats,
    isLoading: isLoadingUserChats,
    error: userChatsError,
  } = useQuery({
    queryKey: ['adminChats', 'user', user?.id],
    queryFn: () => {
      console.log('🔄 [useAdminChat] Executing getUserAdminChats with userId:', user?.id);
      return getUserAdminChats(user?.id);
    },
    enabled: !!user?.id && enableUserChats,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: enableUserChats ? 60 * 1000 : false, // Only refetch if enabled
    onError: (error) => {
      console.error('🚨 [useAdminChat] getUserAdminChats error:', error);
      console.error('📊 [useAdminChat] Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
    }
  });

  // Get all admin chats (for admin dashboard)
  const {
    data: allChats,
    isLoading: isLoadingAllChats,
    error: allChatsError,
  } = useQuery({
    queryKey: ['adminChats', 'all'],
    queryFn: () => getAllAdminChats(),
    enabled: false, // Only enable when admin needs it
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000, // More frequent for admin
  });

  // Get single chat details
  const {
    data: chatDetails,
    isLoading: isLoadingChat,
    error: chatError,
  } = useQuery({
    queryKey: ['adminChat', chatId],
    queryFn: () => getAdminChat(chatId),
    enabled: !!chatId,
    staleTime: 10 * 1000, // 10 seconds for active chats
  });

  // Get chat statistics
  const {
    data: chatStats,
    isLoading: isLoadingStats,
  } = useQuery({
    queryKey: ['adminChats', 'stats'],
    queryFn: getChatStatistics,
    enabled: false, // Only enable when admin needs it
    staleTime: 60 * 1000,
    refetchInterval: 2 * 60 * 1000, // Every 2 minutes
  });

  // Real-time listener for specific chat
  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = onSnapshot(
      doc(db, 'adminChats', chatId),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const messages = data.messages?.map(msg => ({
            ...msg,
            timestamp: msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp)
          })) || [];
          
          setRealTimeMessages(messages);
          
          // Update cache
          queryClient.setQueryData(['adminChat', chatId], {
            id: doc.id,
            ...data,
            messages
          });
        }
      },
      (error) => {
        console.error('Error listening to chat:', error);
      }
    );

    return () => unsubscribe();
  }, [chatId, queryClient]);

  // Create admin chat mutation
  const createChatMutation = useMutation({
    mutationFn: createAdminChat,
    onSuccess: (data) => {
      message.success('Support chat created successfully!');
      queryClient.invalidateQueries(['adminChats']);
      return data;
    },
    onError: (error) => {
      console.error('Error creating admin chat:', error);
      message.error('Failed to create support chat. Please try again.');
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ chatId, messageText, isAdmin, adminName }) => 
      sendAdminChatMessage(chatId, messageText, isAdmin, adminName),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminChat', chatId]);
      queryClient.invalidateQueries(['adminChats']);
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      message.error('Failed to send message. Please try again.');
    },
  });

  // Update chat status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ chatId, status, adminName }) => 
      updateChatStatus(chatId, status, adminName),
    onSuccess: (data) => {
      message.success(data.message);
      queryClient.invalidateQueries(['adminChat', chatId]);
      queryClient.invalidateQueries(['adminChats']);
    },
    onError: (error) => {
      console.error('Error updating chat status:', error);
      message.error('Failed to update chat status.');
    },
  });

  // Mark messages as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: ({ chatId, isAdmin }) => markMessagesAsRead(chatId, isAdmin),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminChat', chatId]);
      queryClient.invalidateQueries(['adminChats']);
    },
    onError: (error) => {
      console.error('Error marking messages as read:', error);
    },
  });

  // Update priority mutation
  const updatePriorityMutation = useMutation({
    mutationFn: ({ chatId, priority }) => updateChatPriority(chatId, priority),
    onSuccess: (data) => {
      message.success(data.message);
      queryClient.invalidateQueries(['adminChat', chatId]);
      queryClient.invalidateQueries(['adminChats']);
    },
    onError: (error) => {
      console.error('Error updating priority:', error);
      message.error('Failed to update priority.');
    },
  });

  // Helper functions
  const createChat = (chatData) => {
    return createChatMutation.mutateAsync(chatData);
  };

  const sendMessage = (messageText, isAdmin = false, adminName = null) => {
    if (!chatId) {
      message.error('No active chat');
      return;
    }
    return sendMessageMutation.mutate({ 
      chatId, 
      messageText, 
      isAdmin, 
      adminName 
    });
  };

  const updateStatus = (status, adminName = null) => {
    if (!chatId) {
      message.error('No active chat');
      return;
    }
    return updateStatusMutation.mutate({ chatId, status, adminName });
  };

  const markAsRead = (isAdmin = false) => {
    if (!chatId) return;
    return markAsReadMutation.mutate({ chatId, isAdmin });
  };

  const updatePriority = (priority) => {
    if (!chatId) {
      message.error('No active chat');
      return;
    }
    return updatePriorityMutation.mutate({ chatId, priority });
  };

  const enableAdminQueries = () => {
    queryClient.refetchQueries(['adminChats', 'all']);
    queryClient.refetchQueries(['adminChats', 'stats']);
  };

  // Get unread count for user
  const getUnreadCount = () => {
    if (!userChats) return 0;
    return userChats.reduce((total, chat) => {
      const unreadMessages = chat.messages?.filter(
        msg => msg.from === 'admin' && !msg.read
      ).length || 0;
      return total + unreadMessages;
    }, 0);
  };

  // Get admin unread count
  const getAdminUnreadCount = () => {
    if (!allChats) return 0;
    return allChats.reduce((total, chat) => total + (chat.unreadCount || 0), 0);
  };

  return {
    // Data
    userChats,
    allChats,
    chatDetails,
    chatStats,
    realTimeMessages: chatId ? realTimeMessages : [],
    
    // Loading states
    isLoadingUserChats,
    isLoadingAllChats,
    isLoadingChat,
    isLoadingStats,
    isCreatingChat: createChatMutation.isLoading,
    isSendingMessage: sendMessageMutation.isLoading,
    isUpdatingStatus: updateStatusMutation.isLoading,
    isMarkingAsRead: markAsReadMutation.isLoading,
    isUpdatingPriority: updatePriorityMutation.isLoading,
    
    // Error states
    userChatsError,
    allChatsError,
    chatError,
    
    // Actions
    createChat,
    sendMessage,
    updateStatus,
    markAsRead,
    updatePriority,
    enableAdminQueries,
    
    // Utilities
    getUnreadCount,
    getAdminUnreadCount,
    isTyping,
    setIsTyping,
    
    // Refresh functions
    refreshUserChats: () => queryClient.invalidateQueries(['adminChats', 'user']),
    refreshAllChats: () => queryClient.invalidateQueries(['adminChats', 'all']),
    refreshChat: () => queryClient.invalidateQueries(['adminChat', chatId]),
    refreshStats: () => queryClient.invalidateQueries(['adminChats', 'stats']),
  };
}; 