"use client";
import React, { useState, useEffect } from 'react';
import { Badge, Dropdown, List, Typography, Empty, Button } from 'antd';
import Iconify from './Iconify';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/hooks/useNotifications';
import { useLanguage } from '@/lib/i18n';
import { getMainProfileImage } from '@/utils/imageHelpers';
import { getUserDisplayName } from '@/utils/profileHelpers';
import css from '@/styles/notifications.module.css';

const NotificationIcon = ({ user, isMobile = false }) => {
  const router = useRouter();
  const { t } = useLanguage();
  const { 
    unreadMessagesCount, 
    newCompatibilitiesCount,
    unreadMessages,
    newCompatibilities,
    markCompatibilitiesAsSeen 
  } = useNotifications(user);
  const [isOpen, setIsOpen] = useState(false);

  // Calculate total notifications
  const totalNotifications = (unreadMessagesCount || 0) + (newCompatibilitiesCount || 0);

  // Create notifications list with personalized details
  const notifications = [];
  
  // Add message notifications - one for each person
  if (unreadMessages && unreadMessages.length > 0) {
    unreadMessages.forEach(conversation => {
      if (conversation.otherUser) {
        const userName = getUserDisplayName(conversation.otherUser);
        notifications.push({
          id: `message-${conversation.id}`,
          type: 'message',
          title: `${t('notifications.newMessageFrom')} ${userName}`,
          description: conversation.unreadCount > 1 ? 
            `${conversation.unreadCount} ${t('messages.newMessage')}s` : 
            `1 ${t('messages.newMessage')}`,
          icon: 'eva:message-circle-fill',
          color: 'var(--primary)',
          avatar: getMainProfileImage(conversation.otherUser.images),
          user: conversation.otherUser,
          onClick: () => {
            setIsOpen(false);
            router.push('/messages');
          }
        });
      }
    });
  }

  // Add compatibility notifications - one for each person  
  if (newCompatibilities && newCompatibilities.length > 0) {
    newCompatibilities.forEach(compatibility => {
      const userName = getUserDisplayName(compatibility);
      notifications.push({
        id: `compatibility-${compatibility.id}`,
        type: 'match',
        title: `${t('notifications.newCompatibilityWith')} ${userName}`,
        description: t('matches.newCompatibilityFound'),
        icon: 'eva:heart-fill',
        color: '#ff4d4f',
        avatar: getMainProfileImage(compatibility.images),
        user: compatibility,
        onClick: () => {
          markCompatibilitiesAsSeen();
          setIsOpen(false);
          router.push('/matches');
        }
      });
    });
  }

  // Handle dropdown visibility
  const handleOpenChange = (open) => {
    setIsOpen(open);
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    notification.onClick();
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    markCompatibilitiesAsSeen();
    setIsOpen(false);
  };

  // Create dropdown items for Ant Design Dropdown
  const dropdownItems = [
    {
      key: 'notifications-container',
      label: (
        <div style={{ 
          width: isMobile ? '280px' : '350px', 
          maxHeight: '400px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ 
            padding: '12px 16px', 
            borderBottom: '1px solid #f0f0f0',
            background: '#fafafa'
          }}>
            <Typography.Text strong style={{ fontSize: '16px' }}>
              🔔 {t('common.notifications')}
            </Typography.Text>
          </div>
          
          {/* Content */}
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '20px' }}>
                <Empty 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <Typography.Text type="secondary">
                      {t('notifications.noNewNotifications')}
                    </Typography.Text>
                  }
                />
              </div>
            ) : (
              <List
                size="small"
                dataSource={notifications}
                renderItem={(notification) => (
                                    <List.Item
                    style={{ 
                      cursor: 'pointer',
                      padding: '12px 16px',
                      borderBottom: '1px solid #f5f5f5',
                      margin: 0
                    }}
                    className={css.notificationItem}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <List.Item.Meta
                      avatar={
                        notification.avatar ? (
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: `2px solid ${notification.color}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <img 
                              src={notification.avatar} 
                              alt={notification.title}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          </div>
                        ) : (
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: `${notification.color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Iconify 
                              icon={notification.icon} 
                              width="20px" 
                              style={{ color: notification.color }}
                            />
                          </div>
                        )
                      }
                      title={
                        <Typography.Text strong style={{ fontSize: '14px' }}>
                          {notification.title}
                        </Typography.Text>
                      }
                      description={
                        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                          {notification.description}
                        </Typography.Text>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </div>
          
        </div>
      ),
      disabled: true // Prevent menu item click behavior
    }
  ];

  return (
    <Dropdown
      menu={{ items: dropdownItems }}
      open={isOpen}
      onOpenChange={handleOpenChange}
      placement="bottomRight"
      trigger={['click']}
      overlayClassName={css.notificationDropdown}
      overlayStyle={{
        zIndex: 9999
      }}
    >
      <div
        style={{
          cursor: 'pointer',
          padding: isMobile ? '6px' : '8px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          minWidth: isMobile ? '32px' : '36px',
          height: isMobile ? '32px' : '36px',
          background: isOpen ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transform: isOpen ? 'scale(1.05)' : 'scale(1)'
        }}
      >
        <Badge 
          count={totalNotifications} 
          showZero={false}
          overflowCount={99}
          size="small"
          style={{
            zIndex: 1,
          }}
        >
          <Iconify 
            icon="eva:bell-fill" 
            width={isMobile ? "18px" : "20px"} 
            style={{ 
              color: totalNotifications > 0 ? 'var(--primary)' : '#666'
            }}
          />
        </Badge>
      </div>
    </Dropdown>
  );
};

export default NotificationIcon; 