"use client";
import React from 'react';
import { Button, Typography, Flex } from 'antd';
import { AndroidOutlined, ToolOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n';
import { maintenanceConfig } from '@/config/maintenance';

const { Title, Text, Paragraph } = Typography;

const MaintenanceScreen = () => {
  const { language } = useLanguage();
  const currentLang = language || 'ro';

  const handleOpenPlayStore = () => {
    window.open(maintenanceConfig.androidAppUrl, '_blank');
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999,
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: '40px 20px'
    }}>
      {/* Decorative Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '10%',
        width: '250px',
        height: '250px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.1)',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '10%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.08)',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />

      {/* Main Content Card */}
      <div className="maintenance-card" style={{
        background: 'white',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        maxWidth: '600px',
        width: '100%',
        padding: '32px 24px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Logo */}
        <div className="maintenance-logo" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          width: '100px',
          height: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
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

        {/* Maintenance Icon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '18px'
        }}>
          <ToolOutlined style={{ 
            fontSize: '28px', 
            color: '#667eea',
            animation: 'rotate 2s linear infinite'
          }} />
        </div>

        {/* Title */}
        <Title level={1} className="maintenance-title" style={{ 
          color: '#2d3748',
          margin: '0 0 12px 0',
          fontSize: '26px',
          fontWeight: 700
        }}>
          {maintenanceConfig.title[currentLang]}
        </Title>

        {/* Message */}
        <Paragraph className="maintenance-description" style={{ 
          fontSize: '15px',
          color: '#4a5568',
          marginBottom: '24px',
          lineHeight: '1.6'
        }}>
          {maintenanceConfig.message[currentLang]}
        </Paragraph>

        {/* Divider */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)',
          margin: '24px 0'
        }} />

        {/* Android App Section */}
        <div className="maintenance-app-section" style={{
          background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
          borderRadius: '14px',
          padding: '20px 18px',
          marginBottom: '20px'
        }}>
          <Text strong style={{ 
            display: 'block', 
            fontSize: '17px', 
            color: '#2d3748',
            marginBottom: '10px'
          }}>
            {currentLang === 'ro' ? '📱 Încercă Aplicația Android' : '📱 Try the Android App'}
          </Text>
          <Text style={{ 
            display: 'block', 
            fontSize: '13px', 
            color: '#718096',
            marginBottom: '16px'
          }}>
            {currentLang === 'ro' 
              ? 'Experiență nativă completă cu notificări în timp real și performanță superioară!'
              : 'Full native experience with real-time notifications and superior performance!'
            }
          </Text>

          {/* Features */}
          <Flex vertical gap={10} style={{ marginBottom: '18px', textAlign: 'left' }}>
            <Flex align="center" gap={10}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '13px'
              }}>
                ✓
              </div>
              <Text style={{ fontSize: '13px', color: '#4a5568' }}>
                {currentLang === 'ro' ? 'Interfață optimizată pentru mobil' : 'Optimized mobile interface'}
              </Text>
            </Flex>
            <Flex align="center" gap={10}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                background: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '13px'
              }}>
                ✓
              </div>
              <Text style={{ fontSize: '13px', color: '#4a5568' }}>
                {currentLang === 'ro' ? 'Notificări push instant' : 'Instant push notifications'}
              </Text>
            </Flex>
            <Flex align="center" gap={10}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '13px'
              }}>
                ✓
              </div>
              <Text style={{ fontSize: '13px', color: '#4a5568' }}>
                {currentLang === 'ro' ? 'Performanță îmbunătățită' : 'Improved performance'}
              </Text>
            </Flex>
          </Flex>

          <Button
            type="primary"
            size="large"
            block
            icon={<AndroidOutlined style={{ fontSize: '18px' }} />}
            onClick={handleOpenPlayStore}
            style={{
              height: '48px',
              fontSize: '15px',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #3ddc84 0%, #2bb76e 100%)',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(61, 220, 132, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(61, 220, 132, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(61, 220, 132, 0.4)';
            }}
          >
            {currentLang === 'ro' ? 'Descarcă de pe Google Play' : 'Download from Google Play'}
          </Button>
        </div>

        {/* Footer Info */}
        <Text style={{ 
          display: 'block',
          fontSize: '12px', 
          color: '#a0aec0',
          lineHeight: '1.5',
          paddingBottom: '8px'
        }}>
          {currentLang === 'ro' 
            ? '💡 Site-ul va fi din nou disponibil în curând. Mulțumim pentru înțelegere!'
            : '💡 The site will be available again soon. Thank you for your understanding!'
          }
        </Text>
      </div>

      {/* Animation & Responsive Styles */}
      <style jsx global>{`
        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* Mobile Responsive Adjustments */
        @media (max-width: 768px) {
          .maintenance-card {
            padding: 24px 20px !important;
            max-width: 95% !important;
          }
          
          .maintenance-logo {
            width: 80px !important;
            height: 80px !important;
            margin-bottom: 16px !important;
          }
          
          .maintenance-title {
            font-size: 22px !important;
            margin-bottom: 10px !important;
          }
          
          .maintenance-description {
            font-size: 14px !important;
            margin-bottom: 20px !important;
          }
          
          .maintenance-app-section {
            padding: 16px 14px !important;
            margin-bottom: 16px !important;
          }
        }

        @media (max-height: 700px) {
          .maintenance-card {
            padding: 20px 18px !important;
          }
          
          .maintenance-logo {
            width: 70px !important;
            height: 70px !important;
            margin-bottom: 12px !important;
          }
          
          .maintenance-title {
            font-size: 20px !important;
            margin-bottom: 8px !important;
          }
          
          .maintenance-description {
            font-size: 13px !important;
            margin-bottom: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MaintenanceScreen;

