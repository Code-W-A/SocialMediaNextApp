"use client";
import React, { useState, useEffect } from "react";
import { CheckOutlined } from "@ant-design/icons";
import { subscribeToReadReceipts } from "@/actions/chat";

const ReadReceiptIndicator = ({ conversationId, messageId, senderId, currentUserId, otherUserId }) => {
  const [readReceipts, setReadReceipts] = useState([]);
  
  // Only show read receipts for messages sent by current user
  const isCurrentUserMessage = senderId === currentUserId;
  if (!isCurrentUserMessage) return null;

  useEffect(() => {
    if (!conversationId || !messageId) return;

    const unsubscribe = subscribeToReadReceipts(
      conversationId,
      messageId,
      (receipts) => {
        setReadReceipts(receipts);
      }
    );

    return unsubscribe;
  }, [conversationId, messageId]);

  // Check if other user has read the message
  const isReadByOther = readReceipts.some(receipt => receipt.userId === otherUserId);

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'flex-end',
      marginLeft: '8px',
      marginTop: '2px'
    }}>
      {isReadByOther ? (
        // Double check (read)
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <CheckOutlined 
            style={{ 
              fontSize: '12px', 
              color: '#1890ff',
              position: 'relative',
              zIndex: 2
            }} 
          />
          <CheckOutlined 
            style={{ 
              fontSize: '12px', 
              color: '#1890ff',
              position: 'absolute',
              left: '-3px',
              zIndex: 1
            }} 
          />
        </div>
      ) : (
        // Single check (delivered but not read)
        <CheckOutlined 
          style={{ 
            fontSize: '12px', 
            color: '#8c8c8c'
          }} 
        />
      )}
    </div>
  );
};

export default ReadReceiptIndicator; 