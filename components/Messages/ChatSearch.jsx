"use client";
import React, { useState, useEffect } from "react";
import { Input, Button, List, Typography, Avatar, Drawer, message } from "antd";
import { SearchOutlined, CloseOutlined } from "@ant-design/icons";
import { searchInConversation } from "@/actions/chat";
import { getMainProfileImage } from "@/utils/imageHelpers";
import dayjs from "dayjs";

const ChatSearch = ({ conversation, currentUser, isVisible, onClose, onMessageClick }) => {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const otherUser = conversation?.otherUser;

  useEffect(() => {
    if (!searchText.trim()) {
      setSearchResults([]);
      return;
    }

    const searchTimer = setTimeout(async () => {
      if (!conversation?.id) return;
      
      setSearching(true);
      try {
        const results = await searchInConversation(conversation.id, searchText);
        setSearchResults(results);
      } catch (error) {
        message.error("Search failed");
      } finally {
        setSearching(false);
      }
    }, 300); // Debounce search

    return () => clearTimeout(searchTimer);
  }, [searchText, conversation?.id]);

  const handleResultClick = (messageItem) => {
    onMessageClick?.(messageItem);
    onClose();
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const time = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return dayjs(time).format('MMM DD, HH:mm');
  };

  const getSenderName = (senderId) => {
    if (senderId === currentUser?.id) {
      return "You";
    }
    return otherUser?.firstName || otherUser?.username || "User";
  };

  const getSenderAvatar = (senderId) => {
    if (senderId === currentUser?.id) {
      return getMainProfileImage(currentUser?.images);
    }
    return getMainProfileImage(otherUser?.images);
  };

  return (
    <Drawer
      title="Search in Conversation"
      placement="right"
      onClose={onClose}
      open={isVisible}
      width={400}
      extra={
        <Button 
          type="text" 
          icon={<CloseOutlined />} 
          onClick={onClose}
        />
      }
    >
      <div style={{ marginBottom: '16px' }}>
        <Input
          placeholder="Search messages..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          loading={searching}
          allowClear
        />
      </div>

      {searchText.trim() && (
        <div style={{ marginBottom: '16px' }}>
          <Typography.Text type="secondary">
            {searching ? "Searching..." : `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} found`}
          </Typography.Text>
        </div>
      )}

      <List
        dataSource={searchResults}
        renderItem={(item) => (
          <List.Item 
            onClick={() => handleResultClick(item)}
            style={{ 
              cursor: 'pointer',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '8px',
              border: '1px solid #f0f0f0'
            }}
            className="search-result-item"
          >
            <List.Item.Meta
              avatar={
                <Avatar 
                  src={getSenderAvatar(item.senderId)} 
                  size={32}
                >
                  {getSenderName(item.senderId)[0]}
                </Avatar>
              }
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography.Text strong>
                    {getSenderName(item.senderId)}
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                    {formatMessageTime(item.timestamp)}
                  </Typography.Text>
                </div>
              }
              description={
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: item.highlightedText || item.text 
                  }}
                  style={{ 
                    maxWidth: '100%',
                    wordBreak: 'break-word',
                    fontSize: '14px'
                  }}
                />
              }
            />
          </List.Item>
        )}
        locale={{
          emptyText: searchText.trim() ? (searching ? "Searching..." : "No messages found") : "Start typing to search messages"
        }}
      />

      <style jsx>{`
        .search-result-item:hover {
          background-color: #f5f5f5;
        }
        
        .search-result-item mark {
          background-color: #fffb8f;
          padding: 2px 4px;
          border-radius: 3px;
          font-weight: 500;
        }
      `}</style>
    </Drawer>
  );
};

export default ChatSearch; 