"use client";
import React, { useState, useRef, useEffect } from "react";
import css from "@/styles/ChatArea.module.css";
import { Avatar, Button, Input, Typography, theme, message } from "antd";
import Iconify from "../Iconify";
import { 
  subscribeToConversationMessages, 
  sendMessage as sendFirebaseMessage,
  setTyping,
  subscribeToTyping,
  markConversationAsRead
} from "@/actions/chat";
import ReadReceiptIndicator from "./ReadReceiptIndicator";
import ChatSearch from "./ChatSearch";
import ImageUpload from "./ImageUpload";
import ImageMessage from "./ImageMessage";
import EditMessage from "./EditMessage";
import MessageHoverActions from "./MessageHoverActions";
import OnlineStatusIndicator, { OnlineStatusAvatar } from "../OnlineStatusIndicator";
import { getMainProfileImage } from "@/utils/imageHelpers";
import { useSettingsContext } from "@/context/settings/settings-context";
import { useLanguage } from "@/lib/i18n";
import dayjs from "dayjs";
import useBottomNavbarHeight from "@/hooks/useBottomNavbarHeight";

const { useToken } = theme;

// Custom hook for dynamic viewport height
const useViewportHeight = () => {
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    const updateViewportHeight = () => {
      // Use the actual viewport height
      const vh = window.visualViewport?.height || window.innerHeight;
      setViewportHeight(vh);
      
      // Update CSS custom property for dynamic height
      document.documentElement.style.setProperty('--viewport-height', `${vh}px`);
    };

    // Initial measurement
    updateViewportHeight();

    // Listen for viewport changes (important for iOS Safari)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewportHeight);
    }
    
    // Fallback for older browsers
    window.addEventListener('resize', updateViewportHeight);
    window.addEventListener('orientationchange', updateViewportHeight);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewportHeight);
      }
      window.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('orientationchange', updateViewportHeight);
    };
  }, []);

  return viewportHeight;
};

