'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Typography, Space, Row, Col, Card } from 'antd';
import { DownloadOutlined, CloseOutlined, MobileOutlined, StarFilled } from '@ant-design/icons';
import Image from 'next/image';

const { Title, Paragraph, Text } = Typography;

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

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
      }, 3000);
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
      width={800}
      centered
      closable={false}
      maskStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)'
      }}
      style={{
        borderRadius: '25px',
        overflow: 'hidden'
      }}
    >
      <div style={{
        background: 'linear-gradient(135deg, #F8F6F0 0%, #E8E6E0 100%)',
        margin: '-24px',
        padding: '0',
        borderRadius: '25px',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '2rem 2rem 1rem',
          color: 'white',
          position: 'relative'
        }}>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={handleDismiss}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              color: 'white',
              border: 'none'
            }}
          />
          
          <Space direction="vertical" align="center" style={{ width: '100%' }}>
            <Image
              src="/images/destiny-logo.svg"
              alt="Destiny Logo"
              width={60}
              height={60}
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <Title level={2} style={{ 
              color: 'white', 
              margin: 0,
              textAlign: 'center',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}>
              Instalează Destiny
            </Title>
            <Paragraph style={{ 
              color: 'rgba(255,255,255,0.9)', 
              margin: 0,
              textAlign: 'center',
              fontSize: '16px'
            }}>
              Obține experiența completă cu aplicația noastră
            </Paragraph>
          </Space>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem' }}>
          {/* Screenshots */}
          <Row gutter={[16, 16]} style={{ marginBottom: '2rem' }}>
            <Col xs={8} sm={8}>
              <Card
                hoverable
                cover={
                  <div style={{ 
                    height: '200px', 
                    position: 'relative',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}>
                    <Image
                      src="/images/auth.png"
                      alt="Autentificare"
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                }
                style={{ 
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                }}
                styles={{ body: { padding: '12px' } }}
              >
                <Text strong style={{ fontSize: '12px', color: '#666' }}>
                  Autentificare rapidă
                </Text>
              </Card>
            </Col>
            
            <Col xs={8} sm={8}>
              <Card
                hoverable
                cover={
                  <div style={{ 
                    height: '200px', 
                    position: 'relative',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}>
                    <Image
                      src="/images/comunity.jpg"
                      alt="Comunitate"
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                }
                style={{ 
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                }}
                styles={{ body: { padding: '12px' } }}
              >
                <Text strong style={{ fontSize: '12px', color: '#666' }}>
                  Comunitatea ta
                </Text>
              </Card>
            </Col>
            
            <Col xs={8} sm={8}>
              <Card
                hoverable
                cover={
                  <div style={{ 
                    height: '200px', 
                    position: 'relative',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}>
                    <Image
                      src="/images/landing-page.jpg"
                      alt="Pagina principală"
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                }
                style={{ 
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                }}
                styles={{ body: { padding: '12px' } }}
              >
                <Text strong style={{ fontSize: '12px', color: '#666' }}>
                  Experiență completă
                </Text>
              </Card>
            </Col>
          </Row>

          {/* Benefits */}
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '15px',
            marginBottom: '2rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <Title level={4} style={{ 
              marginBottom: '1rem',
              color: '#2C3E50',
              textAlign: 'center'
            }}>
              ✨ De ce să instalezi Destiny?
            </Title>
            
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Space direction="vertical" align="center">
                  <MobileOutlined style={{ fontSize: '2rem', color: '#667eea' }} />
                  <Text strong style={{ textAlign: 'center', fontSize: '12px' }}>
                    Acces rapid
                  </Text>
                </Space>
              </Col>
              
              <Col xs={12} sm={6}>
                <Space direction="vertical" align="center">
                  <StarFilled style={{ fontSize: '2rem', color: '#FFD700' }} />
                  <Text strong style={{ textAlign: 'center', fontSize: '12px' }}>
                    Funcții exclusive
                  </Text>
                </Space>
              </Col>
              
              <Col xs={12} sm={6}>
                <Space direction="vertical" align="center">
                  <div style={{ fontSize: '2rem' }}>🔔</div>
                  <Text strong style={{ textAlign: 'center', fontSize: '12px' }}>
                    Notificări instant
                  </Text>
                </Space>
              </Col>
              
              <Col xs={12} sm={6}>
                <Space direction="vertical" align="center">
                  <div style={{ fontSize: '2rem' }}>⚡</div>
                  <Text strong style={{ textAlign: 'center', fontSize: '12px' }}>
                    Super rapid
                  </Text>
                </Space>
              </Col>
            </Row>
          </div>

          {/* Action Buttons */}
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Button
              type="primary"
              size="large"
              icon={<DownloadOutlined />}
              onClick={handleInstall}
              block
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                border: 'none',
                borderRadius: '25px',
                height: '55px',
                fontSize: '16px',
                fontWeight: '700',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Instalează acum - Gratuit
            </Button>
            
            <Row gutter={8}>
              <Col span={12}>
                <Button
                  onClick={handleRemindLater}
                  block
                  style={{
                    borderRadius: '20px',
                    height: '45px',
                    border: '1px solid #d9d9d9'
                  }}
                >
                  Amintește-mi mai târziu
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  onClick={handleDismiss}
                  block
                  style={{
                    borderRadius: '20px',
                    height: '45px',
                    border: '1px solid #d9d9d9'
                  }}
                >
                  Nu, mulțumesc
                </Button>
              </Col>
            </Row>
          </Space>

          {/* Footer note */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '1rem',
            opacity: 0.7
          }}>
            <Text style={{ fontSize: '12px', color: '#666' }}>
              💡 Instalarea nu ocupă spațiu suplimentar și poți dezinstala oricând
            </Text>
          </div>
        </div>
      </div>
    </Modal>
  );
} 