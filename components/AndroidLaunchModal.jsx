"use client";
import React, { useState, useEffect } from 'react';
import { Modal, Button, Typography, Flex } from 'antd';
import { CloseOutlined, AndroidOutlined, AppleOutlined, RocketOutlined } from '@ant-design/icons';
import Image from 'next/image';
import Iconify from './Iconify';
import { useLanguage } from '@/lib/i18n';

const { Title, Text, Paragraph } = Typography;

const AndroidLaunchModal = () => {
  const [visible, setVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Check if modal should be shown today
    const checkShouldShow = () => {
      const lastShown = localStorage.getItem('androidLaunchModalLastShown');
      const today = new Date().toDateString();
      
      // Show if never shown or if last shown was on a different day
      if (!lastShown || lastShown !== today) {
        setVisible(true);
        localStorage.setItem('androidLaunchModalLastShown', today);
      }
    };

    // Small delay to let the app load first
    const timer = setTimeout(checkShouldShow, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);
  };

  const handleOpenPlayStore = () => {
    window.open('https://play.google.com/store/apps/details?id=com.mobitools.ydestiny', '_blank');
    setVisible(false);
  };

  return (
    <Modal
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={800}
      centered={false}
      closable={false}
      maskStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)'
      }}
      style={{
        borderRadius: '20px',
        overflow: 'hidden',
        top: '40px',
        maxWidth: '90vw',
        maxHeight: 'calc(100vh - 80px)',
        margin: '0 auto'
      }}
      styles={{
        body: { 
          padding: 0,
          maxHeight: 'calc(100vh - 120px)',
          overflowY: 'auto'
        }
      }}
    >
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Close Button */}
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
            color: 'white',
            border: 'none',
            fontSize: '18px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        />

        {/* Decorative Background Elements */}
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(30px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-50px',
          left: '-50px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          filter: 'blur(40px)'
        }} />

        {/* Header Section */}
        <div style={{
          padding: '32px 40px 24px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Logo */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            width: '100px',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            padding: '14px'
          }}>
            <Image 
              src="/images/sigla-512.png" 
              alt="YDestiny Logo" 
              width={72}
              height={72}
              style={{ objectFit: 'contain' }}
            />
          </div>

          <Title level={2} style={{ 
            color: 'white', 
            margin: '0 0 10px 0',
            fontSize: '26px',
            fontWeight: 700,
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
          }}>
            {t('androidLaunch.title')}
          </Title>
          
          <Text style={{ 
            color: 'rgba(255, 255, 255, 0.95)', 
            fontSize: '15px',
            display: 'block',
            lineHeight: '1.5'
          }}>
            {t('androidLaunch.subtitle')}
          </Text>
        </div>

        {/* Content Section */}
        <div style={{ 
          background: 'white',
          padding: '28px 40px',
          borderRadius: '20px 20px 0 0',
          position: 'relative',
          zIndex: 1
        }}>
          <Paragraph style={{ 
            fontSize: '14px',
            color: '#4a5568',
            marginBottom: '20px',
            lineHeight: '1.6',
            textAlign: 'center'
          }}>
            {t('androidLaunch.description')}
          </Paragraph>

          {/* Features */}
          <div style={{ marginBottom: '24px' }}>
            <Flex vertical gap={12}>
              <Flex align="center" gap={12}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Iconify icon="ph:device-mobile-bold" width="18px" color="#667eea" />
                </div>
                <div style={{ flex: 1 }}>
                  <Text strong style={{ display: 'block', fontSize: '14px', color: '#2d3748' }}>
                    {t('androidLaunch.features.nativeExperience')}
                  </Text>
                  <Text style={{ fontSize: '12px', color: '#718096' }}>
                    {t('androidLaunch.features.nativeExperienceDesc')}
                  </Text>
                </div>
              </Flex>

              <Flex align="center" gap={12}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Iconify icon="ph:bell-ringing-bold" width="18px" color="#48bb78" />
                </div>
                <div style={{ flex: 1 }}>
                  <Text strong style={{ display: 'block', fontSize: '14px', color: '#2d3748' }}>
                    {t('androidLaunch.features.pushNotifications')}
                  </Text>
                  <Text style={{ fontSize: '12px', color: '#718096' }}>
                    {t('androidLaunch.features.pushNotificationsDesc')}
                  </Text>
                </div>
              </Flex>

              <Flex align="center" gap={12}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Iconify icon="ph:lightning-bold" width="18px" color="#ed8936" />
                </div>
                <div style={{ flex: 1 }}>
                  <Text strong style={{ display: 'block', fontSize: '14px', color: '#2d3748' }}>
                    {t('androidLaunch.features.performance')}
                  </Text>
                  <Text style={{ fontSize: '12px', color: '#718096' }}>
                    {t('androidLaunch.features.performanceDesc')}
                  </Text>
                </div>
              </Flex>
            </Flex>
          </div>

          {/* Android Button */}
          <Button
            type="primary"
            size="large"
            block
            icon={<AndroidOutlined style={{ fontSize: '18px' }} />}
            onClick={handleOpenPlayStore}
            style={{
              height: '50px',
              fontSize: '15px',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #3ddc84 0%, #2bb76e 100%)',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(61, 220, 132, 0.3)',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(61, 220, 132, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(61, 220, 132, 0.3)';
            }}
          >
            {t('androidLaunch.downloadNow')}
          </Button>

          {/* iOS Coming Soon */}
          <Flex 
            align="center" 
            justify="center" 
            gap={8}
            style={{
              padding: '14px',
              background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
              borderRadius: '10px',
              border: '1px solid #e2e8f0'
            }}
          >
            <AppleOutlined style={{ fontSize: '18px', color: '#4a5568' }} />
            <Text style={{ color: '#4a5568', fontSize: '13px' }}>
              {t('androidLaunch.iosComingSoon')}
            </Text>
            <Iconify icon="ph:sparkle-fill" width="14px" color="#f6ad55" />
          </Flex>
        </div>
      </div>

      <style jsx global>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </Modal>
  );
};

export default AndroidLaunchModal;

