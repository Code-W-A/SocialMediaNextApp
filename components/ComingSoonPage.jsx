"use client";

import React, { useState } from 'react';
import { Button, Typography, Space, Modal, Input, Form, message, Card } from 'antd';
import { EyeOutlined, LockOutlined, StarOutlined, HeartOutlined, RocketOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Iconify from '@/components/Iconify';

const { Title, Text, Paragraph } = Typography;

const ComingSoonPage = ({ onPasswordSuccess }) => {
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();

  const handlePasswordSubmit = (values) => {
    setLoading(true);
    
    // Simulated loading for better UX
    setTimeout(() => {
      if (values.password === '1234567890') {
        message.success('Welcome! Access granted 🎉');
        localStorage.setItem('ydestiny_preview_access', 'granted');
        setPasswordModalVisible(false);
        onPasswordSuccess();
      } else {
        message.error('Incorrect password. Please try again.');
        form.resetFields();
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {/* Stars Background Animation */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(2px 2px at 20px 30px, #eee, transparent),
          radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
          radial-gradient(1px 1px at 90px 40px, #fff, transparent),
          radial-gradient(1px 2px at 130px 80px, rgba(255,255,255,0.6), transparent),
          radial-gradient(2px 1px at 160px 30px, #fff, transparent)
        `,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 100px',
        animation: 'twinkle 3s ease-in-out infinite alternate',
        pointerEvents: 'none'
      }} />

      <Card
        style={{
          maxWidth: '600px',
          width: '100%',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          zIndex: 1
        }}
        bordered={false}
      >
        {/* Logo/Icon */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            fontSize: '64px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '16px'
          }}>
            ✨
          </div>
          <Title level={1} style={{ 
            margin: 0,
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '48px',
            fontWeight: 'bold'
          }}>
            YDestiny
          </Title>
        </div>

        {/* Coming Soon Content */}
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={2} style={{ color: '#2c3e50', marginBottom: '16px' }}>
              Something Magical is Coming Soon ✨
            </Title>
            <Paragraph style={{ 
              fontSize: '18px', 
              color: '#6c757d',
              lineHeight: 1.6,
              marginBottom: '32px'
            }}>
                           We&apos;re putting the finishing touches on the most revolutionary astrological dating platform. 
               Get ready to discover your cosmic connections like never before.
            </Paragraph>
          </div>

          {/* Features Preview */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
            padding: '24px',
            borderRadius: '16px',
            marginBottom: '32px'
          }}>
            <Title level={4} style={{ color: '#667eea', marginBottom: '20px' }}>
                             What&apos;s Coming:
            </Title>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <HeartOutlined style={{ fontSize: '20px', color: '#ff6b6b' }} />
                <Text style={{ fontSize: '16px' }}>Advanced Astrological Compatibility</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <StarOutlined style={{ fontSize: '20px', color: '#ffd93d' }} />
                <Text style={{ fontSize: '16px' }}>Personalized Cosmic Profiles</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <RocketOutlined style={{ fontSize: '20px', color: '#6c5ce7' }} />
                <Text style={{ fontSize: '16px' }}>Spiritual Connection Matching</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Iconify icon="eva:message-circle-fill" style={{ fontSize: '20px', color: '#00b894' }} />
                <Text style={{ fontSize: '16px' }}>Meaningful Cosmic Conversations</Text>
              </div>
            </Space>
          </div>

          {/* CTA Buttons */}
          <Space size="large" style={{ justifyContent: 'center' }}>
            <Button
              type="primary"
              size="large"
              icon={<EyeOutlined />}
              onClick={() => setPasswordModalVisible(true)}
              style={{
                height: '50px',
                padding: '0 32px',
                fontSize: '16px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                border: 'none',
                borderRadius: '25px',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}
            >
              See Preview
            </Button>
            
            <Button
              size="large"
              onClick={() => router.push('/sign-up')}
              style={{
                height: '50px',
                padding: '0 32px',
                fontSize: '16px',
                borderRadius: '25px',
                borderColor: '#667eea',
                color: '#667eea'
              }}
            >
              Get Early Access
            </Button>
          </Space>

          {/* Footer */}
          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              Join thousands of souls finding their cosmic connections
            </Text>
          </div>
        </Space>
      </Card>

      {/* Password Modal */}
      <Modal
        title={
          <div style={{ textAlign: 'center' }}>
            <LockOutlined style={{ fontSize: '24px', color: '#667eea', marginBottom: '8px' }} />
            <Title level={4} style={{ margin: 0, color: '#667eea' }}>
              Preview Access
            </Title>
          </div>
        }
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        footer={null}
        centered
        width={400}
        style={{
          borderRadius: '16px'
        }}
      >
        <div style={{ padding: '20px 0' }}>
          <Paragraph style={{ 
            textAlign: 'center', 
            color: '#6c757d',
            marginBottom: '24px'
          }}>
            Enter the preview password to access the full platform
          </Paragraph>
          
          <Form
            form={form}
            onFinish={handlePasswordSubmit}
            layout="vertical"
          >
            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Please enter the password' }
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Enter preview password"
                prefix={<LockOutlined />}
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>
            
            <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                style={{
                  width: '100%',
                  height: '45px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  border: 'none',
                  borderRadius: '8px'
                }}
              >
                {loading ? 'Verifying...' : 'Access Preview'}
              </Button>
            </Form.Item>
          </Form>
          
          <div style={{ 
            textAlign: 'center', 
            marginTop: '16px',
            padding: '12px',
            background: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <Iconify icon="eva:info-fill" style={{ marginRight: '4px' }} />
                             For preview access, contact the development team
            </Text>
            
            {/* Development helper - will be hidden in production */}
            {process.env.NODE_ENV === 'development' && (
              <div style={{ marginTop: '8px', fontSize: '10px', color: '#999' }}>
                Dev: Password is &quot;1234567890&quot;
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes twinkle {
          0% { opacity: 0.3; }
          100% { opacity: 1; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default ComingSoonPage; 