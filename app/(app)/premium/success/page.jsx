"use client";

import React, { useEffect, useState } from 'react';
import { Card, Button, Typography, Space, Result, Spin, message } from 'antd';
import { CrownOutlined, CheckOutlined, HomeOutlined } from '@ant-design/icons';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { useUser } from '@/hooks/useFirebaseAuth';
import { useSubscription } from '@/hooks/useSubscription';
import PremiumBadge from '@/components/PremiumBadge';
import Iconify from '@/components/Iconify';

const { Title, Text, Paragraph } = Typography;

const PremiumSuccessPage = () => {
  const { t } = useLanguage();
  const { user } = useUser();
  const { refreshSubscription } = useSubscription();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationComplete, setVerificationComplete] = useState(false);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // Refresh subscription data to get the latest status
      const verifyPayment = async () => {
        try {
          // Wait a bit for webhook processing
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Refresh subscription data
          await refreshSubscription();
          
          setVerificationComplete(true);
          message.success('Abonamentul Premium a fost activat cu succes!');
        } catch (error) {
          console.error('Error verifying payment:', error);
          message.error('A apărut o eroare la verificarea plății. Te rugăm să contactezi suportul.');
        } finally {
          setIsVerifying(false);
        }
      };

      verifyPayment();
    } else {
      setIsVerifying(false);
    }
  }, [sessionId, refreshSubscription]);

  const premiumFeatures = [
    {
      icon: 'eva:heart-fill',
      title: 'Match-uri Nelimitate',
      description: 'Descoperă toți utilizatorii compatibili'
    },
    {
      icon: 'eva:message-circle-fill',
      title: 'Mesaje Nelimitate',
      description: 'Conversații fără restricții'
    },
    {
      icon: 'eva:flash-fill',
      title: 'Super Likes',
      description: '5 super like-uri pe zi'
    },
    {
      icon: 'eva:star-fill',
      title: 'Compatibilitate Avansată',
      description: 'Analiză astrologie și numerologie'
    },
    {
      icon: 'eva:trending-up-fill',
      title: 'Boost Profil',
      description: 'Apari în top 3 ore pe săptămână'
    },
    {
      icon: 'eva:checkmark-circle-fill',
      title: 'Badge Verificat',
      description: 'Profil verificat pentru credibilitate'
    }
  ];

  if (isVerifying) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <Card
          style={{
            maxWidth: 500,
            width: '100%',
            borderRadius: '20px',
            textAlign: 'center',
            padding: '2rem'
          }}
        >
          <Spin size="large" />
          <Title level={3} style={{ marginTop: '1rem', color: '#667eea' }}>
            Verificăm plata...
          </Title>
          <Text type="secondary">
            Te rugăm să aștepți câteva secunde în timp ce confirmăm abonamentul tău Premium.
          </Text>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Result
          icon={
            <div style={{ fontSize: '5rem', color: '#FFD700' }}>
              <CrownOutlined />
            </div>
          }
          title={
            <Title level={1} style={{ color: 'white', marginBottom: '1rem' }}>
              {t('premium.welcomeToPremium')}
            </Title>
          }
          subTitle={
            <Paragraph style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '2rem' }}>
              {t('premium.subscriptionActivated')}
            </Paragraph>
          }
          extra={[
            <Card
              key="features"
              style={{
                borderRadius: '20px',
                border: 'none',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                marginBottom: '2rem'
              }}
            >
              <div style={{ padding: '1rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <PremiumBadge user={{ subscription: { isPremium: true } }} size="large" />
                  <Title level={3} style={{ color: '#333', marginTop: '1rem' }}>
                    {t('premium.whatYouGetWithPremium')}
                  </Title>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: '1.5rem' 
                }}>
                  {premiumFeatures.map((feature, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '12px',
                      padding: '1rem',
                      background: 'rgba(102, 126, 234, 0.05)',
                      borderRadius: '12px',
                      border: '1px solid rgba(102, 126, 234, 0.1)'
                    }}>
                      <Iconify 
                        icon={feature.icon} 
                        style={{ color: '#667eea', fontSize: '24px', marginTop: '2px' }} 
                      />
                      <div>
                        <Text strong style={{ color: '#333', display: 'block', marginBottom: '4px' }}>
                          {feature.title}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '14px' }}>
                          {feature.description}
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>,
            
            <Space key="actions" size="large" wrap style={{ justifyContent: 'center' }}>
              <Button
                type="primary"
                size="large"
                icon={<HomeOutlined />}
                onClick={() => router.push('/')}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '25px',
                  height: '50px',
                  fontSize: '16px',
                  fontWeight: '600',
                  padding: '0 2rem'
                }}
              >
                {t('premium.startExploring')}
              </Button>

              <Button
                size="large"
                onClick={() => router.push('/matches')}
                style={{
                  borderRadius: '25px',
                  height: '50px',
                  fontSize: '16px',
                  fontWeight: '600',
                  padding: '0 2rem',
                  background: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}
              >
                Descoperă Match-uri
              </Button>
            </Space>
          ]}
        />

        {/* Thank you message */}
        <Card
          style={{
            borderRadius: '20px',
            border: 'none',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center',
            marginTop: '2rem'
          }}
        >
          <div style={{ padding: '1rem' }}>
            <Title level={4} style={{ color: '#333', marginBottom: '1rem' }}>
              Mulțumim pentru încredere! 🎉
            </Title>
            <Paragraph style={{ color: '#666', marginBottom: '1rem' }}>
              Acum faci parte din comunitatea Premium YDestiny. Îți dorim să îți găsești jumătatea perfectă!
            </Paragraph>
            <Space>
              <CheckOutlined style={{ color: '#52c41a' }} />
              <Text type="secondary">
                Poți gestiona abonamentul din secțiunea Setări
              </Text>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PremiumSuccessPage; 