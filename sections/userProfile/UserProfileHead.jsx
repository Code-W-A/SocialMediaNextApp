"use client";
import React, { useState } from "react";
import css from "@/styles/UserProfileHead.module.css";
import { Button, Image, Skeleton, Typography, Space, Modal, message, Avatar } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createConversation } from "@/actions/chat";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import Iconify from "@/components/Iconify";
import { getMainProfileImage } from "@/utils/imageHelpers";
import OnlineStatusIndicator, { OnlineStatusAvatar } from "@/components/OnlineStatusIndicator";

const { Text, Title } = Typography;

const UserProfileHead = ({
  userData,
  currentUser,
  isLoading,
  userId,
  getDisplayName,
  getUsername,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const { t } = useLanguage();

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: ({ user1Id, user2Id }) => createConversation({ user1Id, user2Id }),
    onSuccess: (result) => {
      if (result.success) {
        message.success(t('userProfile.conversationStartedSuccess'));
        router.push(`/messages?conversation=${result.conversationId}`);
      }
    },
    onError: (error) => {
      console.error("Error starting conversation:", error);
      message.error(t('userProfile.conversationStartFailed'));
    }
  });

  const getProfileImage = () => {
    if (!userData?.data) return "/images/placeholder-avatar.png";
    return getMainProfileImage(userData.data.images) || 
           userData.data.image_url || 
           "/images/placeholder-avatar.png";
  };

  const handleStartConversation = () => {
    if (!currentUser?.id || !userId) {
      message.error(t('userProfile.unableToStartConversation'));
      return;
    }

    createConversationMutation.mutate({
      user1Id: currentUser.id,
      user2Id: userId
    });
  };

  const handleViewImages = () => {
    // Could implement image gallery modal here
    message.info(t('userProfile.imageGalleryComingSoon'));
  };

  if (isLoading) {
    return (
      <div className={css.wrapper}>
        <div className={css.container}>
          <div className={css.bannerSection}>
            <Skeleton.Image 
              style={{ 
                width: '100%', 
                height: '200px',
                borderRadius: '12px 12px 0 0'
              }} 
            />
          </div>
          <div className={css.footer}>
            <div className={css.profileContainer}>
              <div className={css.profileImage}>
                <Skeleton.Avatar size={120} />
              </div>
              <div className={css.profileInfo}>
                <Skeleton active paragraph={{ rows: 2 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const user = userData?.data;
  

  
  if (!user) return null;

  const displayName = getDisplayName ? getDisplayName(userData) : 
    (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 
     user.username || user.email?.split('@')[0] || t('userProfile.unknownUser'));

  const username = getUsername ? getUsername(userData) : 
    (user.username || user.email?.split('@')[0] || '');

  return (
    <div className={css.wrapper}>
      <div className={css.container}>
        {/* Banner Section */}
        <div className={css.bannerSection}>
          <div className={css.bannerImage}>
            <Image
              src={user.banner_url || "https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"}
              alt={t('userProfile.profileBanner')}
              preview={false}
              fallback="https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover',
                borderRadius: '12px 12px 0 0'
              }}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
              }}
            />
          </div>
          
          {/* Action buttons overlay */}
          <div className={css.actionsOverlay}>
            <Space>
              <Button
                type="primary"
                size="large"
                icon={<Iconify icon="eva:message-circle-fill" width="20px" />}
                onClick={handleStartConversation}
                loading={createConversationMutation.isPending}
                style={{
                  background: 'linear-gradient(135deg, var(--primary), #FFB84D)',
                  border: 'none',
                  borderRadius: '12px',
                  height: '44px',
                  padding: '0 20px'
                }}
              >
                {t('userProfile.messageButton')}
              </Button>
              
              {user.images && user.images.length > 1 && (
                <Button
                  size="large"
                  icon={<Iconify icon="eva:image-fill" width="20px" />}
                  onClick={handleViewImages}
                  style={{
                    borderRadius: '12px',
                    height: '44px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {t('userProfile.photos', { count: user.images.length })}
                </Button>
              )}
            </Space>
          </div>
        </div>

        {/* Profile Footer */}
        <div className={css.footer}>
          <div className={css.profileContainer}>
            <div className={css.profileImage}>
              <OnlineStatusAvatar userId={userId} size="large">
                <Avatar
                  src={getProfileImage()}
                  alt="profile"
                  size={120}
                >
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </Avatar>
              </OnlineStatusAvatar>
            </div>
            
            <div className={css.profileInfo}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '8px' }}>
                <Title level={3} className={css.displayName} style={{ margin: 0 }}>
                  {displayName}
                </Title>
                {user.verified && (
                  <div style={{
                    background: 'linear-gradient(135deg, #1890ff, #40a9ff)',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Iconify icon="eva:checkmark-fill" width="14px" style={{ color: 'white' }} />
                  </div>
                )}
              </div>
              
              <Text type="secondary" className={css.username}>
                @{username}
              </Text>
              
              <div style={{ marginTop: '8px' }}>
                <OnlineStatusIndicator userId={userId} showText={true} />
              </div>
              
              {user.bio && (
                <Text className={css.bio} style={{ 
                  display: 'block', 
                  marginTop: '12px',
                  maxWidth: '400px',
                  lineHeight: '1.5'
                }}>
                  {user.bio}
                </Text>
              )}

              {/* Quick Info */}
              <div style={{ 
                display: 'flex', 
                gap: '16px', 
                marginTop: '12px',
                flexWrap: 'wrap'
              }}>
                {user.age && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Iconify icon="eva:calendar-fill" width="16px" style={{ color: '#999' }} />
                    <Text type="secondary">{user.age} {t('userProfile.yearsOld')}</Text>
                  </div>
                )}
                
                {user.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Iconify icon="eva:pin-fill" width="16px" style={{ color: '#999' }} />
                    <Text type="secondary">{user.location}</Text>
                  </div>
                )}
                
                {user.relationshipStatus && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Iconify icon="eva:heart-fill" width="16px" style={{ color: '#999' }} />
                    <Text type="secondary">{user.relationshipStatus}</Text>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileHead; 