const ChatArea = ({ conversation, onBack, isMobile, currentUser }) => {
  const { settings: { theme: currentTheme } } = useSettingsContext();
  const { token } = useToken();
  const { t } = useLanguage();
  const viewportHeight = useViewportHeight();
  const { height: bottomNavbarHeight } = useBottomNavbarHeight();
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
  const wrapperRef = useRef(null);
  const textareaRef = useRef(null);
  const otherUser = conversation?.otherUser;

  // Dynamic height adjustment for mobile
  useEffect(() => {
    if (!isMobile || !wrapperRef.current) return;

    const updateChatHeight = () => {
      if (wrapperRef.current && viewportHeight > 0) {
        // Calculate available height minus header and bottom navigation
        const headerHeight = 60; // Approximate header height on mobile
        const availableHeight = viewportHeight - headerHeight - bottomNavbarHeight;
        wrapperRef.current.style.height = `${Math.max(availableHeight, 300)}px`;
      }
    };

    updateChatHeight();
    
    // Update on viewport changes (keyboard show/hide on iOS)
    const resizeObserver = new ResizeObserver(updateChatHeight);
    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [isMobile, viewportHeight, bottomNavbarHeight]);

  // Subscribe to messages in real-time
  useEffect(() => {
    if (!conversation?.id) return;

    const unsubscribe = subscribeToConversationMessages(
      conversation.id,
      (updatedMessages) => {
        setMessages(updatedMessages);
      }
    );

    return unsubscribe;
  }, [conversation?.id]);

  // Subscribe to typing indicators
  useEffect(() => {
    if (!conversation?.id || !currentUser?.id) return;

    const unsubscribe = subscribeToTyping(
      conversation.id,
      currentUser.id,
      (typingUserIds) => {
        setTypingUsers(typingUserIds);
      }
    );

    return unsubscribe;
  }, [conversation?.id, currentUser?.id]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when conversation is viewed
  useEffect(() => {
    if (!conversation?.id || !currentUser?.id || messages.length === 0) return;

    const timer = setTimeout(() => {
      markConversationAsRead(conversation.id, currentUser.id);
    }, 1000); // Wait 1 second before marking as read

    return () => clearTimeout(timer);
  }, [conversation?.id, currentUser?.id, messages]);

  // Cleanup typing indicator on unmount
  useEffect(() => {
    return () => {
      handleStopTyping();
    };
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation?.id || !currentUser?.id) return;

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
      message.error(t('chat.failedToSendMessage'));
      setNewMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleStartTyping = () => {
    if (!conversation?.id || !currentUser?.id) return;
    
    setTyping(conversation.id, currentUser.id, true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 3000);
  };

  const handleStopTyping = () => {
    if (!conversation?.id || !currentUser?.id) return;
    
    setTyping(conversation.id, currentUser.id, false);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const handleMoveCursorToEnd = () => {
    if (textareaRef.current) {
      const textLength = newMessage.length;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(textLength, textLength);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Insert a new line instead of sending the message
      const cursorPosition = e.target.selectionStart;
      const textBefore = newMessage.substring(0, cursorPosition);
      const textAfter = newMessage.substring(e.target.selectionEnd);
      setNewMessage(textBefore + '\n' + textAfter);
      
      // Set cursor position after the new line
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = cursorPosition + 1;
      }, 0);
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    // Handle Firebase Timestamp
    const time = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return dayjs(time).format('HH:mm');
  };

  const formatDateHeader = (timestamp) => {
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
  };

  const shouldShowDateHeader = (currentMessage, previousMessage) => {
    if (!previousMessage || !currentMessage.timestamp) return true;
    
    const currentTime = currentMessage.timestamp?.toDate ? 
      currentMessage.timestamp.toDate() : new Date(currentMessage.timestamp);
    const previousTime = previousMessage.timestamp?.toDate ? 
      previousMessage.timestamp.toDate() : new Date(previousMessage.timestamp);
    
    const currentDate = dayjs(currentTime);
    const previousDate = dayjs(previousTime);
    
    return !currentDate.isSame(previousDate, 'day');
  };

  // Theme-aware styles
  const messagesContainerStyle = {
    background: currentTheme === 'dark' ? 'rgb(33, 43, 54)' : token.colorBgBase
  };

  const dateTextStyle = {
    background: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    color: currentTheme === 'dark' ? '#ccc' : '#666'
  };

  const receivedBubbleStyle = {
    background: token.colorBgContainer,
    color: token.colorText,
    border: `1px solid ${currentTheme === 'dark' ? '#444' : '#e8e8e8'}`
  };

  const inputWrapperStyle = {
    background: token.colorBgContainer,
    border: `1px solid ${currentTheme === 'dark' ? '#444' : '#e8e8e8'}`
  };

  const textareaStyle = {
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
  };

  if (!conversation || !otherUser) {
    return null;
  }

  const mainImage = getMainProfileImage(otherUser.images);

  return (
    <div 
      ref={wrapperRef}
      className={css.wrapper}
      style={isMobile ? { 
        height: 'auto',
        minHeight: '100%',
        maxHeight: '100%'
      } : {}}
    >
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
            onClick={handleMoveCursorToEnd}
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
                {t('chat.startConversation')}
              </Typography.Title>
              <Typography.Text type="secondary">
                {t('chat.sendMessageToStart', { name: otherUser.firstName || otherUser.username || t('common.thisPerson') })}
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
                src={getMainProfileImage(otherUser.images)} 
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
                  {t('chat.isTyping', { name: otherUser.firstName || otherUser.username || t('common.user') })}
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
            onChange={(e) => {
              setNewMessage(e.target.value);
              if (e.target.value.trim()) {
                handleStartTyping();
              } else {
                handleStopTyping();
              }
            }}
            onKeyPress={handleKeyPress}
            onBlur={handleStopTyping}
            placeholder={t('chat.messagePlaceholder', { name: otherUser.firstName || otherUser.username || t('common.user') })}
            disabled={sending}
            rows={1}
            style={textareaStyle}
            onInput={(e) => {
              // Auto-resize functionality
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
            }}
            ref={textareaRef}
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

export default ChatArea; 