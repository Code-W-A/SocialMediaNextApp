"use client";
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import css from "@/styles/ChatArea.module.css";
import { Avatar, Button, Input, Typography, theme, message } from "antd";
import Iconify from "../Iconify";
import { 
  subscribeToConversationMessages, 
  sendMessage as sendFirebaseMessage,
  setTyping,
  subscribeToTyping,
  markConversationAsRead,
  addReaction,
  removeReaction
} from "@/actions/chat";
import MessageReactions from "./MessageReactions";
import ReadReceiptIndicator from "./ReadReceiptIndicator";
import ChatSearch from "./ChatSearch";
import ImageUpload from "./ImageUpload";
import ImageMessage from "./ImageMessage";
import EditMessage from "./EditMessage";
import MessageHoverActions from "./MessageHoverActions";
import OnlineStatusIndicator, { OnlineStatusAvatar } from "../OnlineStatusIndicator";
import { getMainProfileImage } from "@/utils/imageHelpers";
import { useSettingsContext } from "@/context/settings/settings-context";
import dayjs from "dayjs";

const { useToken } = theme;

const ChatArea = ({ conversation, onBack, isMobile, currentUser }) => {
  const { settings: { theme: currentTheme } } = useSettingsContext();
  const { token } = useToken();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [activePopoverId, setActivePopoverId] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const markAsReadTimeoutRef = useRef(null);
  const typingThrottleRef = useRef(null);
  const lastTypingUpdateRef = useRef(0);
  const scrollTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);
  const otherUser = conversation?.otherUser;

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Subscribe to messages in real-time
  useEffect(() => {
    if (!conversation?.id) return;

    const unsubscribe = subscribeToConversationMessages(
      conversation.id,
      (updatedMessages) => {
        if (isMountedRef.current) {
          setMessages(updatedMessages);
        }
      }
    );

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [conversation?.id]);

  // Subscribe to typing indicators
  useEffect(() => {
    if (!conversation?.id || !currentUser?.id) return;

    const unsubscribe = subscribeToTyping(
      conversation.id,
      currentUser.id,
      (typingUserIds) => {
        if (isMountedRef.current) {
          setTypingUsers(typingUserIds);
        }
      }
    );

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [conversation?.id, currentUser?.id]);

  // Optimized scroll to bottom with debouncing
  const debouncedScrollToBottom = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current && messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: "smooth",
          block: "end"
        });
      }
    }, 100); // 100ms debounce
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      debouncedScrollToBottom();
    }
  }, [messages.length, debouncedScrollToBottom]);

  // Debounced mark as read to reduce Firestore writes
  const debouncedMarkAsRead = useCallback(() => {
    if (markAsReadTimeoutRef.current) {
      clearTimeout(markAsReadTimeoutRef.current);
    }

    markAsReadTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current && conversation?.id && currentUser?.id && messages.length > 0) {
        markConversationAsRead(conversation.id, currentUser.id).catch(console.error);
      }
    }, 2000); // 2 seconds debounce (increased from 1 second)
  }, [conversation?.id, currentUser?.id, messages.length]);

  // Mark messages as read when conversation is viewed
  useEffect(() => {
    if (!conversation?.id || !currentUser?.id || messages.length === 0) return;
    debouncedMarkAsRead();
    
    return () => {
      if (markAsReadTimeoutRef.current) {
        clearTimeout(markAsReadTimeoutRef.current);
      }
    };
  }, [conversation?.id, currentUser?.id, messages.length, debouncedMarkAsRead]);

  // Handle reaction toggle with optimistic updates
  const handleReactionToggle = useCallback(async (messageId, emoji, currentReactions) => {
    if (!isMountedRef.current) return;
    
    try {
      // Check if user already reacted with any emoji
      let currentUserReaction = null;
      for (const [reactionEmoji, reactionList] of Object.entries(currentReactions)) {
        if (reactionList.some(r => r.userId === currentUser?.id)) {
          currentUserReaction = reactionEmoji;
          break;
        }
      }

      if (currentUserReaction) {
        // Remove current reaction first
        await removeReaction(conversation.id, messageId, currentUser.id, currentUserReaction);
      }
      
      // If clicking different emoji, add new reaction
      if (currentUserReaction !== emoji) {
        await addReaction(conversation.id, messageId, currentUser.id, emoji);
      }
    } catch (error) {
      console.error("Error toggling reaction:", error);
      throw error;
    }
  }, [conversation?.id, currentUser?.id]);

  // Define handleStopTyping first (before it's used in other functions)
  const handleStopTyping = useCallback(() => {
    if (!conversation?.id || !currentUser?.id || !isMountedRef.current) return;
    
    // Clear all typing-related timeouts
    if (typingThrottleRef.current) {
      clearTimeout(typingThrottleRef.current);
      typingThrottleRef.current = null;
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    
    // Only send stop typing if we recently sent a typing indicator
    const now = Date.now();
    const timeSinceLastUpdate = now - lastTypingUpdateRef.current;
    
    if (timeSinceLastUpdate < 10000) { // Only if we sent typing indicator in last 10 seconds
      setTyping(conversation.id, currentUser.id, false).catch(console.error);
    }
  }, [conversation?.id, currentUser?.id]);

  // Cleanup all timeouts and subscriptions on unmount
  useEffect(() => {
    return () => {
      // Clear all timeouts
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (markAsReadTimeoutRef.current) {
        clearTimeout(markAsReadTimeoutRef.current);
      }
      if (typingThrottleRef.current) {
        clearTimeout(typingThrottleRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Stop typing indicator if active
      if (conversation?.id && currentUser?.id) {
        setTyping(conversation.id, currentUser.id, false).catch(console.error);
      }
    };
  }, [conversation?.id, currentUser?.id]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !conversation?.id || !currentUser?.id || !isMountedRef.current) return;

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage(""); // Clear immediately for better UX

    // Stop typing indicator when sending
    handleStopTyping();

    try {
      await sendFirebaseMessage({
        conversationId: conversation.id,
        senderId: currentUser.id,
        text: messageText,
        type: "text"
      });
    } catch (error) {
      console.error("Error sending message:", error);
      if (isMountedRef.current) {
        message.error("Failed to send message");
        setNewMessage(messageText); // Restore message on error
      }
    } finally {
      if (isMountedRef.current) {
        setSending(false);
      }
    }
  }, [newMessage, conversation?.id, currentUser?.id, handleStopTyping]);

  // Throttled typing indicator to reduce Firestore writes
  const handleStartTyping = useCallback(() => {
    if (!conversation?.id || !currentUser?.id) return;
    
    const now = Date.now();
    const timeSinceLastUpdate = now - lastTypingUpdateRef.current;
    
    // Only send typing indicator every 3 seconds max
    if (timeSinceLastUpdate < 3000) {
      // Still reset the timeout for stopping typing
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        handleStopTyping();
      }, 5000); // 5 seconds of inactivity (increased from 3)
      
      return;
    }
    
    // Throttle the actual typing indicator updates
    if (typingThrottleRef.current) {
      clearTimeout(typingThrottleRef.current);
    }
    
    typingThrottleRef.current = setTimeout(() => {
      setTyping(conversation.id, currentUser.id, true);
      lastTypingUpdateRef.current = Date.now();
    }, 500); // 500ms throttle
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing after 5 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 5000); // Increased from 3 seconds
  }, [conversation?.id, currentUser?.id, handleStopTyping]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Memoized formatting functions
  const formatMessageTime = useCallback((timestamp) => {
    if (!timestamp) return '';
    
    // Handle Firebase Timestamp
    const time = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return dayjs(time).format('HH:mm');
  }, []);

  const formatDateHeader = useCallback((timestamp) => {
    if (!timestamp) return '';
    
    // Handle Firebase Timestamp
    const time = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const messageDate = dayjs(time);
    const today = dayjs();
    
    if (messageDate.isSame(today, 'day')) {
      return 'Today';
    } else if (messageDate.isSame(today.subtract(1, 'day'), 'day')) {
      return 'Yesterday';
    } else {
      return messageDate.format('MMMM DD, YYYY');
    }
  }, []);

  const shouldShowDateHeader = useCallback((currentMessage, previousMessage) => {
    if (!previousMessage || !currentMessage.timestamp) return true;
    
    const currentTime = currentMessage.timestamp?.toDate ? 
      currentMessage.timestamp.toDate() : new Date(currentMessage.timestamp);
    const previousTime = previousMessage.timestamp?.toDate ? 
      previousMessage.timestamp.toDate() : new Date(previousMessage.timestamp);
    
    const currentDate = dayjs(currentTime);
    const previousDate = dayjs(previousTime);
    
    return !currentDate.isSame(previousDate, 'day');
  }, []);

  // Memoized theme-aware styles
  const messagesContainerStyle = useMemo(() => ({
    background: currentTheme === 'dark' ? 'rgb(33, 43, 54)' : token.colorBgBase
  }), [currentTheme, token.colorBgBase]);

  const dateTextStyle = useMemo(() => ({
    background: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    color: currentTheme === 'dark' ? '#ccc' : '#666'
  }), [currentTheme]);

  const receivedBubbleStyle = useMemo(() => ({
    background: token.colorBgContainer,
    color: token.colorText,
    border: `1px solid ${currentTheme === 'dark' ? '#444' : '#e8e8e8'}`
  }), [token.colorBgContainer, token.colorText, currentTheme]);

  const inputWrapperStyle = useMemo(() => ({
    background: token.colorBgContainer,
    border: `1px solid ${currentTheme === 'dark' ? '#444' : '#e8e8e8'}`
  }), [token.colorBgContainer, currentTheme]);

  const textareaStyle = useMemo(() => ({
    flex: 1,
    border: 'none',
    outline: 'none',
    resize: 'none',
    fontSize: '14px',
    padding: '8px 0',
    background: 'transparent',
    color: currentTheme === 'dark' ? '#fff' : '#000',
    fontFamily: 'inherit',
    lineHeight: '1.4',
    maxHeight: '100px',
    minHeight: '20px'
  }), [currentTheme]);

  // Optimized input change handler
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setNewMessage(value);
    
    if (value.trim()) {
      handleStartTyping();
    } else {
      handleStopTyping();
    }
  }, [handleStartTyping, handleStopTyping]);

  // Memoized main image
  const mainImage = useMemo(() => getMainProfileImage(otherUser?.images), [otherUser?.images]);

  if (!conversation || !otherUser) {
    return null;
  }

  return (
    <div className={css.wrapper}>
      {/* Custom CSS for textarea placeholder and typing animation */}
      <style jsx>{`
        .custom-textarea::placeholder {
          color: ${currentTheme === 'dark' ? '#aaa' : '#666'} !important;
          opacity: 1;
        }
        .custom-textarea::-webkit-input-placeholder {
          color: ${currentTheme === 'dark' ? '#aaa' : '#666'} !important;
        }
        .custom-textarea::-moz-placeholder {
          color: ${currentTheme === 'dark' ? '#aaa' : '#666'} !important;
        }
        .custom-textarea:-ms-input-placeholder {
          color: ${currentTheme === 'dark' ? '#aaa' : '#666'} !important;
        }
        
        .typing-dots {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        
        .typing-dots span {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: ${currentTheme === 'dark' ? '#666' : '#999'};
          animation: typing 1.4s infinite ease-in-out;
        }
        
        .typing-dots span:nth-child(1) {
          animation-delay: 0s;
        }
        
        .typing-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0px);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-6px);
            opacity: 1;
          }
        }
      `}</style>
      {/* Chat Header */}
      <div className={css.header}>
        {isMobile && (
          <Button 
            type="text" 
            icon={<Iconify icon="eva:arrow-back-fill" width="20px" />}
            onClick={onBack}
            className={css.backButton}
          />
        )}
        
        <div className={css.participantInfo}>
          <OnlineStatusAvatar userId={otherUser.id} size="medium">
          <Avatar src={mainImage} size={40}>
            {otherUser.firstName?.[0]}{otherUser.lastName?.[0]}
          </Avatar>
          </OnlineStatusAvatar>
          <div className={css.participantDetails}>
            <Typography.Text className={css.participantName} strong>
              {(otherUser.firstName && otherUser.lastName) 
                ? `${otherUser.firstName} ${otherUser.lastName}` 
                : otherUser.username || 'User'}
            </Typography.Text>
            <OnlineStatusIndicator 
              userId={otherUser.id} 
              showText={true}
            />
          </div>
        </div>

        <div className={css.actions}>
          <Button 
            type="text" 
            icon={<Iconify icon="eva:search-fill" width="20px" />}
            className={css.actionButton}
            onClick={() => setShowSearch(true)}
          />
          <Button 
            type="text" 
            icon={<Iconify icon="eva:phone-fill" width="20px" />}
            className={css.actionButton}
          />
          <Button 
            type="text" 
            icon={<Iconify icon="eva:video-fill" width="20px" />}
            className={css.actionButton}
          />
          <Button 
            type="text" 
            icon={<Iconify icon="eva:more-vertical-fill" width="20px" />}
            className={css.actionButton}
          />
        </div>
      </div>

      {/* Messages Area */}
      <div className={css.messagesContainer} style={messagesContainerStyle}>
        <div className={css.messagesContent}>
          {messages.length === 0 ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <Avatar src={mainImage} size={64} style={{ marginBottom: '16px' }}>
                {otherUser.firstName?.[0]}{otherUser.lastName?.[0]}
              </Avatar>
              <Typography.Title level={4} type="secondary">
                Start a conversation
              </Typography.Title>
              <Typography.Text type="secondary">
                Send a message to {otherUser.firstName || otherUser.username || 'this person'} to start your conversation.
              </Typography.Text>
            </div>
          ) : (
            messages.map((messageItem, index) => {
              const isCurrentUser = messageItem.senderId === currentUser?.id;
              const previousMessage = messages[index - 1];
              const showDateHeader = shouldShowDateHeader(messageItem, previousMessage);

              return (
                <React.Fragment key={messageItem.id}>
                  {showDateHeader && (
                    <div className={css.dateHeader}>
                      <Typography.Text 
                        type="secondary" 
                        className={css.dateText}
                        style={dateTextStyle}
                      >
                        {formatDateHeader(messageItem.timestamp)}
                      </Typography.Text>
                    </div>
                  )}
                  
                  <div 
                    className={`${css.messageWrapper} ${isCurrentUser ? css.sent : css.received} message-hover-container`}
                    style={{ position: 'relative' }}
                    data-message-id={messageItem.id}
                    onMouseEnter={() => setHoveredMessageId(messageItem.id)}
                    onMouseLeave={() => {
                      // Don't hide if a popover is active for this message
                      if (activePopoverId !== messageItem.id) {
                        setHoveredMessageId(null);
                      }
                    }}
                  >
                    {!isCurrentUser && (
                      <OnlineStatusAvatar userId={otherUser.id} size="small">
                      <Avatar 
                        src={mainImage} 
                        size={32} 
                        className={css.messageAvatar}
                      >
                        {otherUser.firstName?.[0]}{otherUser.lastName?.[0]}
                      </Avatar>
                      </OnlineStatusAvatar>
                    )}
                    
                    <div className={css.messageContent} style={{ position: 'relative' }}>
                      <div 
                        className={`${css.messageBubble} ${isCurrentUser ? css.sentBubble : css.receivedBubble}`}
                        style={{
                          ...((!isCurrentUser) ? receivedBubbleStyle : {}),
                          position: 'relative'
                        }}
                      >
                        {messageItem.type === "image" ? (
                          <ImageMessage 
                            messageItem={messageItem}
                            isCurrentUser={isCurrentUser}
                          />
                        ) : messageItem.deleted ? (
                          <Typography.Text 
                            className={css.messageText}
                            style={{ 
                              fontStyle: 'italic', 
                              color: '#999',
                              fontSize: '13px'
                            }}
                          >
                            {messageItem.text || "This message was deleted"}
                        </Typography.Text>
                        ) : (
                          <EditMessage
                            messageItem={messageItem}
                            conversationId={conversation.id}
                            currentUserId={currentUser?.id}
                            isEditing={editingMessageId === messageItem.id}
                            onStartEdit={() => setEditingMessageId(messageItem.id)}
                            onCancelEdit={() => setEditingMessageId(null)}
                            onSaveEdit={() => setEditingMessageId(null)}
                          />
                        )}

                        {/* Hover Actions */}
                        <MessageHoverActions
                          messageItem={messageItem}
                          conversationId={conversation.id}
                          currentUserId={currentUser?.id}
                          isCurrentUser={isCurrentUser}
                          isVisible={hoveredMessageId === messageItem.id && editingMessageId !== messageItem.id}
                          onEdit={() => setEditingMessageId(messageItem.id)}
                          onDelete={() => {/* Real-time updates will handle this */}}
                          reactions={{}} // Will be passed from MessageReactions component
                          onReactionToggle={(emoji) => handleReactionToggle(messageItem.id, emoji, {})}
                          onPopoverStateChange={(isOpen) => {
                            if (isOpen) {
                              setActivePopoverId(messageItem.id);
                            } else {
                              setActivePopoverId(null);
                              // Also check if mouse is still over message
                              setTimeout(() => {
                                if (hoveredMessageId === messageItem.id) {
                                  const messageElement = document.querySelector(`[data-message-id="${messageItem.id}"]`);
                                  if (messageElement && !messageElement.matches(':hover')) {
                                    setHoveredMessageId(null);
                                  }
                                }
                              }, 100);
                            }
                          }}
                        />
                        
                        {/* Message Reactions - only show if not hovering (to avoid conflict) */}
                        {hoveredMessageId !== messageItem.id && (
                          <div style={{
                            position: 'absolute',
                            bottom: '-8px',
                            [isCurrentUser ? 'right' : 'left']: '8px',
                            zIndex: 10
                          }}>
                            <MessageReactions
                              conversationId={conversation.id}
                              messageId={messageItem.id}
                              currentUserId={currentUser?.id}
                              isCurrentUser={isCurrentUser}
                            />
                          </div>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCurrentUser ? 'flex-end' : 'flex-start', gap: '4px' }}>
                      <Typography.Text className={css.messageTime} type="secondary">
                        {formatMessageTime(messageItem.timestamp)}
                      </Typography.Text>
                        <ReadReceiptIndicator
                          conversationId={conversation.id}
                          messageId={messageItem.id}
                          senderId={messageItem.senderId}
                          currentUserId={currentUser?.id}
                          otherUserId={otherUser?.id}
                        />
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          )}
          
          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              marginBottom: '8px'
            }}>
                          <OnlineStatusAvatar userId={otherUser.id} size="small">
              <Avatar 
                src={mainImage} 
                size={24}
              >
                {otherUser.firstName?.[0]}{otherUser.lastName?.[0]}
              </Avatar>
            </OnlineStatusAvatar>
              <div style={{
                background: currentTheme === 'dark' ? '#2a2a2a' : '#f0f0f0',
                borderRadius: '18px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <Typography.Text 
                  type="secondary" 
                  style={{ 
                    fontSize: '12px',
                    marginLeft: '8px',
                    color: currentTheme === 'dark' ? '#ccc' : '#666'
                  }}
                >
                  {otherUser.firstName || otherUser.username || 'User'} is typing...
                </Typography.Text>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className={css.inputContainer}>
        <div className={css.inputWrapper} style={inputWrapperStyle}>
          <ImageUpload
            conversation={conversation}
            currentUser={currentUser}
            onImageSent={() => {
              // Images will automatically appear through the real-time subscription
            }}
          />
          
          <textarea
            className="custom-textarea"
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onBlur={handleStopTyping}
            placeholder={`Message ${otherUser.firstName || otherUser.username || 'user'}...`}
            disabled={sending}
            rows={1}
            style={textareaStyle}
            onInput={(e) => {
              // Auto-resize functionality
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
            }}
          />
          
          <Button 
            type="primary" 
            icon={<Iconify icon="eva:paper-plane-fill" width="18px" />}
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            loading={sending}
            className={css.sendButton}
          />
        </div>
      </div>

      {/* Chat Search */}
      <ChatSearch
        conversation={conversation}
        currentUser={currentUser}
        isVisible={showSearch}
        onClose={() => setShowSearch(false)}
        onMessageClick={(messageItem) => {
          // Scroll to message if needed - can be enhanced later
          console.log("Navigate to message:", messageItem);
        }}
      />
    </div>
  );
};

export default React.memo(ChatArea); 