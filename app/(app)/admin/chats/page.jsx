"use client";
import React from 'react';
import AdminChatDashboard from '@/components/AdminChatDashboard';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

const AdminChatsPage = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ marginBottom: '24px' }}>
        <Title level={2}>Admin Chat Support Dashboard</Title>
        <Text type="secondary">
          Manage all user support chats, respond to queries, and monitor chat statistics.
        </Text>
      </Card>
      
      <AdminChatDashboard />
    </div>
  );
};

export default AdminChatsPage; 