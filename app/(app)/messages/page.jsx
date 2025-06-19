"use client";
import React, { useState, useEffect } from "react";
import css from "@/styles/Messages.module.css";
import { Typography, Alert, Spin } from "antd";
import ConversationsList from "@/components/Messages/ConversationsList";
import ChatArea from "@/components/Messages/ChatArea";
import { subscribeToUserConversations, markMessagesAsRead } from "@/actions/chat";
import { useUser } from "@/hooks/useFirebaseAuth";
import { useSearchParams, useRouter } from "next/navigation";

const MessagesPage = () => {
  const { user: currentUser, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("MessagesPage render - currentUser:", currentUser, "loading:", loading);

  // Check if we should show mobile layout
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Subscribe to user's conversations in real-time
  useEffect(() => {
    console.log("Messages useEffect triggered, currentUser:", currentUser);
    
    if (!currentUser?.id) {
      console.log("No current user, setting loading to false");
      setLoading(false);
      setConversations([]);
      return;
    }

    console.log("Starting to load conversations for user:", currentUser.id);
    setLoading(true);
    setError(null);

    try {
      const unsubscribe = subscribeToUserConversations(
        currentUser.id,
        (updatedConversations) => {
          console.log("Received conversations update:", updatedConversations);
          setConversations(updatedConversations);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("Error subscribing to conversations:", error);
      setError("Failed to load conversations. Please try refreshing the page.");
      setLoading(false);
    }
  }, [currentUser?.id]);

  // Handle conversation selection from URL params
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(conv => conv.id === conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
      }
    }
  }, [searchParams, conversations]);

  const handleConversationSelect = async (conversation) => {
    console.log("Selecting conversation:", conversation);
    setSelectedConversation(conversation);
    
    // If this is a new conversation (just created), add it to the conversations list temporarily
    if (conversation.isNew && !conversations.find(conv => conv.id === conversation.id)) {
      setConversations(prev => [conversation, ...prev]);
    }
    
    // Update URL query to reflect selected conversation
    if (conversation?.id) {
      router.replace(`/messages?conversation=${conversation.id}`, { scroll: false });
    }
    
    // Mark messages as read when conversation is selected
    if (conversation.unreadCount > 0) {
      try {
        await markMessagesAsRead(conversation.id, currentUser.id);
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    }
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className={css.wrapper}>
        <div className={css.container}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <Spin size="large" />
            <Typography.Text type="secondary">Loading conversations...</Typography.Text>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={css.wrapper}>
        <div className={css.container}>
          <div style={{ padding: '20px' }}>
            <Alert
              message="Error Loading Messages"
              description={error}
              type="error"
              showIcon
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={css.wrapper}>
      <div className={css.container}>
        {/* Mobile: Show either list or chat */}
        {isMobile ? (
          <>
            {!selectedConversation ? (
              <div className={css.mobileListView}>
                <div className={css.header}>
                  <Typography.Title level={3} className={css.title}>
                    Messages
                  </Typography.Title>
                </div>
                <ConversationsList 
                  conversations={conversations}
                  onSelectConversation={handleConversationSelect}
                  selectedId={selectedConversation?.id}
                  currentUser={currentUser}
                />
              </div>
            ) : (
              <div className={css.mobileChatView}>
                <ChatArea 
                  conversation={selectedConversation}
                  onBack={handleBackToList}
                  isMobile={true}
                  currentUser={currentUser}
                />
              </div>
            )}
          </>
        ) : (
          /* Desktop: Show both side by side */
          <>
            <div className={css.leftPanel}>
              <div className={css.header}>
                <Typography.Title level={3} className={css.title}>
                  Messages
                </Typography.Title>
              </div>
              <ConversationsList 
                conversations={conversations}
                onSelectConversation={handleConversationSelect}
                selectedId={selectedConversation?.id}
                currentUser={currentUser}
              />
            </div>
            
            <div className={css.rightPanel}>
              {selectedConversation ? (
                <ChatArea 
                  conversation={selectedConversation}
                  isMobile={false}
                  currentUser={currentUser}
                />
              ) : (
                <div className={css.emptyState}>
                  <Typography.Title level={4} type="secondary">
                    Select a conversation to start messaging
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    Choose from your existing conversations or start a new one from your matches
                  </Typography.Text>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessagesPage; 