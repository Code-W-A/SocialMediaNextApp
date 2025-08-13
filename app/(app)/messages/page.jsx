"use client";
import React, { useState, useEffect } from "react";
import css from "@/styles/Messages.module.css";
import { Typography, Alert, Spin, Button } from "antd";
import ConversationsList from "@/components/Messages/ConversationsList";
import ChatArea from "@/components/Messages/ChatArea";
import { subscribeToUserConversations, markMessagesAsRead, getUserConversations } from "@/actions/chat";
import { setUserOnline, setUserOffline } from "@/actions/user";
import { getMyCompatibleUsers } from "@/actions/admin";
import { createConversation } from "@/actions/chat";
import { useUser } from "@/hooks/useFirebaseAuth";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

const MessagesPage = () => {
  const { user: currentUser, isLoaded } = useUser();
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
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

  // Load conversations initially and subscribe to updates
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

    // Setup real-time subscription directly
    try {
      const unsubscribe = subscribeToUserConversations(
        currentUser.id,
        (updatedConversations) => {
          console.log("Received conversations update:", updatedConversations);
          setConversations(updatedConversations);
          setLoading(false);
          setInitializing(false);
        }
      );

      // Fire an initial one-time fetch to populate UI faster while waiting for RT snapshot
      (async () => {
        try {
          const initialConversations = await getUserConversations(currentUser.id);
          setConversations(prev => (prev && prev.length > 0 ? prev : initialConversations));
          setLoading(false);
          setInitializing(false);
        } catch (initialErr) {
          console.warn('Initial conversations fetch failed:', initialErr);
        }
      })();

      return unsubscribe;
    } catch (error) {
      console.error("Error subscribing to conversations:", error);
      setError(t('messages.errorLoadingMessages'));
      setLoading(false);
      setInitializing(false);
    }
  }, [currentUser?.id, t]);

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

  // Debug functions for presence testing
  const handleSetOnline = async () => {
    try {
      console.log("🔥 Manual: Setting user online");
      await setUserOnline(currentUser?.id);
      console.log("✅ Manual: User set online");
    } catch (error) {
      console.error("❌ Manual: Error setting online:", error);
    }
  };

  const handleSetOffline = async () => {
    try {
      console.log("🔥 Manual: Setting user offline");
      await setUserOffline(currentUser?.id);
      console.log("✅ Manual: User set offline");
    } catch (error) {
      console.error("❌ Manual: Error setting offline:", error);
    }
  };

  // Loading state with skeleton layout for improved UX
  if (loading) {
    return (
      <div className={css.wrapper}>
        <div className={css.container}>
          <div className={css.leftPanel}>
            <div className={css.header}>
              <Typography.Title level={3} className={css.title}>
                {t('messages.title')}
              </Typography.Title>
            </div>
            <div style={{ padding: '0 16px' }}>
              {[...Array(8)].map((_, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 8px' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f0f0f0' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 12, background: '#f0f0f0', borderRadius: 6, marginBottom: 6 }} />
                    <div style={{ height: 12, background: '#f0f0f0', borderRadius: 6, width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={css.rightPanel}>
            <div className={css.emptyState}>
              <Typography.Title level={4} type="secondary">
                {t('messages.selectConversation')}
              </Typography.Title>
              <Typography.Text type="secondary">
                {t('messages.chooseConversation')}
              </Typography.Text>
            </div>
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
              message={t('messages.errorLoadingMessages')}
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
                    {t('messages.title')}
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
                  {t('messages.title')}
                </Typography.Title>
                {/* Debug buttons */}
      
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
                    {t('messages.selectConversation')}
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    {t('messages.chooseConversation')}
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