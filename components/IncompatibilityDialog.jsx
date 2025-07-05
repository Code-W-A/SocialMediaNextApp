"use client";
import React from 'react';
import { Modal, Button, Typography, Space, Avatar } from 'antd';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { getMainProfileImage } from '@/utils/imageHelpers';
import { getDisplayName } from '@/utils/profileHelpers';
import Iconify from './Iconify';

const { Title, Text, Paragraph } = Typography;

const IncompatibilityDialog = ({ 
  visible, 
  onClose, 
  userProfileData, 
  currentUser 
}) => {
  const { t } = useLanguage();
  const router = useRouter();

  const handleGoToMatches = () => {
    onClose();
    router.push('/matches');
  };

  const handleGoToHome = () => {
    onClose();
    router.push('/home');
  };

  const userDisplayName = getDisplayName(userProfileData?.data);
  const userProfileImage = getMainProfileImage(userProfileData?.data?.images);

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
      centered
      closable={false}
      style={{
        borderRadius: '16px',
        overflow: 'hidden'
      }}
      bodyStyle={{
        padding: 0
      }}
      styles={{
        mask: {
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.6)'
        }
      }}
    >
      {/* Header with gradient background */}
      <div style={{
        background: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)',
        padding: '32px 24px',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '50%',
          width: '80px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <Iconify icon="ph:heart-break-fill" width="40px" color="white" />
        </div>
        <Title level={3} style={{ color: 'white', margin: '0 0 8px 0' }}>
          {t('compatibility.notCompatibleTitle')}
        </Title>
        <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px' }}>
          {t('compatibility.notCompatibleSubtitle')}
        </Text>
      </div>

      {/* Content */}
      <div style={{ padding: '24px' }}>
        {/* User info */}
        <div style={{
          background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Avatar 
              size={64} 
              src={userProfileImage}
              style={{ 
                border: '3px solid #fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              {userDisplayName?.[0]}
            </Avatar>
            <Title level={4} style={{ margin: '8px 0 4px 0' }}>
              {userDisplayName}
            </Title>
            <Text type="secondary">
              {t('compatibility.profileNotAccessible')}
            </Text>
          </Space>
        </div>

        {/* Explanation */}
        <div style={{ marginBottom: '24px' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                background: '#ff6b6b15',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '4px'
              }}>
                <Iconify icon="ph:lock-fill" width="16px" style={{ color: '#ff6b6b' }} />
              </div>
              <div>
                <Text strong style={{ display: 'block', marginBottom: '4px' }}>
                  {t('compatibility.whyRestricted')}
                </Text>
                <Text type="secondary" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  {t('compatibility.restrictionExplanation')}
                </Text>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                background: '#52c41a15',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '4px'
              }}>
                <Iconify icon="ph:sparkle-fill" width="16px" style={{ color: '#52c41a' }} />
              </div>
              <div>
                <Text strong style={{ display: 'block', marginBottom: '4px' }}>
                  {t('compatibility.howToGetCompatible')}
                </Text>
                <Text type="secondary" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  {t('compatibility.compatibilityProcess')}
                </Text>
              </div>
            </div>
          </Space>
        </div>

        {/* Action buttons */}
        <Space style={{ width: '100%', justifyContent: 'center' }} size="middle">
          <Button 
            type="primary"
            size="large"
            onClick={handleGoToMatches}
            style={{
              background: 'linear-gradient(135deg, var(--primary), #FFB84D)',
              border: 'none',
              borderRadius: '8px',
              height: '44px',
              padding: '0 24px'
            }}
          >
            <Space align="center">
              <Iconify icon="ph:heart-fill" width="16px" />
              {t('compatibility.viewMatches')}
            </Space>
          </Button>
          
          <Button 
            size="large"
            onClick={handleGoToHome}
            style={{
              borderRadius: '8px',
              height: '44px',
              padding: '0 24px'
            }}
          >
            <Space align="center">
              <Iconify icon="ph:house-fill" width="16px" />
              {t('compatibility.backToHome')}
            </Space>
          </Button>
        </Space>

        {/* Footer note */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          padding: '16px',
          background: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <Iconify icon="ph:info-fill" width="14px" style={{ marginRight: '4px' }} />
            {t('compatibility.footerNote')}
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default IncompatibilityDialog; 