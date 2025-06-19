"use client";
import React, { useState, useEffect, useRef } from "react";
import { Input, Button, message } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { editMessage } from "@/actions/chat";

const EditMessage = ({ 
  messageItem, 
  conversationId, 
  currentUserId, 
  isEditing, 
  onStartEdit, 
  onCancelEdit, 
  onSaveEdit 
}) => {
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  // Initialize edit text when editing starts
  useEffect(() => {
    if (isEditing && messageItem.text) {
      setEditText(messageItem.text);
      // Focus input after state update
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isEditing, messageItem.text]);

  const handleSave = async () => {
    if (!editText.trim()) {
      message.error("Message cannot be empty");
      return;
    }

    if (editText.trim() === messageItem.text) {
      // No changes made
      onCancelEdit();
      return;
    }

    setSaving(true);
    try {
      await editMessage(conversationId, messageItem.id, editText.trim());
      message.success("Message updated");
      onSaveEdit();
    } catch (error) {
      message.error("Failed to update message");
      console.error("Error editing message:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onCancelEdit();
    }
  };

  const canEdit = messageItem.senderId === currentUserId && 
                  messageItem.type === "text" && 
                  !messageItem.deleted;

  if (!isEditing) {
    // Show original message with edit capability
    return (
      <div 
        onDoubleClick={canEdit ? onStartEdit : undefined}
        style={{ 
          cursor: canEdit ? 'text' : 'default',
          position: 'relative'
        }}
      >
        {messageItem.text}
        {messageItem.edited && (
          <span style={{ 
            fontSize: '11px', 
            color: '#888', 
            marginLeft: '8px',
            fontStyle: 'italic'
          }}>
            (edited)
          </span>
        )}
      </div>
    );
  }

  // Show edit input
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      width: '100%'
    }}>
      <Input.TextArea
        ref={inputRef}
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        onKeyDown={handleKeyPress}
        autoSize={{ minRows: 1, maxRows: 4 }}
        style={{
          flex: 1,
          resize: 'none'
        }}
        disabled={saving}
      />
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '4px',
        flexShrink: 0
      }}>
        <Button
          type="text"
          size="small"
          icon={<CheckOutlined />}
          onClick={handleSave}
          loading={saving}
          style={{
            color: '#52c41a',
            minWidth: '24px',
            height: '24px'
          }}
        />
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={onCancelEdit}
          disabled={saving}
          style={{
            color: '#ff4d4f',
            minWidth: '24px',
            height: '24px'
          }}
        />
      </div>
    </div>
  );
};

export default EditMessage; 