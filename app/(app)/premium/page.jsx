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
import OblioInvoiceInfo from '@/components/Billing/OblioInvoiceInfo';

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

  // Format date function with localization support
  const formatDateToLocale = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const locale = language === 'ro' ? 'ro-RO' : 'en-US';
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const premiumFeatures = [
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
    {
      icon: <Iconify icon="eva:heart-fill" width="24px" style={{ color: '#eb2f96' }} />,
      title: t('premium.moreMatches'),
      description: t('premium.moreMatchesDesc'),
    },
  ];

  if (isPremium) {
    return (
      <BottomNavbarPaddingWrapper useCSS>
        <div style={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Card
            style={{
              maxWidth: 600,
              width: '100%',
              borderRadius: '20px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              border: 'none',
              background: 'white',
              margin: '0 auto'
            }}
          >
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                <CrownOutlined style={{ color: '#FFD700' }} />
              </div>
              
              <Title level={2} style={{ color: '#667eea', marginBottom: '0.5rem', fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
                {t('premium.welcomeToPremium')}
              </Title>
              
              <PremiumBadge user={user} size="large" style={{ marginBottom: '1rem' }} />
              
              <Paragraph style={{ fontSize: '16px', color: '#666', marginBottom: '2rem' }}>
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
                <Text strong style={{ fontSize: '18px', color: '#333', marginBottom: '1rem', display: 'block' }}>
                  {t('premium.yourPremiumBenefits')}
                </Text>
                
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {premiumFeatures.map((feature, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
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

              <Divider />

              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text type="secondary">
                  {t('premium.thankYouSupport')}
                </Text>
                
                <div style={{ marginTop: '1rem' }}>
                  <Button
                    type="default"
                    size="large"
                    onClick={manageSubscription}
                    loading={isCreatingPortal}
                    style={{
                      borderRadius: '8px',
                      fontWeight: '500'
                    }}
                  >
                    {t('premium.manageSubscription')}
                  </Button>
                  <div style={{ marginTop: '0.5rem' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {isCanceled 
                        ? t('premium.reactivateManageView')
                        : t('premium.cancelManageView')
                      }
                    </Text>
                  </div>
                </div>
              </Space>

              {/* Add Oblio Invoice Information for Premium Users */}
              <OblioInvoiceInfo />

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
        background: '#f5f5f5',
        padding: 'clamp(1rem, 2vw, 2rem)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Hero Section */}
          <Card
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '20px',
              marginBottom: '2rem',
              color: 'white',
              overflow: 'hidden'
            }}
            styles={{ body: { padding: 'clamp(1.5rem, 4vw, 3rem)' } }}
          >
            <Row gutter={[32, 32]} align="middle">
              <Col xs={24} md={12}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div style={{ textAlign: 'center' }}>
                    <CrownOutlined style={{ fontSize: 'clamp(32px, 8vw, 48px)', color: '#FFD700' }} />
                  </div>
                  <Title level={1} style={{ 
                    color: 'white', 
                    margin: 0, 
                    fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
                    textAlign: 'center'
                  }}>
                    Devino Premium
                  </Title>
                  <Paragraph style={{ 
                    fontSize: 'clamp(14px, 3vw, 18px)', 
                    color: 'rgba(255,255,255,0.9)',
                    textAlign: 'center',
                    margin: '1rem 0'
                  }}>
                    Pentru doar <strong>5€/lună</strong>, primești prioritate în compatibilități și multe alte beneficii exclusive!
                  </Paragraph>
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <Button
                      type="primary"
                      size="large"
                      icon={<CrownOutlined />}
                      onClick={handleUpgrade}
                      loading={loading}
                      style={{
                        background: '#FFD700',
                        borderColor: '#FFD700',
                        color: '#000',
                        fontWeight: 'bold',
                        height: 'clamp(40px, 8vw, 48px)',
                        fontSize: 'clamp(14px, 3vw, 16px)',
                        borderRadius: '24px',
                        paddingLeft: 'clamp(16px, 4vw, 32px)',
                        paddingRight: 'clamp(16px, 4vw, 32px)',
                        minWidth: '200px'
                      }}
                    >
                      Activează Premium
                    </Button>
                  </div>
                </Space>
              </Col>
              <Col xs={24} md={12}>
                <div style={{ textAlign: 'center' }}>
                  <img 
                    src="/images/comunity.jpg" 
                    alt="Premium Community" 
                    style={{ 
                      maxWidth: '100%', 
                      height: 'auto',
                      borderRadius: '16px',
                      maxHeight: '300px',
                      objectFit: 'cover',
                      filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))'
                    }} 
                  />
                </div>
              </Col>
            </Row>
          </Card>

          {/* Features Grid */}
          <Title level={2} style={{ 
            textAlign: 'center', 
            marginBottom: '2rem',
            fontSize: 'clamp(1.5rem, 4vw, 2rem)'
          }}>
            Ce primești cu Premium?
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
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%)'
            }}
            styles={{ body: { padding: 'clamp(2rem, 4vw, 3rem)' } }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Title level={3} style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)' }}>
                Gata să primești mai multe compatibilități?
              </Title>
              <Paragraph style={{ fontSize: 'clamp(14px, 3vw, 16px)' }}>
                Alătură-te comunității noastre Premium și bucură-te de toate beneficiile!
              </Paragraph>
              <Button
                type="primary"
                size="large"
                icon={<CrownOutlined />}
                onClick={handleUpgrade}
                loading={loading}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  height: 'clamp(40px, 8vw, 48px)',
                  fontSize: 'clamp(14px, 3vw, 16px)',
                  borderRadius: '24px',
                  paddingLeft: 'clamp(16px, 4vw, 32px)',
                  paddingRight: 'clamp(16px, 4vw, 32px)',
                  minWidth: '200px'
                }}
              >
                Activează Premium Acum
              </Button>
              <Text type="secondary" style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                Anulează oricând • Fără taxe ascunse • Plată securizată
              </Text>
            </Space>
          </Card>
        </div>
      </div>
    </BottomNavbarPaddingWrapper>
  );
};

export default PremiumPage; 