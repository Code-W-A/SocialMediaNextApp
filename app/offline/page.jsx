'use client';

import { useEffect, useState } from 'react';
import { Button, Typography, Space, Card } from 'antd';
import { WifiOutlined, ReloadOutlined, HeartOutlined } from '@ant-design/icons';
import Image from 'next/image';

const { Title, Paragraph } = Typography;

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F8F6F0 0%, #E8E6E0 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <Card
        style={{
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          borderRadius: '20px',
          border: 'none',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          background: 'white'
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Logo */}
          <div style={{ marginBottom: '1rem' }}>
            <Image
              src="/images/destiny-logo.svg"
              alt="Destiny Logo"
              width={80}
              height={80}
              style={{ opacity: 0.8 }}
            />
          </div>

          {/* Status Icon */}
          <div style={{
            fontSize: '4rem',
            color: isOnline ? '#52c41a' : '#ff4d4f',
            marginBottom: '1rem'
          }}>
            {isOnline ? <WifiOutlined /> : <WifiOutlined style={{ opacity: 0.3 }} />}
          </div>

          {/* Title */}
          <Title level={2} style={{ 
            color: '#2C3E50',
            marginBottom: '0.5rem',
            fontSize: '1.5rem'
          }}>
            {isOnline ? 'Ești online din nou!' : 'Fără conexiune'}
          </Title>

          {/* Description */}
          <Paragraph style={{ 
            color: '#666',
            fontSize: '16px',
            lineHeight: '1.6',
            marginBottom: '2rem'
          }}>
            {isOnline 
              ? 'Conexiunea a fost restabilită. Poți continua să folosești Destiny!'
              : 'Se pare că nu ai conexiune la internet. Verifică conexiunea și încearcă din nou.'
            }
          </Paragraph>

          {/* Action Button */}
          <Button
            type="primary"
            size="large"
            icon={isOnline ? <HeartOutlined /> : <ReloadOutlined />}
            onClick={handleReload}
            style={{
              background: isOnline 
                ? 'linear-gradient(135deg, #667eea, #764ba2)'
                : 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
              border: 'none',
              borderRadius: '25px',
              height: '50px',
              fontSize: '16px',
              fontWeight: '600',
              padding: '0 2rem',
              boxShadow: isOnline 
                ? '0 8px 25px rgba(102, 126, 234, 0.3)'
                : '0 8px 25px rgba(255, 107, 107, 0.3)'
            }}
          >
            {isOnline ? 'Înapoi la Destiny' : 'Încearcă din nou'}
          </Button>

          {/* Additional Info */}
          <div style={{
            background: '#f8f9fa',
            padding: '1rem',
            borderRadius: '12px',
            marginTop: '1rem'
          }}>
            <Paragraph style={{ 
              margin: 0,
              fontSize: '14px',
              color: '#666'
            }}>
              💡 <strong>Știai că:</strong> Destiny funcționează și offline! 
              Poți vedea conversațiile și profilurile salvate chiar și fără internet.
            </Paragraph>
          </div>
        </Space>
      </Card>
    </div>
  );
} 