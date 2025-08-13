"use client";

import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Row, Col, Space, Divider, Tag, Badge, Spin, message, Alert } from 'antd';
import { CrownOutlined, CheckOutlined, StarFilled, HeartFilled, CustomerServiceOutlined, RocketFilled, WarningOutlined, CalendarOutlined, InfoCircleOutlined } from '@ant-design/icons';
import Iconify from '@/components/Iconify';
import { useLanguage } from '@/lib/i18n';
import { useUser } from '@/hooks/useFirebaseAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { PREMIUM_FEATURES_DESCRIPTIONS, isPremiumUser } from '@/utils/premiumHelpers';
import PremiumBadge from '@/components/PremiumBadge';
import { formatDate } from '@/utils/dateHelpers';
import BottomNavbarPaddingWrapper from '@/components/BottomNavbarPaddingWrapper';


const { Title, Text, Paragraph } = Typography;

const PremiumPage = () => {
  const { t, language } = useLanguage();
  const { user } = useUser();
  const { subscription, isPremium, isCanceled, startPremiumSubscription, manageSubscription, isCreatingPortal } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debug subscription data
  useEffect(() => {
    if (subscription) {
      console.log('🔍 Subscription Debug:', {
        subscription,
        isPremium,
        isCanceled,
        currentPeriodEnd: subscription.currentPeriodEnd,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
      });
    }
  }, [subscription, isPremium, isCanceled]);

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      await startPremiumSubscription(user?.email);
    } catch (error) {
      console.error('Error starting premium subscription:', error);
      message.error(t('premium.upgradeError'));
    } finally {
      setLoading(false);
    }
  };

  // Format date function with localization support and debugging
  const formatDateToLocale = (dateString) => {
    console.log('🔍 Debug formatDateToLocale:', {
      dateString,
      type: typeof dateString,
      subscription: subscription,
      currentPeriodEnd: subscription?.currentPeriodEnd
    });
    
    if (!dateString) {
      console.warn('⚠️ No dateString provided to formatDateToLocale');
      return 'N/A';
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('❌ Invalid date:', dateString);
        return 'Invalid Date';
      }
      
      const locale = language === 'ro' ? 'ro-RO' : 'en-US';
      const formatted = date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      console.log('✅ Formatted date:', formatted);
      return formatted;
    } catch (error) {
      console.error('❌ Error formatting date:', error);
      return 'Error formatting date';
    }
  };

  const premiumFeatures = [
    {
      icon: <Iconify icon="mdi:message-text" width="24px" style={{ color: '#1890ff' }} />,
      title: t('premium.unlimitedMessages'),
      description: t('premium.unlimitedMessagesDesc'),
    },
    {
      icon: <Iconify icon="mdi:check-all" width="24px" style={{ color: '#52c41a' }} />,
      title: t('premium.readReceipts'),
      description: t('premium.readReceiptsDesc'),
    },
    {
      icon: <Iconify icon="mdi:heart" width="24px" style={{ color: '#eb2f96' }} />,
      title: t('premium.superLikes'),
      description: t('premium.superLikesDesc'),
    },
    {
      icon: <Iconify icon="mdi:account-multiple" width="24px" style={{ color: '#fa8c16' }} />,
      title: t('premium.unlimitedMatches'),
      description: t('premium.unlimitedMatchesDesc'),
    },
    {
      icon: <Iconify icon="mdi:post-outline" width="24px" style={{ color: '#722ed1' }} />,
      title: t('premium.unlimitedPosts'),
      description: t('premium.unlimitedPostsDesc'),
    },
    {
      icon: <HeartFilled style={{ fontSize: '24px', color: '#ff4d4f' }} />,
      title: t('premium.priorityCompatibility'),
      description: t('premium.priorityCompatibilityDesc'),
    },
    {
      icon: <CrownOutlined style={{ fontSize: '24px', color: '#FFD700' }} />,
      title: t('premium.premiumBadgeFeature'),
      description: t('premium.premiumBadgeDesc'),
    },
    {
      icon: <RocketFilled style={{ fontSize: '24px', color: '#722ed1' }} />,
      title: t('premium.increasedVisibility'),
      description: t('premium.increasedVisibilityDesc'),
    },
    {
      icon: <CustomerServiceOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
      title: t('premium.prioritySupport'),
      description: t('premium.prioritySupportDesc'),
    },
    {
      icon: <StarFilled style={{ fontSize: '24px', color: '#faad14' }} />,
      title: t('premium.exclusiveFeatures'),
      description: t('premium.exclusiveFeaturesDesc'),
    },
  ];

  if (isPremium) {
    return (
      <BottomNavbarPaddingWrapper useCSS>
        <div style={{ 
          minHeight: '100vh',
          background: '#fafafa',
          padding: 'clamp(1rem, 2vw, 2rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Card
            style={{
              maxWidth: 700,
              width: '100%',
              borderRadius: '24px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
              border: '1px solid #f0f0f0',
              background: 'white',
              margin: '0 auto'
            }}
          >
            <div style={{ textAlign: 'center', padding: 'clamp(2rem, 4vw, 3rem)' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 100,
                height: 100,
                borderRadius: 25,
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA940 100%)',
                marginBottom: '1.5rem'
              }}>
                <CrownOutlined style={{ fontSize: '48px', color: '#000' }} />
              </div>
              
              <Title level={2} style={{ 
                color: '#262626', 
                marginBottom: '0.5rem', 
                fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
                fontWeight: 700
              }}>
                {t('premium.welcomeToPremium')}
              </Title>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <PremiumBadge user={user} size="large" />
              </div>
              
              <Paragraph style={{ 
                fontSize: 'clamp(15px, 3vw, 18px)', 
                color: '#595959', 
                marginBottom: '2rem',
                fontWeight: 500
              }}>
                {t('premium.subscriptionActivated')}
              </Paragraph>

              {/* Subscription Status Information */}
              {subscription && (
                <Card
                  size="small"
                  style={{
                    marginBottom: '2rem',
                    borderRadius: '12px',
                    backgroundColor: isCanceled ? '#fff7e6' : '#f6ffed',
                    borderColor: isCanceled ? '#ffd666' : '#b7eb8f'
                  }}
                >
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong style={{ fontSize: '16px' }}>
                        <CalendarOutlined /> {t('premium.subscriptionStatus')}
                      </Text>
                      <Tag color={isCanceled ? 'orange' : 'green'}>
                        {isCanceled ? t('premium.canceled') : t('premium.active')}
                      </Tag>
                    </div>
                    
                    {isCanceled ? (
                      <Alert
                        type="warning"
                        showIcon
                        icon={<WarningOutlined />}
                        message={t('premium.subscriptionCanceled')}
                        description={
                          <div>
                            <Text>{t('premium.subscriptionWillEndOn')}</Text>
                            <br />
                            <Text strong style={{ fontSize: '16px', color: '#d46b08' }}>
                              {formatDateToLocale(subscription.currentPeriodEnd)}
                            </Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: '14px' }}>
                              {t('premium.willHaveAccessUntil')}
                            </Text>
                          </div>
                        }
                        style={{ marginTop: '12px' }}
                      />
                    ) : (
                      <Alert
                        type="info"
                        showIcon
                        icon={<InfoCircleOutlined />}
                        message={t('premium.nextPayment')}
                        description={
                          <div>
                            <Text>{t('premium.subscriptionRenewsOn')}</Text>
                            <br />
                            <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                              {formatDateToLocale(subscription.currentPeriodEnd)}
                            </Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: '14px' }}>
                              {t('premium.monthlyCost')}
                            </Text>
                          </div>
                        }
                        style={{ marginTop: '12px' }}
                      />
                    )}
                  </Space>
                </Card>
              )}

              <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
                <Text strong style={{ 
                  fontSize: '20px', 
                  color: '#262626', 
                  marginBottom: '1.5rem', 
                  display: 'block',
                  fontWeight: 600
                }}>
                  {t('premium.yourPremiumBenefits')}
                </Text>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                  gap: '16px',
                  marginBottom: '1rem'
                }}>
                  {premiumFeatures.slice(0, 6).map((feature, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: '#fafafa',
                      border: '1px solid #f0f0f0'
                    }}>
                      {feature.icon}
                      <div>
                        <Text strong style={{ color: '#262626', fontSize: '14px' }}>
                          {feature.title}
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                background: '#f8f9fa',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center'
              }}>
                <Text style={{ 
                  fontSize: '16px', 
                  color: '#595959', 
                  marginBottom: '1.5rem',
                  display: 'block'
                }}>
                  {t('premium.thankYouSupport')}
                </Text>
                
                <Button
                  type="default"
                  size="large"
                  onClick={manageSubscription}
                  loading={isCreatingPortal}
                  style={{
                    borderRadius: '12px',
                    fontWeight: 600,
                    height: '48px',
                    paddingLeft: '24px',
                    paddingRight: '24px',
                    border: '1px solid #d9d9d9'
                  }}
                >
                  {t('premium.manageSubscription')}
                </Button>
                <div style={{ marginTop: '12px' }}>
                  <Text type="secondary" style={{ fontSize: '13px' }}>
                    {isCanceled 
                      ? t('premium.reactivateManageView')
                      : t('premium.cancelManageView')
                    }
                  </Text>
                </div>
              </div>

            </div>
          </Card>
        </div>
      </BottomNavbarPaddingWrapper>
    );
  }

  return (
    <BottomNavbarPaddingWrapper useCSS>
      <div style={{ 
        minHeight: '100vh',
        background: '#fafafa',
        padding: 'clamp(1rem, 2vw, 2rem)'
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          {/* Hero Section */}
          <Card
            style={{
              background: 'white',
              border: '1px solid #f0f0f0',
              borderRadius: '24px',
              marginBottom: '2rem',
              boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
              overflow: 'hidden'
            }}
            styles={{ body: { padding: 'clamp(2rem, 4vw, 3rem)' } }}
          >
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                borderRadius: 20,
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA940 100%)',
                marginBottom: '1.5rem'
              }}>
                <CrownOutlined style={{ fontSize: '36px', color: '#000' }} />
              </div>
              <Title level={1} style={{ 
                color: '#262626', 
                margin: 0, 
                fontSize: 'clamp(2rem, 5vw, 2.75rem)',
                fontWeight: 700,
                marginBottom: '0.5rem'
              }}>
                {t('premium.becomePremium')}
              </Title>
              <Paragraph style={{ 
                fontSize: 'clamp(16px, 3vw, 20px)', 
                color: '#8c8c8c',
                margin: 0,
                fontWeight: 500
              }}>
                {t('premium.monthlyPrice')}
              </Paragraph>
            </div>

            <Row gutter={[32, 32]} align="middle">
              <Col xs={24} md={14}>
                <div style={{ textAlign: 'center' }}>
                  <img 
                    src="/images/comunity.jpg" 
                    alt="Premium Community" 
                    style={{ 
                      maxWidth: '100%', 
                      height: 'auto',
                      borderRadius: '20px',
                      maxHeight: '280px',
                      objectFit: 'cover',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                    }} 
                  />
                </div>
              </Col>
              <Col xs={24} md={10}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div style={{ textAlign: 'center' }}>
                    <Button
                      type="primary"
                      size="large"
                      icon={<CrownOutlined />}
                      onClick={handleUpgrade}
                      loading={loading}
                      style={{
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA940 100%)',
                        border: 'none',
                        color: '#000',
                        fontWeight: 700,
                        height: 56,
                        fontSize: 16,
                        borderRadius: '16px',
                        paddingLeft: 32,
                        paddingRight: 32,
                        minWidth: '220px',
                        boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)'
                      }}
                    >
                        {t('premium.activatePremium')}
                    </Button>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <Text style={{ color: '#8c8c8c', fontSize: 14 }}>
                      {t('premium.cancelAnytime')}
                    </Text>
                  </div>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Features Grid */}
          <Title level={2} style={{ 
            textAlign: 'center', 
            marginBottom: '2rem',
            fontSize: 'clamp(1.5rem, 4vw, 2rem)'
          }}>
            {t('premium.whatYouGetWithPremium')}
          </Title>
          
          <Row gutter={[24, 24]} justify="center">
            {premiumFeatures.map((feature, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card
                  hoverable
                  style={{
                    height: '100%',
                    borderRadius: '16px',
                    border: '1px solid #f0f0f0',
                    transition: 'all 0.3s'
                  }}
                  styles={{ body: { padding: 'clamp(16px, 3vw, 24px)' } }}
                >
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ textAlign: 'center' }}>
                      {feature.icon}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Title level={4} style={{ 
                        marginBottom: '8px',
                        fontSize: 'clamp(1rem, 3vw, 1.25rem)'
                      }}>
                        {feature.title}
                      </Title>
                      <Text type="secondary" style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                        {feature.description}
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>

          {/* CTA Section */}
          <Card
            style={{
              marginTop: '3rem',
              textAlign: 'center',
              borderRadius: '20px',
              background: 'white',
              border: '1px solid #f0f0f0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
            }}
            styles={{ body: { padding: 'clamp(2rem, 4vw, 2.5rem)' } }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Title level={3} style={{ 
                fontSize: 'clamp(1.5rem, 4vw, 1.75rem)',
                color: '#262626',
                fontWeight: 600
              }}>
                {t('premium.readyForMoreCompatibility')}
              </Title>
              <Paragraph style={{ 
                fontSize: 'clamp(15px, 3vw, 16px)',
                color: '#595959'
              }}>
                {t('premium.joinPremiumCommunity')}
              </Paragraph>
              <Button
                type="primary"
                size="large"
                icon={<CrownOutlined />}
                onClick={handleUpgrade}
                loading={loading}
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA940 100%)',
                  border: 'none',
                  height: 52,
                  fontSize: 16,
                  borderRadius: '16px',
                  paddingLeft: 28,
                  paddingRight: 28,
                  minWidth: '200px',
                  fontWeight: 700,
                  boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
                }}
              >
                {t('premium.activatePremiumNow')}
              </Button>
              <Text type="secondary" style={{ fontSize: 14 }}>
                {t('premium.cancelAnytime')}
              </Text>
            </Space>
          </Card>
        </div>
      </div>
    </BottomNavbarPaddingWrapper>
  );
};

export default PremiumPage; 