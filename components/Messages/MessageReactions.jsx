"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button, Popover, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { addReaction, removeReaction, subscribeToMessageReactions } from "@/actions/chat";

const MessageReactions = ({ conversationId, messageId, currentUserId, isCurrentUser }) => {
  const [reactions, setReactions] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);

  // Common emojis for quick access
  const quickEmojis = ['❤️', '👍', '😂', '😮', '😢', '😡', '🔥', '👏'];

  useEffect(() => {
    if (!conversationId || !messageId) return;

    const unsubscribe = subscribeToMessageReactions(
      conversationId,
      messageId,
      (updatedReactions) => {
        setReactions(updatedReactions);
      }
    );

    return unsubscribe;
  }, [conversationId, messageId]);

  // Listen for hover on parent message container
  useEffect(() => {
    const messageContainer = containerRef.current?.closest('.message-hover-container');
    if (!messageContainer) return;

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
      // Don't hide if popover is open
      if (!showEmojiPicker) {
        setIsHovered(false);
      }
    };

    messageContainer.addEventListener('mouseenter', handleMouseEnter);
    messageContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      messageContainer.removeEventListener('mouseenter', handleMouseEnter);
      messageContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [showEmojiPicker]);

  const getCurrentUserReaction = () => {
    // Find what emoji the current user has reacted with
    for (const [emoji, reactionList] of Object.entries(reactions)) {
      if (reactionList.some(r => r.userId === currentUserId)) {
        return emoji;
      }
    }
    return null;
  };

  const handleReaction = async (emoji) => {
    try {
      const currentReaction = getCurrentUserReaction();
      console.log('Current reaction:', currentReaction, 'Clicked emoji:', emoji);
      
      if (currentReaction) {
        // Remove current reaction first
        console.log('Removing reaction:', currentReaction);
        await removeReaction(conversationId, messageId, currentUserId, currentReaction);
      }
      
      // If clicking the same emoji, just remove it (don't add again)
      if (currentReaction !== emoji) {
        console.log('Adding new reaction:', emoji);
        await addReaction(conversationId, messageId, currentUserId, emoji);
      } else {
        console.log('Same emoji clicked, only removing');
      }
      
      setShowEmojiPicker(false);
      
      // After selection, check if we should hide the button
      setTimeout(() => {
        const messageContainer = containerRef.current?.closest('.message-hover-container');
        if (messageContainer && !messageContainer.matches(':hover')) {
          setIsHovered(false);
        }
      }, 100);
    } catch (error) {
      message.error("Failed to add reaction");
    }
  };

  const getReactionCount = (emoji) => {
    return reactions[emoji]?.length || 0;
  };

  const hasUserReacted = (emoji) => {
    return reactions[emoji]?.some(r => r.userId === currentUserId);
  };

  const emojiPickerContent = (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(4, 1fr)', 
      gap: '8px',
      padding: '8px',
      maxWidth: '200px'
    }}>
      {quickEmojis.map((emoji) => {
        const isCurrentUserReaction = getCurrentUserReaction() === emoji;
        return (
          <Button
            key={emoji}
            type="text"
            size="large"
            onClick={() => handleReaction(emoji)}
            style={{
              fontSize: '20px',
              height: '40px',
              width: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: isCurrentUserReaction ? '2px solid var(--primary)' : 'none',
              backgroundColor: isCurrentUserReaction ? 'rgba(24, 144, 255, 0.1)' : 'transparent'
            }}
          >
            {emoji}
          </Button>
        );
      })}
    </div>
  );

  const hasReactions = Object.keys(reactions).length > 0;
  const currentUserReaction = getCurrentUserReaction();

  return (
    <div 
      ref={containerRef}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '4px',
        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
        flexWrap: 'wrap',
        position: 'relative',
        minHeight: hasReactions || isHovered ? '28px' : '0',
        transition: 'minHeight 0.2s ease'
      }}
    >
      {/* Display existing reactions */}
      {Object.entries(reactions).map(([emoji, reactionList]) => {
        const count = reactionList.length;
        const userReacted = hasUserReacted(emoji);
        
        return (
          <Button
            key={emoji}
            size="small"
            type={userReacted ? "primary" : "default"}
            onClick={() => handleReaction(emoji)}
            style={{
              height: '24px',
              fontSize: '12px',
              padding: '0 6px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: userReacted ? 'var(--primary)' : 'rgba(0,0,0,0.04)',
              border: userReacted ? 'none' : '1px solid rgba(0,0,0,0.1)'
            }}
          >
            <span style={{ fontSize: '10px' }}>{emoji}</span>
            <span style={{ fontSize: '10px' }}>{count}</span>
          </Button>
        );
      })}
      
      {/* Add reaction button - only show on hover or if there are reactions */}
      {(isHovered || hasReactions || showEmojiPicker) && (
        <Popover
          content={emojiPickerContent}
          trigger="click"
          open={showEmojiPicker}
          onOpenChange={(visible) => {
            setShowEmojiPicker(visible);
            // When popover closes, also check if we should hide the button
            if (!visible) {
              const messageContainer = containerRef.current?.closest('.message-hover-container');
              if (messageContainer && !messageContainer.matches(':hover')) {
                setIsHovered(false);
              }
            }
          }}
          placement="topLeft"
          overlayStyle={{ zIndex: 1050 }}
        >
          <Button
            size="small"
            type="text"
            icon={<PlusOutlined />}
            style={{
              height: '24px',
              width: '24px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              color: '#666',
              backgroundColor: isHovered ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.1)',
              opacity: isHovered ? 1 : 0.7,
              transition: 'all 0.2s ease',
              transform: isHovered ? 'scale(1.1)' : 'scale(1)'
            }}
          />
        </Popover>
      )}
    </div>
  );
};

export default MessageReactions; 