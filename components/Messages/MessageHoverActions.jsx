"use client";
import React from "react";
import { Button, Tooltip, message, Modal } from "antd";
import { 
  EditOutlined, 
  DeleteOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { deleteMessage } from "@/actions/chat";

const { confirm } = Modal;

const MessageHoverActions = ({ 
  messageItem, 
  conversationId, 
  currentUserId, 
  isCurrentUser,
  isVisible,
  onEdit,
  onDelete,
  onPopoverStateChange
}) => {
  // No need for delete options state anymore since we only have one option

  const canEdit = messageItem.senderId === currentUserId && 
                  messageItem.type === "text" && 
                  !messageItem.deleted;

  const canDelete = messageItem.senderId === currentUserId && !messageItem.deleted;



  const handleDeleteForEveryone = async () => {
    try {
      await deleteMessage(conversationId, messageItem.id, "everyone");
      message.success("Message deleted for everyone");
      onDelete?.();
    } catch (error) {
      message.error("Failed to delete message");
    }
  };

  const handleDeleteClick = () => {
          confirm({
            title: 'Delete message for everyone?',
            icon: <ExclamationCircleOutlined />,
            content: 'This message will be deleted for all participants.',
            okText: 'Delete',
            okType: 'danger',
            onOk: handleDeleteForEveryone
          });
  };

  if (!isVisible) return null;

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
        <Tooltip title="Delete message for everyone">
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
            onClick={handleDeleteClick}
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