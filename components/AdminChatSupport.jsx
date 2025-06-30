"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Modal, 
  Button, 
  Form, 
  Input, 
  Select, 
  Typography, 
  Space, 
  Card, 
  Avatar, 
  Divider,
  Badge,
  Tooltip,
  Spin,
  Empty,
  message as antMessage,
  List
} from 'antd';
import { 
  CustomerServiceOutlined, 
  SendOutlined, 
  CloseOutlined,
  MailOutlined,
  MessageOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useAdminChat } from '@/hooks/useAdminChat';
import { useUser } from '@/hooks/useFirebaseAuth';
import { useLanguage } from '@/lib/i18n';
import { setSupportOpener } from '@/utils/supportHelpers';

const { TextArea } = Input;
const { Text, Title } = Typography;
const { Option } = Select;

// Global reference for opening support from anywhere
let globalSupportOpener = null;

const AdminChatSupport = ({ 
  trigger = "button", // "button", "fab", or "hidden"
  buttonText = null,
  size = "default"
}) => {
  console.log('🎯 [AdminChatSupport] Component rendered with trigger:', trigger);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isChatMode, setIsChatMode] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [form] = Form.useForm();
  const messagesEndRef = useRef(null);
  
  const { user } = useUser();
  const { t, language } = useLanguage();
  
  console.log('🔐 [AdminChatSupport] Current user:', user?.id || 'Not logged in');
  console.log('🌍 [AdminChatSupport] Current language:', language);
  
  const {
    userChats,
    isLoadingUserChats,
    createChat,
    isCreatingChat,
    sendMessage,
    isSendingMessage,
    chatDetails,
    isLoadingChat,
    realTimeMessages,
    markAsRead,
    getUnreadCount
  } = useAdminChat(activeChatId, isModalVisible);

  // Set up global opener when component mounts
  useEffect(() => {
    console.log('📡 [AdminChatSupport] Setting up global support opener');
    const opener = () => {
      console.log('🚀 [AdminChatSupport] Opening support via global trigger');
      setIsModalVisible(true);
    };

    // Set in utils helper
    setSupportOpener(opener);
    
    // Also set global reference for direct access
    globalSupportOpener = opener;
    
    // Expose to window for debugging
    if (typeof window !== 'undefined') {
      window.openSupport = opener;
      console.log('🪟 [AdminChatSupport] Exposed window.openSupport() for debugging');
    }
    
    return () => {
      setSupportOpener(null);
      globalSupportOpener = null;
      if (typeof window !== 'undefined') {
        delete window.openSupport;
      }
    };
  }, []);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      console.log('📜 [AdminChatSupport] Auto-scrolling to bottom, messages:', realTimeMessages?.length || 0);
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [realTimeMessages]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (activeChatId && realTimeMessages.length > 0) {
      console.log('👀 [AdminChatSupport] Checking for unread messages in chat:', activeChatId);
      const hasUnreadAdminMessages = realTimeMessages.some(
        msg => msg.from === 'admin' && !msg.read
      );
      if (hasUnreadAdminMessages) {
        console.log('✅ [AdminChatSupport] Marking admin messages as read');
        markAsRead(false);
      } else {
        console.log('📭 [AdminChatSupport] No unread admin messages found');
      }
    }
  }, [activeChatId, realTimeMessages, markAsRead]);

  // Log modal state changes
  useEffect(() => {
    console.log('🎭 [AdminChatSupport] Modal state changed:', {
      isModalVisible,
      isChatMode,
      activeChatId,
      userChatsCount: userChats?.length || 0
    });
  }, [isModalVisible, isChatMode, activeChatId, userChats]);

  const handleStartChat = async (values) => {
    console.log('🚀 [AdminChatSupport] Starting new chat with values:', values);
    try {
      const chatData = {
        email: values.email,
        subject: values.subject,
        message: values.message,
        language: language,
        name: values.name || `${user?.firstName} ${user?.lastName}` || user?.email
      };

      console.log('📦 [AdminChatSupport] Prepared chat data:', chatData);
      const result = await createChat(chatData);
      
      if (result.success) {
        console.log('✅ [AdminChatSupport] Chat created successfully:', result.chatId);
        setActiveChatId(result.chatId);
        setIsChatMode(true);
        form.resetFields();
        antMessage.success('Chat support created successfully!');
      } else {
        console.error('❌ [AdminChatSupport] Failed to create chat:', result);
        throw new Error(result.error || 'Failed to create chat');
      }
    } catch (error) {
      console.error('💥 [AdminChatSupport] Error starting chat:', error);
      console.error('📊 [AdminChatSupport] Error stack:', error.stack);
      antMessage.error('Failed to create chat support.');
    }
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !activeChatId) {
      console.warn('⚠️ [AdminChatSupport] Cannot send message:', {
        messageText: messageText.trim(),
        activeChatId
      });
      return;
    }
    
    console.log('💬 [AdminChatSupport] Sending message:', {
      chatId: activeChatId,
      messageLength: messageText.trim().length
    });
    
    sendMessage(messageText.trim());
    setMessageText('');
  };

  const handleOpenExistingChat = (chatId) => {
    console.log('📂 [AdminChatSupport] Opening existing chat:', chatId);
    setActiveChatId(chatId);
    setIsChatMode(true);
  };

  const handleCloseModal = () => {
    console.log('❌ [AdminChatSupport] Closing modal and resetting state');
    setIsModalVisible(false);
    setIsChatMode(false);
    setActiveChatId(null);
    setMessageText('');
    form.resetFields();
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'pending': return 'orange';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return chatT('active');
      case 'pending': return chatT('pending');
      case 'closed': return chatT('closed');
      default: return status;
    }
  };

  const unreadCount = getUnreadCount();
  console.log('📬 [AdminChatSupport] Current unread count:', unreadCount);

  // Trigger button/fab rendering
  if (trigger === "hidden") {
    console.log('👻 [AdminChatSupport] Hidden trigger mode - no UI element rendered');
    // Hidden mode - no trigger element, controlled externally
  } else if (trigger === "fab") {
    console.log('🎈 [AdminChatSupport] Rendering FAB trigger');
  } else {
    console.log('🔘 [AdminChatSupport] Rendering button trigger');
  }

  const triggerElement = trigger === "hidden" ? null : trigger === "fab" ? (
    <div style={{
      position: 'fixed',
      bottom: '100px',
      right: '24px',
      zIndex: 1000
    }}>
      <Badge count={unreadCount} offset={[-5, 5]}>
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<CustomerServiceOutlined />}
          onClick={() => {
            console.log('🎈 [AdminChatSupport] FAB clicked');
            setIsModalVisible(true);
          }}
          style={{
            width: '56px',
            height: '56px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            background: 'linear-gradient(135deg, #1890ff, #40a9ff)',
            border: 'none'
          }}
        />
      </Badge>
    </div>
  ) : (
    <Badge count={unreadCount} offset={[8, 0]}>
      <Button
        type="primary"
        size={size}
        icon={<CustomerServiceOutlined />}
        onClick={() => {
          console.log('🔘 [AdminChatSupport] Button clicked');
          setIsModalVisible(true);
        }}
        style={{
          background: 'linear-gradient(135deg, #1890ff, #40a9ff)',
          border: 'none'
        }}
      >
        {buttonText || chatT('contactSupport')}
      </Button>
    </Badge>
  );

  const offlineMessage = language === 'ro' 
    ? "Vă vom răspunde în cel mai scurt timp posibil sau vă vom trimite un email de răspuns."
    : "We will respond as soon as possible or send you an email response.";

  const translations = {
    ro: {
      contactSupport: 'Contactează Suportul',
      supportChat: 'Chat Suport',
      previousConversations: 'Conversații Anterioare',
      startNewConversation: 'Începe Conversație Nouă',
      fullName: 'Nume Complet',
      emailForResponse: 'Email (pentru răspuns dacă nu suntem online)',
      subject: 'Subiect',
      message: 'Mesaj',
      startChat: 'Începe Chat',
      typeMessage: 'Scrie mesajul tău...',
      noMessages: 'Încă nu sunt mesaje',
      handledBy: 'Gestionat de',
      pleaseEnterName: 'Te rugăm să introduci numele',
      pleaseEnterEmail: 'Te rugăm să introduci email-ul',
      pleaseEnterValidEmail: 'Te rugăm să introduci un email valid',
      pleaseSelectSubject: 'Te rugăm să selectezi un subiect',
      pleaseEnterMessage: 'Te rugăm să introduci mesajul',
      messageMinLength: 'Mesajul trebuie să aibă cel puțin 10 caractere',
      enterFullName: 'Introduceți numele complet',
      enterEmailAddress: 'Introduceți adresa de email',
      selectHelpType: 'Selectați tipul de ajutor de care aveți nevoie',
      describeIssue: 'Descrieți problema sau întrebarea în detaliu...',
      technicalIssue: 'Problemă Tehnică',
      accountHelp: 'Ajutor Cont',
      premiumSupport: 'Suport Premium',
      billingPayments: 'Facturare și Plăți',
      featureRequest: 'Cerere Funcționalitate',
      bugReport: 'Raportare Bug',
      other: 'Altele',
      active: 'Activ',
      pending: 'În Așteptare',
      closed: 'Închis'
    },
    en: {
      contactSupport: 'Contact Support',
      supportChat: 'Support Chat',
      previousConversations: 'Previous Conversations',
      startNewConversation: 'Start New Conversation',
      fullName: 'Full Name',
      emailForResponse: 'Email (for response if we\'re offline)',
      subject: 'Subject',
      message: 'Message',
      startChat: 'Start Chat',
      typeMessage: 'Type your message...',
      noMessages: 'No messages yet',
      handledBy: 'Handled by',
      pleaseEnterName: 'Please enter your name',
      pleaseEnterEmail: 'Please enter your email',
      pleaseEnterValidEmail: 'Please enter a valid email',
      pleaseSelectSubject: 'Please select a subject',
      pleaseEnterMessage: 'Please enter your message',
      messageMinLength: 'Message must be at least 10 characters',
      enterFullName: 'Enter your full name',
      enterEmailAddress: 'Enter your email address',
      selectHelpType: 'Select the type of help you need',
      describeIssue: 'Describe your issue or question in detail...',
      technicalIssue: 'Technical Issue',
      accountHelp: 'Account Help',
      premiumSupport: 'Premium Support',
      billingPayments: 'Billing & Payments',
      featureRequest: 'Feature Request',
      bugReport: 'Bug Report',
      other: 'Other',
      active: 'Active',
      pending: 'Pending',
      closed: 'Closed'
    }
  };

  const chatT = (key) => translations[language]?.[key] || translations.en[key] || key;

  return (
    <>
      {triggerElement}

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CustomerServiceOutlined style={{ color: '#1890ff' }} />
            <span>{isChatMode ? chatT('supportChat') : chatT('contactSupport')}</span>
          </div>
        }
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={isChatMode ? 600 : 500}
        bodyStyle={{ padding: isChatMode ? '0' : '24px' }}
        destroyOnClose
      >
        {!isChatMode ? (
          // Initial contact form or existing chats
          <div>
            {/* Existing chats section */}
            {userChats && userChats.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <Title level={5} style={{ marginBottom: '12px' }}>
                  {chatT('previousConversations')}
                </Title>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {userChats.map((chat) => (
                    <Card
                      key={chat.id}
                      size="small"
                      hoverable
                      onClick={() => handleOpenExistingChat(chat.id)}
                      style={{ marginBottom: '8px', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text strong>{chat.subject}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {chat.lastMessage?.text?.substring(0, 50)}
                            {chat.lastMessage?.text?.length > 50 ? '...' : ''}
                          </Text>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <Badge status={getStatusColor(chat.status)} text={getStatusText(chat.status)} />
                          <br />
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            {chat.updatedAt ? new Date(chat.updatedAt).toLocaleDateString() : ''}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                <Divider />
              </div>
            )}

            {/* New chat form */}
            <Title level={5} style={{ marginBottom: '16px' }}>
              {chatT('startNewConversation')}
            </Title>
            
            {/* Offline message */}
            <Card
              size="small"
              style={{ 
                marginBottom: '20px',
                background: '#f6ffed',
                border: '1px solid #b7eb8f'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClockCircleOutlined style={{ color: '#52c41a' }} />
                <Text style={{ color: '#389e0d', fontSize: '13px' }}>
                  {offlineMessage}
                </Text>
              </div>
            </Card>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleStartChat}
              initialValues={{
                email: user?.email,
                name: `${user?.firstName} ${user?.lastName}` || user?.email
              }}
            >
              <Form.Item
                name="name"
                label={chatT('fullName')}
                rules={[{ required: true, message: chatT('pleaseEnterName') }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder={chatT('enterFullName')}
                />
              </Form.Item>

              <Form.Item
                name="email"
                label={chatT('emailForResponse')}
                rules={[
                  { required: true, message: chatT('pleaseEnterEmail') },
                  { type: 'email', message: chatT('pleaseEnterValidEmail') }
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder={chatT('enterEmailAddress')}
                />
              </Form.Item>

              <Form.Item
                name="subject"
                label={chatT('subject')}
                rules={[{ required: true, message: chatT('pleaseSelectSubject') }]}
              >
                <Select placeholder={chatT('selectHelpType')}>
                  <Option value="technical_issue">{chatT('technicalIssue')}</Option>
                  <Option value="account_help">{chatT('accountHelp')}</Option>
                  <Option value="premium_support">{chatT('premiumSupport')}</Option>
                  <Option value="billing">{chatT('billingPayments')}</Option>
                  <Option value="feature_request">{chatT('featureRequest')}</Option>
                  <Option value="bug_report">{chatT('bugReport')}</Option>
                  <Option value="other">{chatT('other')}</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="message"
                label={chatT('message')}
                rules={[
                  { required: true, message: chatT('pleaseEnterMessage') },
                  { min: 10, message: chatT('messageMinLength') }
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder={chatT('describeIssue')}
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isCreatingChat}
                  block
                  size="large"
                  icon={<MessageOutlined />}
                >
                  {chatT('startChat')}
                </Button>
              </Form.Item>
            </Form>
          </div>
        ) : (
          // Chat interface
          <div style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
            {/* Chat header */}
            {chatDetails && (
              <div style={{
                padding: '16px 24px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <Text strong>{chatDetails.subject}</Text>
                  <br />
                  <Badge 
                    status={getStatusColor(chatDetails.status)} 
                    text={getStatusText(chatDetails.status)} 
                  />
                  {chatDetails.adminName && (
                    <Text type="secondary" style={{ marginLeft: '12px', fontSize: '12px' }}>
                      {chatT('handledBy')}: {chatDetails.adminName}
                    </Text>
                  )}
                </div>
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={() => setIsChatMode(false)}
                />
              </div>
            )}

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
                        justifyContent: message.from === 'user' ? 'flex-end' : 'flex-start',
                        marginBottom: '12px'
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '70%',
                          padding: '8px 12px',
                          borderRadius: '12px',
                          background: message.from === 'user' ? '#1890ff' : 'white',
                          color: message.from === 'user' ? 'white' : '#333',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        {message.from === 'admin' && message.adminName && (
                          <Text style={{ fontSize: '11px', color: '#666' }}>
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
                <Empty description={chatT('noMessages')} />
              )}
            </div>

            {/* Message input */}
            {chatDetails?.status !== 'closed' && (
              <div style={{
                padding: '16px',
                borderTop: '1px solid #f0f0f0',
                background: 'white'
              }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={chatT('typeMessage')}
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
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default AdminChatSupport; 