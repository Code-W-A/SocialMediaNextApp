"use client";
import React, { useState, useEffect } from "react";
import css from "@/styles/ConversationsList.module.css";
import { Avatar, Badge, Typography, Input, Empty, Tabs, Button } from "antd";
import Iconify from "../Iconify";
import { getMainProfileImage } from "@/utils/imageHelpers";
import { getDisplayName } from "@/utils/profileHelpers";
import { useSettingsContext } from "@/context/settings/settings-context";
import { getMyCompatibleUsers } from "@/actions/admin";
import { createConversation } from "@/actions/chat";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const ConversationsList = ({ conversations, onSelectConversation, selectedId, currentUser }) => {
  const { settings: { theme: currentTheme } } = useSettingsContext();
  const [compatibleUsers, setCompatibleUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("conversations");
  const [loading, setLoading] = useState(false);

  // Load compatible users
  useEffect(() => {
    const loadCompatibleUsers = async () => {
      if (!currentUser?.id) return;
      
      try {
        setLoading(true);
        const users = await getMyCompatibleUsers(currentUser.id);
        
        // Filter out users who already have conversations
        const existingConversationUserIds = conversations.map(conv => conv.otherUser?.id);
        const newCompatibleUsers = users.filter(user => !existingConversationUserIds.includes(user.id));
        
        setCompatibleUsers(newCompatibleUsers);
      } catch (error) {
        console.error("Error loading compatible users:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCompatibleUsers();
  }, [currentUser?.id, conversations]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    // Handle Firebase Timestamp
    const time = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = dayjs();
    const messageTime = dayjs(time);
    
    if (now.diff(messageTime, 'day') < 1) {
      return messageTime.format('HH:mm');
    } else if (now.diff(messageTime, 'day') < 7) {
      return messageTime.format('ddd');
    } else {
      return messageTime.format('DD/MM');
    }
  };

  const truncateMessage = (text, maxLength = 40) => {
    if (!text || text.length <= maxLength) return text || '';
    return text.substring(0, maxLength) + '...';
  };

  const handleStartConversation = async (user) => {
    try {
      const result = await createConversation({
        user1Id: currentUser.id,
        user2Id: user.id
      });

      if (result.success) {
        // Create a conversation object to pass to the parent
        const newConversation = {
          id: result.conversationId,
          participants: [currentUser.id, user.id],
          otherUser: user,
          lastMessage: null,
          unreadCount: 0,
          isNew: result.isNew
        };
        
        onSelectConversation(newConversation);
        setActiveTab("conversations");
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  // Theme-aware styles
  const searchInputStyle = {
    background: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f8f9fa',
    color: currentTheme === 'dark' ? '#fff' : 'inherit'
  };

  const renderConversationItem = (conversation) => {
    const otherUser = conversation.otherUser;
    const isSelected = selectedId === conversation.id;
    const isFromCurrentUser = conversation.lastMessage?.senderId === currentUser?.id;
    const mainImage = getMainProfileImage(otherUser?.images);
    const displayName = getDisplayName(otherUser);

    return (
      <div
        key={conversation.id}
        className={`${css.conversationItem} ${isSelected ? css.selected : ''}`}
        onClick={() => onSelectConversation(conversation)}
      >
        <div className={css.avatarContainer}>
          <Badge 
            count={conversation.unreadCount} 
            size="small"
            offset={[-5, 5]}
          >
            <Avatar 
              src={mainImage} 
              size={48}
            >
              {otherUser?.firstName?.[0] || otherUser?.username?.[0] || otherUser?.email?.[0]}
              {otherUser?.lastName?.[0]}
            </Avatar>
          </Badge>
        </div>

        <div className={css.conversationContent}>
          <div className={css.header}>
            <Typography.Text 
              className={css.participantName}
              strong={conversation.unreadCount > 0}
            >
              {displayName}
            </Typography.Text>
            <Typography.Text 
              className={css.timestamp}
              type="secondary"
            >
              {formatTime(conversation.lastMessage?.timestamp || conversation.updatedAt)}
            </Typography.Text>
          </div>

          <div className={css.lastMessageContainer}>
            <Typography.Text 
              className={`${css.lastMessage} ${conversation.unreadCount > 0 ? css.unread : ''}`}
              type="secondary"
            >
              {conversation.lastMessage ? (
                <>
                  {isFromCurrentUser && (
                    <span className={css.youPrefix}>You: </span>
                  )}
                  {truncateMessage(conversation.lastMessage.text)}
                </>
              ) : (
                <span style={{ fontStyle: 'italic' }}>Start a conversation...</span>
              )}
            </Typography.Text>
            
            {conversation.unreadCount > 0 && (
              <div className={css.unreadIndicator} />
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCompatibleUserItem = (user) => {
    const mainImage = getMainProfileImage(user?.images);
    const displayName = getDisplayName(user);

    return (
      <div
        key={user.id}
        className={css.conversationItem}
        style={{ cursor: 'pointer' }}
      >
        <div className={css.avatarContainer}>
          <Avatar 
            src={mainImage} 
            size={48}
          >
            {user?.firstName?.[0] || user?.username?.[0] || user?.email?.[0]}
            {user?.lastName?.[0]}
          </Avatar>
        </div>

        <div className={css.conversationContent}>
          <div className={css.header}>
            <Typography.Text className={css.participantName}>
              {displayName}
            </Typography.Text>
            <Button 
              type="primary" 
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleStartConversation(user);
              }}
              style={{ 
                background: 'linear-gradient(135deg, var(--primary), #FFB84D)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '11px'
              }}
            >
              Message
            </Button>
          </div>

          <div className={css.lastMessageContainer}>
            <Typography.Text 
              className={css.lastMessage}
              type="secondary"
              style={{ fontStyle: 'italic' }}
            >
              Compatible • Click to start chatting
            </Typography.Text>
          </div>
        </div>
      </div>
    );
  };

  const tabItems = [
    {
      key: 'conversations',
      label: `Messages (${conversations.length})`,
      children: (
        <div className={css.conversationsContainer}>
          {conversations.length === 0 ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '200px',
              padding: '1rem'
            }}>
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Typography.Text type="secondary">
                    No conversations yet
                  </Typography.Text>
                }
              />
            </div>
          ) : (
            conversations.map(renderConversationItem)
          )}
        </div>
      )
    },
    {
      key: 'compatible',
      label: `Compatible (${compatibleUsers.length})`,
      children: (
        <div className={css.conversationsContainer}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <Typography.Text type="secondary">Loading compatible users...</Typography.Text>
            </div>
          ) : compatibleUsers.length === 0 ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '200px',
              padding: '1rem'
            }}>
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Typography.Text type="secondary">
                    No new compatible users.<br />
                    Check your matches page!
                  </Typography.Text>
                }
              />
            </div>
          ) : (
            compatibleUsers.map(renderCompatibleUserItem)
          )}
        </div>
      )
    }
  ];

  return (
    <div className={css.wrapper}>
      {/* Search Bar */}
      <div className={css.searchContainer}>
        <Input
          placeholder="Search conversations..."
          prefix={<Iconify icon="eva:search-fill" width="18px" />}
          className={css.searchInput}
          style={searchInputStyle}
        />
      </div>

      {/* Tabs for Conversations and Compatible Users */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        style={{ 
          padding: '0 16px',
          '--ant-primary-color': 'var(--primary)'
        }}
        size="small"
      />
    </div>
  );
};

export default ConversationsList;
