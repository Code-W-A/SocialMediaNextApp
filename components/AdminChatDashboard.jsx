"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Input,
  Select,
  Badge,
  Avatar,
  Typography,
  Space,
  Tag,
  Divider,
  Row,
  Col,
  Statistic,
  Empty,
  message,
  Tooltip,
  Dropdown,
  Spin
} from 'antd';
import {
  MessageOutlined,
  SendOutlined,
  EyeOutlined,
  CloseOutlined,
  CheckOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  FilterOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useAdminChat } from '@/hooks/useAdminChat';

const { Text, Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AdminChatDashboard = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [isChatModalVisible, setIsChatModalVisible] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const messagesEndRef = useRef(null);

  const {
    allChats,
    isLoadingAllChats,
    chatDetails,
    isLoadingChat,
    realTimeMessages,
    chatStats,
    isLoadingStats,
    sendMessage,
    isSendingMessage,
    updateStatus,
    isUpdatingStatus,
    updatePriority,
    isUpdatingPriority,
    markAsRead,
    enableAdminQueries,
    refreshAllChats,
    refreshStats,
    getAdminUnreadCount
  } = useAdminChat(selectedChat?.id);

  // Enable admin queries on mount
  useEffect(() => {
    enableAdminQueries();
  }, [enableAdminQueries]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [realTimeMessages]);

  // Mark messages as read when admin opens chat
  useEffect(() => {
    if (selectedChat?.id && realTimeMessages.length > 0) {
      const hasUnreadUserMessages = realTimeMessages.some(
        msg => msg.from === 'user' && !msg.read
      );
      if (hasUnreadUserMessages) {
        markAsRead(true);
      }
    }
  }, [selectedChat?.id, realTimeMessages, markAsRead]);

  const handleViewChat = (chat) => {
    setSelectedChat(chat);
    setIsChatModalVisible(true);
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedChat?.id) return;

    sendMessage(messageText.trim(), true, 'Admin');
    setMessageText('');
  };

  const handleUpdateStatus = (chatId, newStatus) => {
    updateStatus(newStatus, 'Admin');
  };

  const handleUpdatePriority = (chatId, newPriority) => {
    updatePriority(newPriority);
  };

  const handleCloseModal = () => {
    setIsChatModalVisible(false);
    setSelectedChat(null);
    setMessageText('');
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'pending': return 'orange';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  // Filter chats based on status and priority
  const filteredChats = allChats?.filter(chat => {
    const statusMatch = statusFilter === 'all' || chat.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || chat.priority === priorityFilter;
    return statusMatch && priorityMatch;
  }) || [];

  const columns = [
    {
      title: 'User',
      dataIndex: 'userName',
      key: 'userName',
      render: (name, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar 
            src={record.userImage} 
            icon={<UserOutlined />} 
            size="small"
          />
          <div>
            <div style={{ fontWeight: '500' }}>{name || 'Unknown User'}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.userEmail}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      render: (subject) => (
        <Text strong style={{ textTransform: 'capitalize' }}>
          {subject?.replace(/_/g, ' ') || 'No Subject'}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={getStatusColor(status)} 
          text={status?.toUpperCase() || 'UNKNOWN'} 
        />
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>
          {priority?.toUpperCase() || 'MEDIUM'}
        </Tag>
      ),
    },
    {
      title: 'Unread',
      dataIndex: 'unreadCount',
      key: 'unreadCount',
      render: (count) => (
        count > 0 ? (
          <Badge count={count} style={{ backgroundColor: '#f5222d' }} />
        ) : (
          <Text type="secondary">0</Text>
        )
      ),
    },
    {
      title: 'Last Message',
      dataIndex: 'lastMessage',
      key: 'lastMessage',
      render: (lastMessage) => (
        <div>
          <Text>{lastMessage?.text?.substring(0, 50) || 'No messages'}</Text>
          {lastMessage?.text?.length > 50 && '...'}
          <br />
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {lastMessage?.timestamp ? formatDateTime(lastMessage.timestamp) : ''}
          </Text>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewChat(record)}
          >
            View
          </Button>
          <Button
            size="small"
            onClick={() => handleUpdateStatus(record.id, record.status === 'active' ? 'closed' : 'active')}
            loading={isUpdatingStatus}
          >
            {record.status === 'active' ? 'Close' : 'Activate'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Statistics Cards */}
      {chatStats && (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Chats"
                value={chatStats.total}
                prefix={<MessageOutlined style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Pending"
                value={chatStats.pending}
                prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Active"
                value={chatStats.active}
                prefix={<CheckOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="High Priority"
                value={chatStats.highPriority}
                prefix={<ExclamationCircleOutlined style={{ color: '#f5222d' }} />}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters and Controls */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Select
              placeholder="Filter by Status"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
            >
              <Option value="all">All Status</Option>
              <Option value="pending">Pending</Option>
              <Option value="active">Active</Option>
              <Option value="closed">Closed</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              placeholder="Filter by Priority"
              value={priorityFilter}
              onChange={setPriorityFilter}
              style={{ width: '100%' }}
            >
              <Option value="all">All Priority</Option>
              <Option value="high">High</Option>
              <Option value="medium">Medium</Option>
              <Option value="low">Low</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                refreshAllChats();
                refreshStats();
              }}
              loading={isLoadingAllChats || isLoadingStats}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Chats Table */}
      <Card title="Support Chats">
        <Table
          columns={columns}
          dataSource={filteredChats}
          rowKey="id"
          loading={isLoadingAllChats}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} chats`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Chat Modal */}
      <Modal
        title={
          selectedChat && (
            <div>
              <Text strong>{selectedChat.subject?.replace(/_/g, ' ')}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {selectedChat.userName} • {selectedChat.userEmail}
              </Text>
            </div>
          )
        }
        open={isChatModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={700}
        bodyStyle={{ padding: '0' }}
        destroyOnClose
      >
        {selectedChat && (
          <div style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
            {/* Messages area */}
            <div style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              background: '#fafafa'
            }}>
              {isLoadingChat ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <Spin size="large" />
                </div>
              ) : realTimeMessages.length > 0 ? (
                <div>
                  {realTimeMessages.map((message, index) => (
                    <div
                      key={message.id || index}
                      style={{
                        display: 'flex',
                        justifyContent: message.from === 'admin' ? 'flex-end' : 'flex-start',
                        marginBottom: '12px'
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '70%',
                          padding: '8px 12px',
                          borderRadius: '12px',
                          background: message.from === 'admin' ? '#52c41a' : 'white',
                          color: message.from === 'admin' ? 'white' : '#333',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        {message.from === 'admin' && message.adminName && (
                          <Text style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
                            {message.adminName}
                          </Text>
                        )}
                        <div>{message.text}</div>
                        <div style={{ 
                          fontSize: '10px', 
                          opacity: 0.7, 
                          textAlign: 'right',
                          marginTop: '4px'
                        }}>
                          {formatMessageTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <Empty description="No messages in this chat" />
              )}
            </div>

            {/* Admin reply area */}
            {selectedChat.status !== 'closed' && (
              <div style={{
                padding: '16px',
                borderTop: '1px solid #f0f0f0',
                background: 'white'
              }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your response..."
                    onPressEnter={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    disabled={isSendingMessage}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    loading={isSendingMessage}
                    disabled={!messageText.trim()}
                  >
                    Send
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminChatDashboard; 