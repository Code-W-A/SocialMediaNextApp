"use client";

import React from 'react';
import { Modal, Button, Typography, Space, Card, Row, Col } from 'antd';
import { CrownOutlined, CheckOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { useSubscription } from '@/hooks/useSubscription';
import { PREMIUM_FEATURES_DESCRIPTIONS, getPremiumUpgradePrompt } from '@/utils/premiumHelpers';
import Iconify from '@/components/Iconify';

const { Title, Text, Paragraph } = Typography;

const PremiumGate = ({ 
  feature, 
  children, 
  fallback,
  showModal = true,
  onUpgrade 
}) => {
  const { t } = useLanguage();
  const { isPremium, startPremiumSubscription } = useSubscription();
  const router = useRouter();
  const [modalVisible, setModalVisible] = React.useState(false);

  // If user has premium, render children
  if (isPremium) {
    return children;
  }

  const upgradePrompt = getPremiumUpgradePrompt(feature);
  const featureInfo = PREMIUM_FEATURES_DESCRIPTIONS[feature];

  const handleUpgrade = async () => {
    setModalVisible(false);
    if (onUpgrade) {
      onUpgrade();
    } else {
      router.push('/premium');
    }
  };

  const handleShowModal = () => {
    if (showModal) {
      setModalVisible(true);
    } else if (onUpgrade) {
      onUpgrade();
    } else {
      router.push('/premium');
    }
  };

  // If fallback is provided, render it instead of children
  if (fallback) {
    return React.cloneElement(fallback, {
      onClick: handleShowModal,
      ...fallback.props
    });
  }

  return (
    <>
      {/* Render children with click handler to show upgrade modal */}
      {React.cloneElement(children, {
        onClick: handleShowModal,
        disabled: true,
        style: {
          ...children.props.style,
          opacity: 0.6,
          cursor: 'pointer'
        }
      })}

      {/* Premium Upgrade Modal */}
      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
        centered
        style={{ borderRadius: '20px' }}
      >
        <div style={{ padding: '1rem 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '3rem', color: '#FFD700', marginBottom: '1rem' }}>
              <CrownOutlined />
            </div>
            
            <Title level={3} style={{ color: '#667eea', marginBottom: '0.5rem' }}>
              {upgradePrompt.title}
            </Title>
            
            <Paragraph style={{ color: '#666', fontSize: '16px' }}>
              {upgradePrompt.message}
            </Paragraph>
          </div>

          {/* Featured benefit */}
          {featureInfo && (
            <Card
              style={{
                marginBottom: '1.5rem',
                border: '2px solid #667eea',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Iconify 
                  icon={featureInfo.icon} 
                  style={{ color: '#667eea', fontSize: '24px' }} 
                />
                <div>
                  <Text strong style={{ color: '#333', fontSize: '16px', display: 'block' }}>
                    {featureInfo.title}
                  </Text>
                  <Text type="secondary">
                    {featureInfo.description}
                  </Text>
                </div>
              </div>
            </Card>
          )}

          {/* Premium benefits grid */}
          <div style={{ marginBottom: '2rem' }}>
            <Title level={5} style={{ color: '#333', marginBottom: '1rem', textAlign: 'center' }}>
              {t('premiumGate.allPremiumBenefits')}
            </Title>
            
            <Row gutter={[12, 12]}>
              {Object.values(PREMIUM_FEATURES_DESCRIPTIONS).slice(0, 6).map((benefit, index) => (
                <Col xs={12} key={index}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: '8px',
                    background: 'rgba(102, 126, 234, 0.05)',
                    borderRadius: '8px'
                  }}>
                    <CheckOutlined style={{ color: '#52c41a', fontSize: '14px' }} />
                    <Text style={{ fontSize: '13px' }}>{benefit.title}</Text>
                  </div>
                </Col>
              ))}
            </Row>
          </div>

          {/* Price and CTA */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>
                {t('premiumGate.pricePerMonth')}
              </span>
            </div>
            
            <Space size="middle">
              <Button
                type="primary"
                size="large"
                icon={<CrownOutlined />}
                onClick={handleUpgrade}
                style={{
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  border: 'none',
                  borderRadius: '20px',
                  height: '45px',
                  fontSize: '16px',
                  fontWeight: '600',
                  padding: '0 2rem',
                  color: '#000'
                }}
              >
                {t('premiumGate.upgradeToPremium')}
              </Button>
              
              <Button
                size="large"
                onClick={() => setModalVisible(false)}
                style={{
                  borderRadius: '20px',
                  height: '45px',
                  padding: '0 1.5rem'
                }}
              >
                {t('premiumGate.maybeLater')}
              </Button>
            </Space>
          </div>

          {/* Trust indicators */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Space size="middle">
              <Text type="secondary" style={{ fontSize: '12px' }}>
                <CheckOutlined style={{ color: '#52c41a' }} /> {t('premiumGate.securedWithStripe')}
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                <CheckOutlined style={{ color: '#52c41a' }} /> {t('premiumGate.cancelAnytime')}
              </Text>
            </Space>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PremiumGate; 