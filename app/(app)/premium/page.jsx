"use client";

import React, { useState } from 'react';
import { Card, Button, Typography, Row, Col, Space, Divider, Tag, Badge, Spin, message } from 'antd';
import { CrownOutlined, CheckOutlined, StarFilled, HeartFilled, ShieldFilled, RocketFilled } from '@ant-design/icons';
import Iconify from '@/components/Iconify';
import { useLanguage } from '@/lib/i18n';
import { useUser } from '@/hooks/useFirebaseAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { PREMIUM_FEATURES_DESCRIPTIONS, isPremiumUser } from '@/utils/premiumHelpers';
import PremiumBadge from '@/components/PremiumBadge';

const { Title, Text, Paragraph } = Typography;

const PremiumPage = () => {
  const { t } = useLanguage();
  const { user } = useUser();
  const { subscription, isPremium, startPremiumSubscription } = useSubscription();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      await startPremiumSubscription(user?.email);
    } catch (error) {
      console.error('Error starting premium subscription:', error);
      message.error('A apărut o eroare. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  const premiumFeatures = [
    {
      icon: <HeartFilled style={{ fontSize: '24px', color: '#ff4d4f' }} />,
      title: 'Prioritate în Compatibilități',
      description: 'Primești mai multe compatibilități și apari primul în listele celorlalți utilizatori',
    },
    {
      icon: <CrownOutlined style={{ fontSize: '24px', color: '#FFD700' }} />,
      title: 'Insignă Premium',
      description: 'Profilul tău va avea o insignă specială care arată că ești un utilizator premium',
    },
    {
      icon: <RocketFilled style={{ fontSize: '24px', color: '#722ed1' }} />,
      title: 'Vizibilitate Crescută',
      description: 'Profilul tău va fi evidențiat și va apărea mai sus în căutări și liste',
    },
    {
      icon: <ShieldFilled style={{ fontSize: '24px', color: '#52c41a' }} />,
      title: 'Suport Prioritar',
      description: 'Acces la suport dedicat cu răspuns rapid la întrebările tale',
    },
    {
      icon: <StarFilled style={{ fontSize: '24px', color: '#faad14' }} />,
      title: 'Funcții Exclusive',
      description: 'Acces timpuriu la funcții noi și experimentale înainte de ceilalți',
    },
    {
      icon: <Iconify icon="eva:heart-fill" width="24px" style={{ color: '#eb2f96' }} />,
      title: 'Mai Multe Potriviri',
      description: 'Algoritmul nostru îți va oferi mai multe compatibilități relevante',
    },
  ];

  if (isPremium) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
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
            background: 'white'
          }}
        >
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
              <CrownOutlined style={{ color: '#FFD700' }} />
            </div>
            
            <Title level={2} style={{ color: '#667eea', marginBottom: '0.5rem' }}>
              Bine ai venit în Premium!
            </Title>
            
            <PremiumBadge user={user} size="large" style={{ marginBottom: '1rem' }} />
            
            <Paragraph style={{ fontSize: '16px', color: '#666', marginBottom: '2rem' }}>
              Abonamentul tău Premium este activ. Bucură-te de toate beneficiile!
            </Paragraph>

            <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <Text strong style={{ fontSize: '18px', color: '#333', marginBottom: '1rem', display: 'block' }}>
                Beneficiile tale Premium:
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
                Mulțumim că susții platforma noastră!
              </Text>
              {subscription?.currentPeriodEnd && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Următoarea facturare: {new Date(subscription.currentPeriodEnd).toLocaleDateString('ro-RO')}
                </Text>
              )}
            </Space>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#f5f5f5',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Hero Section */}
        <Card
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '20px',
            marginBottom: '2rem',
            color: 'white'
          }}
          bodyStyle={{ padding: '3rem' }}
        >
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} md={12}>
              <Space direction="vertical" size="large">
                <div>
                  <CrownOutlined style={{ fontSize: '48px', color: '#FFD700' }} />
                </div>
                <Title level={1} style={{ color: 'white', margin: 0 }}>
                  Devino Premium
                </Title>
                <Paragraph style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)' }}>
                  Pentru doar <strong>5€/lună</strong>, primești prioritate în compatibilități și multe alte beneficii exclusive!
                </Paragraph>
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
                    height: '48px',
                    fontSize: '16px',
                    borderRadius: '24px',
                    paddingLeft: '32px',
                    paddingRight: '32px'
                  }}
                >
                  Activează Premium
                </Button>
              </Space>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ textAlign: 'center' }}>
                <img 
                  src="/premium-hero.svg" 
                  alt="Premium" 
                  style={{ 
                    maxWidth: '100%', 
                    height: 'auto',
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))'
                  }} 
                />
              </div>
            </Col>
          </Row>
        </Card>

        {/* Features Grid */}
        <Title level={2} style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Ce primești cu Premium?
        </Title>
        
        <Row gutter={[24, 24]}>
          {premiumFeatures.map((feature, index) => (
            <Col xs={24} sm={12} md={8} key={index}>
              <Card
                hoverable
                style={{
                  height: '100%',
                  borderRadius: '16px',
                  border: '1px solid #f0f0f0',
                  transition: 'all 0.3s'
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div style={{ textAlign: 'center' }}>
                    {feature.icon}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <Title level={4} style={{ marginBottom: '8px' }}>
                      {feature.title}
                    </Title>
                    <Text type="secondary">
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
          bodyStyle={{ padding: '3rem' }}
        >
          <Space direction="vertical" size="large">
            <Title level={3}>
              Gata să primești mai multe compatibilități?
            </Title>
            <Paragraph style={{ fontSize: '16px' }}>
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
                height: '48px',
                fontSize: '16px',
                borderRadius: '24px',
                paddingLeft: '32px',
                paddingRight: '32px'
              }}
            >
              Activează Premium Acum
            </Button>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              Anulează oricând • Fără taxe ascunse • Plată securizată
            </Text>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default PremiumPage; 