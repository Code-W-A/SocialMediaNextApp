'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Typography, Space, Row, Col, Card } from 'antd';
import { DownloadOutlined, CloseOutlined, MessageOutlined, HeartOutlined, StarFilled } from '@ant-design/icons';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n';

const { Title, Paragraph, Text } = Typography;

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if already dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after a delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000); // Increased delay for better UX
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installation accepted');
      } else {
        console.log('PWA installation dismissed');
      }
    } catch (error) {
      console.error('PWA installation failed:', error);
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
    // Show again after 24 hours
    setTimeout(() => {
      localStorage.removeItem('pwa-install-dismissed');
    }, 24 * 60 * 60 * 1000);
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <Modal
      open={showPrompt}
      onCancel={handleDismiss}
      footer={null}
      width={900}
      centered
      closable={false}
      maskStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)'
      }}
      style={{
        borderRadius: '30px',
        overflow: 'hidden'
      }}
    >
      <div style={{
        background: 'linear-gradient(135deg, #fefcf3 0%, #f7f3e7 50%, #f0ebe0 100%)',
        margin: '-24px',
        padding: '0',
        borderRadius: '30px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Close Button */}
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={handleDismiss}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 10,
            color: '#2c3e50',
            border: 'none',
            fontSize: '16px'
          }}
        />

        {/* Header with Logo and Title */}
        <div style={{
          padding: '40px 40px 30px',
          textAlign: 'center',
          position: 'relative'
        }}>
          {/* Logo */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(45deg, #FFD700, #FFA500)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              boxShadow: '0 8px 25px rgba(255, 215, 0, 0.3)'
            }}>
              ✨
            </div>
            <Title level={2} style={{ 
              color: '#2c3e50', 
              margin: 0,
              fontWeight: '800',
              fontSize: '2rem'
            }}>
              YDestiny
            </Title>
          </div>

          <Title level={3} style={{ 
            color: '#2c3e50', 
            margin: '0 0 10px 0',
            fontWeight: '700'
          }}>
            {t('landing.pwaTitle')}
          </Title>
          
          <Paragraph style={{ 
            color: '#5d6d7e', 
            fontSize: '16px',
            margin: 0,
            maxWidth: '400px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            {t('landing.pwaSubtitle')}
          </Paragraph>
        </div>

        {/* Main Content */}
        <div style={{ padding: '0 40px 40px' }}>
          <Row gutter={[20, 20]} align="middle">
            {/* Left side - Image */}
            <Col xs={24} md={12}>
              <div style={{
                position: 'relative',
                width: '100%',
                height: '280px',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
                border: '3px solid rgba(255, 215, 0, 0.2)'
              }}>
                <Image
                  src="/images/Minimalist digital illustration showing a group of people standing in a circle, holding hands, viewed from above, soft golden light casting long shadows, creamy white background with subtle texture, elegant line work, harmonious and inclusi.jpg"
                  alt="YDestiny Community"
                  fill
                  style={{ objectFit: 'cover' }}
                />
                
                {/* Overlay with floating elements */}
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  width: '50px',
                  height: '50px',
                  background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  animation: 'float 3s ease-in-out infinite',
                  boxShadow: '0 8px 20px rgba(255, 215, 0, 0.4)'
                }}>
                  💫
                </div>
                
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '20px',
                  width: '45px',
                  height: '45px',
                  background: 'linear-gradient(45deg, #FF69B4, #FFB6C1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  animation: 'float 3s ease-in-out infinite 1.5s',
                  boxShadow: '0 8px 20px rgba(255, 105, 180, 0.4)'
                }}>
                  ❤️
                </div>
              </div>
            </Col>

            {/* Right side - Content */}
            <Col xs={24} md={12}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Paragraph style={{ 
                    color: '#2c3e50', 
                    fontSize: '16px',
                    lineHeight: '1.6',
                    marginBottom: '25px'
                  }}>
                    {t('landing.pwaDescription')}
                  </Paragraph>
                </div>

                {/* Features */}
                <div>
                  <Row gutter={[10, 15]}>
                    <Col span={12}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MessageOutlined style={{ color: '#FFD700', fontSize: '18px' }} />
                        <Text style={{ color: '#2c3e50', fontSize: '14px' }}>
                          {t('landing.pwaFeature1')}
                        </Text>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <HeartOutlined style={{ color: '#FF69B4', fontSize: '18px' }} />
                        <Text style={{ color: '#2c3e50', fontSize: '14px' }}>
                          {t('landing.pwaFeature2')}
                        </Text>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <StarFilled style={{ color: '#4CAF50', fontSize: '18px' }} />
                        <Text style={{ color: '#2c3e50', fontSize: '14px' }}>
                          {t('landing.pwaFeature3')}
                        </Text>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <DownloadOutlined style={{ color: '#9C27B0', fontSize: '18px' }} />
                        <Text style={{ color: '#2c3e50', fontSize: '14px' }}>
                          {t('landing.pwaFeature4')}
                        </Text>
                      </div>
                    </Col>
                  </Row>
                </div>

                {/* Action Buttons */}
                <div style={{ marginTop: '30px' }}>
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <Button
                      type="primary"
                      size="large"
                      icon={<DownloadOutlined />}
                      onClick={handleInstall}
                      block
                      style={{
                        background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                        border: 'none',
                        borderRadius: '25px',
                        height: '55px',
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#000',
                        boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {t('landing.pwaInstallButton')}
                    </Button>
                    
                   
                  </Space>
                </div>
              </Space>
            </Col>
          </Row>

          {/* Footer note */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '30px',
            padding: '20px',
            background: 'rgba(255, 215, 0, 0.1)',
            borderRadius: '15px',
            border: '1px solid rgba(255, 215, 0, 0.2)'
          }}>
            <Text style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
              {t('landing.pwaFooterNote')}
            </Text>
          </div>
        </div>

        {/* Add CSS animations */}
        <style jsx global>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
      </div>
    </Modal>
  );
} 