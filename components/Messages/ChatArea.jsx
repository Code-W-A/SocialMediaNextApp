"use client";
import React, { useState, useRef, useEffect } from "react";
import css from "@/styles/ChatArea.module.css";
import { Avatar, Button, Input, Typography, theme, message } from "antd";
import Iconify from "../Iconify";
import { 
  subscribeToConversationMessages, 
  sendMessage as sendFirebaseMessage 
} from "@/actions/chat";
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
  const messagesEndRef = useRef(null);
  const otherUser = conversation?.otherUser;

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

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation?.id || !currentUser?.id) return;

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage(""); // Clear immediately for better UX

    try {
      await sendFirebaseMessage({
        conversationId: conversation.id,
        senderId: currentUser.id,
        text: messageText,
        type: "text"
      });
    } catch (error) {
      console.error("Error sending message:", error);
      message.error("Failed to send message");
      setNewMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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

  if (!conversation || !otherUser) {
    return null;
  }

  const mainImage = getMainProfileImage(otherUser.images);

  return (
    <div className={css.wrapper}>
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
          <Avatar src={mainImage} size={40}>
            {otherUser.firstName?.[0]}{otherUser.lastName?.[0]}
          </Avatar>
          <div className={css.participantDetails}>
            <Typography.Text className={css.participantName} strong>
              {otherUser.firstName} {otherUser.lastName}
            </Typography.Text>
            <Typography.Text className={css.status} type="secondary">
              {otherUser.lastTimeActive ? 'Active recently' : 'Active now'}
            </Typography.Text>
          </div>
        </div>

        <div className={css.actions}>
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
                Send a message to {otherUser.firstName} to start your conversation.
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
                  
                  <div className={`${css.messageWrapper} ${isCurrentUser ? css.sent : css.received}`}>
                    {!isCurrentUser && (
                      <Avatar 
                        src={mainImage} 
                        size={32} 
                        className={css.messageAvatar}
                      >
                        {otherUser.firstName?.[0]}{otherUser.lastName?.[0]}
                      </Avatar>
                    )}
                    
                    <div className={css.messageContent}>
                      <div 
                        className={`${css.messageBubble} ${isCurrentUser ? css.sentBubble : css.receivedBubble}`}
                        style={!isCurrentUser ? receivedBubbleStyle : {}}
                      >
                        <Typography.Text className={css.messageText}>
                          {messageItem.text}
                        </Typography.Text>
                      </div>
                      <Typography.Text className={css.messageTime} type="secondary">
                        {formatMessageTime(messageItem.timestamp)}
                      </Typography.Text>
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className={css.inputContainer}>
        <div className={css.inputWrapper} style={inputWrapperStyle}>
          <Button 
            type="text" 
            icon={<Iconify icon="eva:attach-fill" width="20px" />}
            className={css.attachButton}
          />
          
          <Input.TextArea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${otherUser.firstName}...`}
            className={css.messageInput}
            autoSize={{ minRows: 1, maxRows: 4 }}
            disabled={sending}
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
    </div>
  );
};

export default ChatArea; 