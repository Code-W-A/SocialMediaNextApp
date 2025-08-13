"use client";
import React, { useState, useEffect } from "react";
import { CheckOutlined } from "@ant-design/icons";
import { subscribeToReadReceipts } from "@/actions/chat";
import { FEATURE_FLAGS, loadFlagsFromEnv } from "@/utils/featureFlags";
import { useSubscription } from "@/hooks/useSubscription";

const ReadReceiptIndicator = ({ conversationId, messageId, senderId, currentUserId, otherUserId }) => {
  const [readReceipts, setReadReceipts] = useState([]);
  const { isPremium } = useSubscription();
  const flags = loadFlagsFromEnv();
  
  // Only show read receipts for messages sent by current user
  const isCurrentUserMessage = senderId === currentUserId;

  useEffect(() => {
    if (!isCurrentUserMessage || !conversationId || !messageId) return;

    const unsubscribe = subscribeToReadReceipts(
      conversationId,
      messageId,
      (receipts) => {
        setReadReceipts(receipts);
      }
    );

    return unsubscribe;
  }, [conversationId, messageId, isCurrentUserMessage]);

  // If gated by premium-only flag, hide indicator for non-premium users
  if (!isCurrentUserMessage) return null;
  if (flags.PREMIUM_READ_RECEIPTS_ONLY && !isPremium) return null;

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