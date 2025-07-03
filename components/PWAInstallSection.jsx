"use client";
import React from "react";
import { Card, Typography, Space, Button } from "antd";
import Iconify from "./Iconify";
import PWAInstallButton from "./PWAInstallButton";
import { usePWA } from "@/hooks/usePWA";

const { Title, Text, Paragraph } = Typography;

const PWAInstallSection = () => {
  const { canInstall, isInstalled, isOnline } = usePWA();

  // Don't show if PWA is already installed or not installable
  if (isInstalled || !canInstall) {
    return null;
  }

  return (
    <Card
      style={{
        background: 'linear-gradient(135deg, #f0f2ff 0%, #e6f7ff 100%)',
        border: '1px solid #d9e2ff',
        borderRadius: '16px',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 20px rgba(24, 144, 255, 0.1)',
        overflow: 'hidden',
        position: 'relative'
      }}
      bodyStyle={{ padding: '24px' }}
    >
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '100px',
        height: '100px',
        background: 'radial-gradient(circle, rgba(24, 144, 255, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '-30px',
        left: '-30px',
        width: '80px',
        height: '80px',
        background: 'radial-gradient(circle, rgba(64, 169, 255, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      <Space direction="vertical" size="large" style={{ width: '100%', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1890ff, #40a9ff)',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
          }}>
            <Iconify icon="eva:smartphone-fill" width="24px" style={{ color: 'white' }} />
          </div>
          
          <div>
            <Title level={4} style={{ margin: 0, color: '#1890ff', fontSize: '18px' }}>
              Instalează YDestiny App
            </Title>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              Pentru o experiență mai bună pe mobil
            </Text>
          </div>
        </div>

        {/* Benefits */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Iconify icon="eva:flash-fill" width="16px" style={{ color: '#52c41a' }} />
            <Text style={{ fontSize: '13px', color: '#666' }}>Acces rapid de pe ecranul principal</Text>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Iconify icon="eva:bell-fill" width="16px" style={{ color: '#fa8c16' }} />
            <Text style={{ fontSize: '13px', color: '#666' }}>Notificări push în timp real</Text>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Iconify icon="eva:wifi-off-fill" width="16px" style={{ color: '#722ed1' }} />
            <Text style={{ fontSize: '13px', color: '#666' }}>Funcționează offline</Text>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Iconify icon="eva:smartphone-fill" width="16px" style={{ color: '#1890ff' }} />
            <Text style={{ fontSize: '13px', color: '#666' }}>Experiență nativă</Text>
          </div>
        </div>

        {/* Description */}
        <Paragraph style={{ 
          margin: 0, 
          fontSize: '14px', 
          color: '#666',
          lineHeight: '1.5'
        }}>
          Instalează aplicația YDestiny pentru a avea acces instant la toate funcționalitățile, 
          notificări push pentru mesaje noi și o experiență optimizată pentru dispozitivele mobile.
        </Paragraph>

        {/* Install button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <PWAInstallButton 
            variant="gradient" 
            size="large"
            style={{ 
              padding: '0 24px',
              fontSize: '15px',
              fontWeight: '700'
            }}
          />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Iconify icon="eva:android-fill" width="16px" style={{ color: '#a0d911' }} />
            <Text style={{ fontSize: '12px', color: '#999' }}>
              Disponibil pentru Android
            </Text>
          </div>
        </div>

        {/* Offline status indicator */}
        {!isOnline && (
          <div style={{
            background: 'rgba(255, 193, 7, 0.1)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            borderRadius: '8px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Iconify icon="eva:wifi-off-fill" width="14px" style={{ color: '#fa8c16' }} />
            <Text style={{ fontSize: '12px', color: '#fa8c16', margin: 0 }}>
              Momentan ești offline - aplicația va funcționa și fără internet!
            </Text>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default PWAInstallSection; 