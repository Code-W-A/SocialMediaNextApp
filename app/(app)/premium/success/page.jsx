"use client";

import React, { useEffect } from 'react';
import { Card, Button, Typography, Space, Result } from 'antd';
import { CrownOutlined, CheckCircleOutlined, HeartFilled, RocketFilled, CustomerServiceOutlined, StarFilled } from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSubscription } from '@/hooks/useSubscription';
import BottomNavbarPaddingWrapper from '@/components/BottomNavbarPaddingWrapper';
import Iconify from '@/components/Iconify';
import { useLanguage } from '@/lib/i18n';

const { Title, Text, Paragraph } = Typography;

const PremiumSuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { refreshSubscription } = useSubscription();
  const { t } = useLanguage();

  // Premium features - SYNCHRONIZED WITH /premium PAGE - LOCALIZED
  const premiumFeatures = [
    {
      icon: <Iconify icon="mdi:message-text" width="20px" style={{ color: '#1890ff' }} />,
      title: t('premium.unlimitedMessages'),
      description: t('premium.unlimitedMessagesDesc'),
    },
    {
      icon: <Iconify icon="mdi:check-all" width="20px" style={{ color: '#52c41a' }} />,
      title: t('premium.readReceipts'),
      description: t('premium.readReceiptsDesc'),
    },
    {
      icon: <Iconify icon="mdi:heart" width="20px" style={{ color: '#eb2f96' }} />,
      title: t('premium.superLikes'),
      description: t('premium.superLikesDesc'),
    },
    {
      icon: <Iconify icon="mdi:account-multiple" width="20px" style={{ color: '#fa8c16' }} />,
      title: t('premium.unlimitedMatches'),
      description: t('premium.unlimitedMatchesDesc'),
    },
    {
      icon: <Iconify icon="mdi:post-outline" width="20px" style={{ color: '#722ed1' }} />,
      title: t('premium.unlimitedPosts'),
      description: t('premium.unlimitedPostsDesc'),
    },
    {
      icon: <HeartFilled style={{ fontSize: '20px', color: '#ff4d4f' }} />,
      title: t('premium.priorityCompatibility'),
      description: t('premium.priorityCompatibilityDesc'),
    },
    {
      icon: <CrownOutlined style={{ fontSize: '20px', color: '#FFD700' }} />,
      title: t('premium.premiumBadgeFeature'),
      description: t('premium.premiumBadgeDesc'),
    },
    {
      icon: <RocketFilled style={{ fontSize: '20px', color: '#722ed1' }} />,
      title: t('premium.increasedVisibility'),
      description: t('premium.increasedVisibilityDesc'),
    },
    {
      icon: <CustomerServiceOutlined style={{ fontSize: '20px', color: '#52c41a' }} />,
      title: t('premium.prioritySupport'),
      description: t('premium.prioritySupportDesc'),
    },
    {
      icon: <StarFilled style={{ fontSize: '20px', color: '#faad14' }} />,
      title: t('premium.exclusiveFeatures'),
      description: t('premium.exclusiveFeaturesDesc'),
    },
  ];

  useEffect(() => {
    // Refresh subscription data after successful payment
    if (sessionId) {
      setTimeout(() => {
        refreshSubscription();
      }, 2000); // Give webhook time to process
    }
  }, [sessionId, refreshSubscription]);

  return (
    <BottomNavbarPaddingWrapper useCSS>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '24px',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
      <Card style={{ width: '100%', textAlign: 'center' }}>
        <Result
          icon={
            <div style={{ marginBottom: '24px' }}>
              <CrownOutlined 
                style={{ 
                  fontSize: '72px', 
                  color: '#FFD700',
                  marginBottom: '16px'
                }} 
              />
              <CheckCircleOutlined 
                style={{ 
                  fontSize: '48px', 
                  color: '#52c41a',
                  position: 'absolute',
                  marginLeft: '-20px',
                  marginTop: '40px'
                }} 
              />
            </div>
          }
          title={
            <Title level={2} style={{ color: '#f093fb', margin: '0 0 16px 0' }}>
              {t('premium.welcomeToPremium')}
            </Title>
          }
          subTitle={
            <div>
              <Paragraph style={{ fontSize: '18px', color: '#666', marginBottom: '24px' }}>
                {t('premium.subscriptionActivated')}
              </Paragraph>
              
              <div style={{ 
                background: 'linear-gradient(135deg, #f093fb15, #f5576c15)',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #f093fb30',
                marginBottom: '24px'
              }}>
                <Title level={4} style={{ color: '#f093fb', marginBottom: '16px' }}>
                  {t('premium.yourPremiumBenefits')}
                </Title>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {premiumFeatures.map((feature, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', textAlign: 'left' }}>
                      {feature.icon}
                      <div>
                        <Text strong style={{ color: '#333' }}>{feature.title}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '14px' }}>
                          {feature.description}
                        </Text>
                      </div>
                    </div>
                  ))}
                </Space>
              </div>
            </div>
          }
          extra={
            <div style={{ width: '100%' }}>
              {/* Desktop: horizontal, Mobile: vertical */}
              <Space 
                size="large" 
                direction="horizontal"
                style={{ 
                  width: '100%',
                  justifyContent: 'center',
                  '@media (max-width: 768px)': {
                    flexDirection: 'column'
                  }
                }}
                className="success-buttons"
              >
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => router.push('/matches')}
                  style={{
                    background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                    border: 'none',
                    height: '48px',
                    padding: '0 32px',
                    minWidth: '200px'
                  }}
                >
                  {t('premium.exploreMatches')}
                </Button>
                <Button 
                  size="large"
                  onClick={() => router.push('/home')}
                  style={{ 
                    height: '48px', 
                    padding: '0 32px',
                    minWidth: '200px'
                  }}
                >
                  {t('premium.backToFeed')}
                </Button>
              </Space>
              
              {/* Mobile CSS */}
              <style jsx>{`
                @media (max-width: 768px) {
                  .success-buttons :global(.ant-space) {
                    flex-direction: column !important;
                    width: 100% !important;
                  }
                  
                  .success-buttons :global(.ant-space-item) {
                    width: 100% !important;
                  }
                  
                  .success-buttons :global(.ant-btn) {
                    width: 100% !important;
                    margin-bottom: 12px !important;
                  }
                }
              `}</style>
            </div>
          }
        />
        
        <div style={{ 
          marginTop: '32px',
          padding: '16px',
          background: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <Text type="secondary">
            <Iconify icon="eva:info-fill" width="16px" style={{ marginRight: '8px' }} />
            {t('premium.emailConfirmation')}
          </Text>
        </div>
      </Card>
      </div>
    </BottomNavbarPaddingWrapper>
  );
};

export default PremiumSuccessPage; 