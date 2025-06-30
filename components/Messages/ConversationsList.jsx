"use client";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import css from "@/styles/ConversationsList.module.css";
import { Avatar, Badge, Typography, Input, Empty, Tabs, Button } from "antd";
import Iconify from "../Iconify";
import { getMainProfileImage } from "@/utils/imageHelpers";
import { getDisplayName } from "@/utils/profileHelpers";
import { useSettingsContext } from "@/context/settings/settings-context";
import { getMyCompatibleUsers } from "@/actions/admin";
import { createConversation } from "@/actions/chat";
import { OnlineStatusAvatar } from "../OnlineStatusIndicator";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import PremiumBadge from "@/components/PremiumBadge";
import { now } from "@/utils/dateHelpers";

dayjs.extend(relativeTime);

const ConversationsList = ({ conversations, onSelectConversation, selectedId, currentUser }) => {
  const { settings: { theme: currentTheme } } = useSettingsContext();
  const [activeTab, setActiveTab] = useState("conversations");
  const [compatibleUsers, setCompatibleUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  
  // Memoized cache references
  const compatibleUsersCache = useRef(null);
  const lastCompatibleUsersFetch = useRef(0);
  const searchTimeoutRef = useRef(null);
  const debouncedSearchText = useRef("");

  // Debounced search implementation
  const debouncedSetSearchText = useCallback((text) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      debouncedSearchText.current = text;
      // Force re-render by updating state
      setSearchText(text);
    }, 300); // 300ms debounce
  }, []);

  // Optimized compatible users loading with caching
  const loadCompatibleUsers = useCallback(async (forceRefresh = false) => {
    if (!currentUser?.id) return;
    
    const now = Date.now();
    const cacheAge = now - lastCompatibleUsersFetch.current;
    
    // Use cached data if less than 10 minutes old and not forcing refresh
    if (!forceRefresh && compatibleUsersCache.current && cacheAge < 600000) { // 10 minutes cache
      console.log('Using cached compatible users');
      setCompatibleUsers(compatibleUsersCache.current);
      return;
    }
    
    try {
      setLoading(true);
      const users = await getMyCompatibleUsers(currentUser.id);
      
      // We'll filter the users when displaying them, not here
      // This prevents dependency on conversations array
      
      // Cache all compatible users
      compatibleUsersCache.current = users;
      lastCompatibleUsersFetch.current = now;
      
      setCompatibleUsers(users);
    } catch (error) {
      console.error("Error loading compatible users:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  // Load compatible users with dependency optimization
  useEffect(() => {
    // Only load if we have current user
    if (currentUser?.id) {
      loadCompatibleUsers();
    }
  }, [loadCompatibleUsers, currentUser?.id]); // Fixed: Remove conversations dependency completely

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Memoized time formatting function
  const formatTime = useCallback((timestamp) => {
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
  }, []);

  // Memoized message truncation
  const truncateMessage = useCallback((text, maxLength = 40) => {
    if (!text || text.length <= maxLength) return text || '';
    return text.substring(0, maxLength) + '...';
  }, []);

  // Optimized conversation creation with local state update
  const handleStartConversation = useCallback(async (user) => {
    try {
      console.log("Starting conversation with user:", user);
      const result = await createConversation({
        user1Id: currentUser.id,
        user2Id: user.id
      });

      console.log("Create conversation result:", result);

      if (result.success) {
        // Create a conversation object to pass to the parent
        const newConversation = {
          id: result.conversationId,
          participants: [currentUser.id, user.id],
          otherUser: user,
          lastMessage: null,
          unreadCount: 0,
          isNew: result.isNew,
          createdAt: now(),
          updatedAt: now()
        };
        
        console.log("Selecting new conversation:", newConversation);
        onSelectConversation(newConversation);
        
        // Switch to conversations tab to show the new conversation
        setActiveTab("conversations");
        
        // Remove user from compatible users list since they now have a conversation
        setCompatibleUsers(prev => prev.filter(u => u.id !== user.id));
        
        // Update cache to reflect the change
        if (compatibleUsersCache.current) {
          compatibleUsersCache.current = compatibleUsersCache.current.filter(u => u.id !== user.id);
        }
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      // You could add a toast notification here to inform the user
    }
  }, [currentUser.id, onSelectConversation]);

  // Memoized theme-aware styles
  const searchInputStyle = useMemo(() => ({
    background: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f8f9fa',
    color: '#000000' // Always black text
  }), [currentTheme]);

  // Memoized filtered conversations
  const filteredConversations = useMemo(() => {
    if (!searchText.trim()) return conversations;
    
    const searchLower = searchText.toLowerCase();
    
    return conversations.filter(conversation => {
      const otherUser = conversation.otherUser;
      
      // Search in user name, username, and last message
      const searchableText = [
        otherUser?.firstName,
        otherUser?.lastName, 
        otherUser?.username,
        conversation.lastMessage?.text
      ].filter(Boolean).join(' ').toLowerCase();
      
      return searchableText.includes(searchLower);
    });
  }, [conversations, searchText]);

  // Memoized filtered compatible users
  const filteredCompatibleUsers = useMemo(() => {
    // First filter out users who already have conversations
    const existingConversationUserIds = conversations.map(conv => conv.otherUser?.id);
    const availableUsers = compatibleUsers.filter(user => !existingConversationUserIds.includes(user.id));
    
    // Then apply search filter if needed
    if (!searchText.trim()) return availableUsers;
    
    const searchLower = searchText.toLowerCase();
    
    return availableUsers.filter(user => {
      // Search in user name and username
      const searchableText = [
        user?.firstName,
        user?.lastName,
        user?.username
      ].filter(Boolean).join(' ').toLowerCase();
      
      return searchableText.includes(searchLower);
    });
  }, [compatibleUsers, searchText, conversations]);

  // Memoized conversation item renderer
  const renderConversationItem = useCallback((conversation) => {
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
            <OnlineStatusAvatar userId={otherUser?.id} size="medium">
            <Avatar 
              src={mainImage} 
              size={48}
            >
              {otherUser?.firstName?.[0] || otherUser?.username?.[0] || otherUser?.email?.[0]}
              {otherUser?.lastName?.[0]}
            </Avatar>
            </OnlineStatusAvatar>
          </Badge>
        </div>

        <div className={css.conversationContent}>
          <div className={css.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Typography.Text 
                className={css.participantName}
                strong={conversation.unreadCount > 0}
              >
                {displayName}
              </Typography.Text>
              <PremiumBadge 
                user={otherUser} 
                size="small" 
                showText={false}
                showTooltip={false}
              />
            </div>
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
  }, [selectedId, currentUser?.id, onSelectConversation, formatTime, truncateMessage]);

  // Memoized compatible user item renderer
  const renderCompatibleUserItem = useCallback((user) => {
    const mainImage = getMainProfileImage(user?.images);
    const displayName = getDisplayName(user);

    return (
      <div
        key={user.id}
        className={css.conversationItem}
        style={{ cursor: 'pointer' }}
        onClick={() => handleStartConversation(user)}
      >
        <div className={css.avatarContainer}>
          <OnlineStatusAvatar userId={user?.id} size="medium">
          <Avatar 
            src={mainImage} 
            size={48}
          >
            {user?.firstName?.[0] || user?.username?.[0] || user?.email?.[0]}
            {user?.lastName?.[0]}
          </Avatar>
          </OnlineStatusAvatar>
        </div>

        <div className={css.conversationContent}>
          <div className={css.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Typography.Text className={css.participantName}>
                {displayName}
              </Typography.Text>
              <PremiumBadge 
                user={user} 
                size="small" 
                showText={false}
                showTooltip={false}
              />
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <Button 
                size="small"
                icon={<Iconify icon="eva:person-fill" width="12px" />}
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`/user/${user.id}`, '_blank');
                }}
                style={{ 
                  border: '1px solid #d9d9d9',
                  borderRadius: '8px',
                  fontSize: '10px',
                  padding: '0 8px'
                }}
                title="View Profile"
              />
              
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
                  borderRadius: '8px',
                  fontSize: '10px',
                  padding: '0 12px'
              }}
            >
              Message
            </Button>
            </div>
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
  }, [handleStartConversation]);

  // Memoized tab items
  const tabItems = useMemo(() => [
    {
      key: 'conversations',
      label: searchText.trim() ? 
        `Messages (${filteredConversations.length}/${conversations.length})` : 
        `Messages (${conversations.length})`,
      children: (
        <div className={css.conversationsContainer}>
          {filteredConversations.length === 0 ? (
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
                    {searchText.trim() ? 
                      `No conversations found for "${searchText}"` : 
                      "No conversations yet"
                    }
                  </Typography.Text>
                }
              />
            </div>
          ) : (
            filteredConversations.map(renderConversationItem)
          )}
        </div>
      )
    },
    {
      key: 'compatible',
      label: searchText.trim() ? 
        `Compatible (${filteredCompatibleUsers.length}/${compatibleUsers.length})` : 
        `Compatible (${compatibleUsers.length})`,
      children: (
        <div className={css.conversationsContainer}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <Typography.Text type="secondary">Loading compatible users...</Typography.Text>
            </div>
          ) : filteredCompatibleUsers.length === 0 ? (
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
                    {searchText.trim() ? 
                      `No compatible users found for "${searchText}"` : 
                      "No new compatible users.\nCheck your matches page!"
                    }
                  </Typography.Text>
                }
              />
            </div>
          ) : (
            filteredCompatibleUsers.map(renderCompatibleUserItem)
          )}
        </div>
      )
    }
  ], [searchText, filteredConversations, conversations.length, loading, filteredCompatibleUsers, compatibleUsers.length, renderConversationItem, renderCompatibleUserItem]);

  return (
    <div className={css.wrapper}>
      {/* Search Bar */}
      <div className={css.searchContainer}>
        <Input
          placeholder="Search conversations and compatible users..."
          prefix={<Iconify icon="eva:search-fill" width="18px" style={{ color: '#000000' }} />}
          className={css.searchInput}
          style={searchInputStyle}
          onChange={(e) => debouncedSetSearchText(e.target.value)}
          allowClear
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

export default React.memo(ConversationsList);
