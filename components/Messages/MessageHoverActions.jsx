"use client";
import React, { useState } from "react";
import { Button, Tooltip, Popover, message, Modal } from "antd";
import { 
  EditOutlined, 
  DeleteOutlined, 
  CopyOutlined,
  SmileOutlined,
  MoreOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { deleteMessage } from "@/actions/chat";
import { addReaction, removeReaction } from "@/actions/chat";

const { confirm } = Modal;

const MessageHoverActions = ({ 
  messageItem, 
  conversationId, 
  currentUserId, 
  isCurrentUser,
  isVisible,
  onEdit,
  onDelete,
  reactions = {},
  onReactionToggle,
  onPopoverStateChange
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);

  // Notify parent when any popover state changes
  const handlePopoverChange = (type, isOpen) => {
    if (type === 'emoji') {
      setShowEmojiPicker(isOpen);
    } else if (type === 'delete') {
      setShowDeleteOptions(isOpen);
    }
    
    // Notify parent about overall popover state
    const anyPopoverOpen = (type === 'emoji' ? isOpen : showEmojiPicker) || 
                          (type === 'delete' ? isOpen : showDeleteOptions);
    onPopoverStateChange?.(anyPopoverOpen);
  };

  const quickEmojis = ['❤️', '👍', '😂', '😮', '😢', '😡'];

  const canEdit = messageItem.senderId === currentUserId && 
                  messageItem.type === "text" && 
                  !messageItem.deleted;

  const canDelete = messageItem.senderId === currentUserId && !messageItem.deleted;

  const handleCopy = () => {
    if (messageItem.text) {
      navigator.clipboard.writeText(messageItem.text);
      message.success("Message copied");
    }
  };

  const handleReaction = async (emoji) => {
    try {
      await onReactionToggle?.(emoji);
      setShowEmojiPicker(false);
    } catch (error) {
      message.error("Failed to add reaction");
    }
  };

  const getCurrentUserReaction = () => {
    for (const [emoji, reactionList] of Object.entries(reactions)) {
      if (reactionList.some(r => r.userId === currentUserId)) {
        return emoji;
      }
    }
    return null;
  };

  const handleDeleteForMe = async () => {
    try {
      await deleteMessage(conversationId, messageItem.id, currentUserId);
      message.success("Message deleted");
      onDelete?.();
    } catch (error) {
      message.error("Failed to delete message");
    }
  };

  const handleDeleteForEveryone = async () => {
    try {
      await deleteMessage(conversationId, messageItem.id, "everyone");
      message.success("Message deleted for everyone");
      onDelete?.();
    } catch (error) {
      message.error("Failed to delete message");
    }
  };

  const getDeleteOptions = () => {
    const messageTime = messageItem.timestamp?.toDate ? 
      messageItem.timestamp.toDate() : new Date(messageItem.timestamp);
    const now = new Date();
    const hoursDiff = (now - messageTime) / (1000 * 60 * 60);
    const canDeleteForEveryone = hoursDiff <= 24;

    const deleteOptions = [
      {
        key: 'delete-me',
        label: 'Delete for me',
        onClick: () => {
          confirm({
            title: 'Delete message for you?',
            icon: <ExclamationCircleOutlined />,
            content: 'This message will only be deleted for you.',
            okText: 'Delete',
            okType: 'danger',
            onOk: handleDeleteForMe
          });
        }
      }
    ];

    if (canDeleteForEveryone) {
      deleteOptions.push({
        key: 'delete-everyone',
        label: 'Delete for everyone',
        onClick: () => {
          confirm({
            title: 'Delete message for everyone?',
            icon: <ExclamationCircleOutlined />,
            content: 'This message will be deleted for all participants.',
            okText: 'Delete',
            okType: 'danger',
            onOk: handleDeleteForEveryone
          });
        },
        danger: true
      });
    }

    return deleteOptions;
  };

  const emojiPickerContent = (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(3, 1fr)', 
      gap: '8px',
      padding: '8px',
      maxWidth: '150px'
    }}>
      {quickEmojis.map((emoji) => {
        const isCurrentUserReaction = getCurrentUserReaction() === emoji;
        return (
          <Button
            key={emoji}
            type="text"
            size="small"
            onClick={() => handleReaction(emoji)}
            style={{
              fontSize: '16px',
              height: '32px',
              width: '32px',
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

  // Keep visible if any popover is open
  const shouldShowActions = isVisible || showEmojiPicker || showDeleteOptions;
  
  if (!shouldShowActions) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '-40px',
        [isCurrentUser ? 'right' : 'left']: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '20px',
        padding: '4px 8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        animation: 'fadeInUp 0.2s ease-out'
      }}
    >
      {/* Quick Reaction Button */}
              <Popover
          content={emojiPickerContent}
          trigger="click"
          open={showEmojiPicker}
          onOpenChange={(isOpen) => handlePopoverChange('emoji', isOpen)}
          placement="top"
        >
        <Tooltip title="Add reaction">
          <Button
            type="text"
            size="small"
            icon={<SmileOutlined />}
            style={{
              minWidth: '28px',
              height: '28px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
        </Tooltip>
      </Popover>

      {/* Copy Button */}
      {messageItem.text && (
        <Tooltip title="Copy message">
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined />}
            onClick={handleCopy}
            style={{
              minWidth: '28px',
              height: '28px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
        </Tooltip>
      )}

      {/* Edit Button */}
      {canEdit && (
        <Tooltip title="Edit message">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={onEdit}
            style={{
              minWidth: '28px',
              height: '28px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
        </Tooltip>
      )}

      {/* Delete Button */}
      {canDelete && (
        <Popover
          content={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {getDeleteOptions().map(option => (
                <Button
                  key={option.key}
                  type="text"
                  size="small"
                  danger={option.danger}
                  onClick={option.onClick}
                  style={{ justifyContent: 'flex-start' }}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          }
          trigger="click"
          open={showDeleteOptions}
          onOpenChange={(isOpen) => handlePopoverChange('delete', isOpen)}
          placement="top"
        >
          <Tooltip title="Delete message">
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              style={{
                minWidth: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ff4d4f'
              }}
            />
          </Tooltip>
        </Popover>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default MessageHoverActions; 