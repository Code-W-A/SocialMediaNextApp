"use client";
import React, { useState, useEffect } from "react";
import { Button, Typography, message, Modal } from "antd";
import Iconify from "./Iconify";
import { usePWA } from "@/hooks/usePWA";
import { useLanguage } from "@/lib/i18n";

const { Text } = Typography;

const PWAInstallButtonAlways = ({ 
  variant = "primary", 
  size = "default", 
  showText = true,
  style = {},
  className = ""
}) => {
  const { canInstall, installApp, isInstalled } = usePWA();
  const { t } = useLanguage();
  const [isInstalling, setIsInstalling] = useState(false);
  const [showAlreadyInstalledModal, setShowAlreadyInstalledModal] = useState(false);

  const handleInstall = async () => {
    // If app is already installed, show modal
    if (isInstalled) {
      setShowAlreadyInstalledModal(true);
      return;
    }

    // If can't install, check if it's because installation is not supported or already dismissed
    if (!canInstall) {
      // Check if we're in a PWA-capable browser
      const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
      
      if (!isSupported) {
        message.info({
          content: t('pwa.installNotSupported'),
          duration: 4,
          icon: <Iconify icon="eva:info-fill" style={{ color: '#1890ff' }} />
        });
      } else {
        // PWA is supported but prompt may have been dismissed or already used
        message.info({
          content: t('pwa.installPromptUnavailable'),
          duration: 5,
          icon: <Iconify icon="eva:info-fill" style={{ color: '#1890ff' }} />
        });
      }
      return;
    }

    setIsInstalling(true);
    
    try {
      const success = await installApp();
      
      if (success) {
        message.success({
          content: t('pwa.installSuccess'),
          duration: 5,
          icon: <Iconify icon="eva:checkmark-circle-fill" style={{ color: '#52c41a' }} />
        });
      } else {
        message.info({
          content: t('pwa.installCancelled'),
          duration: 3,
          icon: <Iconify icon="eva:info-fill" style={{ color: '#1890ff' }} />
        });
      }
    } catch (error) {
      console.error('PWA install error:', error);
      message.error({
        content: t('pwa.installError'),
        duration: 4,
        icon: <Iconify icon="eva:alert-triangle-fill" style={{ color: '#ff4d4f' }} />
      });
    } finally {
      setIsInstalling(false);
    }
  };

  const getButtonStyles = () => {
    const baseStyles = {
      borderRadius: '12px',
      height: size === 'large' ? '48px' : size === 'small' ? '32px' : '40px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: '600',
      boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)',
      border: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      ...style
    };

    if (variant === "primary") {
      return {
        ...baseStyles,
        background: 'linear-gradient(135deg, #1890ff, #40a9ff)',
        color: 'white',
      };
    } else if (variant === "secondary") {
      return {
        ...baseStyles,
        background: 'linear-gradient(135deg, #f0f2ff, #e6f7ff)',
        border: '1px solid #d9d9d9',
        color: '#1890ff',
      };
    } else if (variant === "gradient") {
      return {
        ...baseStyles,
        background: 'linear-gradient(135deg, var(--primary), #FFB84D)',
        color: 'white',
      };
    }

    return baseStyles;
  };

  const getButtonText = () => {
    if (isInstalled) {
      return t('pwa.openApp') || "Open App";
    }
    return t('pwa.installApp') || "Install App";
  };

  const getButtonIcon = () => {
    if (isInstalled) {
      return "eva:external-link-fill";
    }
    return "eva:smartphone-fill";
  };

  return (
    <>
      <Button
        onClick={handleInstall}
        loading={isInstalling}
        style={getButtonStyles()}
        className={className}
        size={size}
      >
        <Iconify 
          icon={getButtonIcon()} 
          width={size === 'large' ? '24px' : size === 'small' ? '16px' : '20px'}
        />
        {showText && (
          <span style={{ 
            fontSize: size === 'large' ? '16px' : size === 'small' ? '12px' : '14px',
            lineHeight: 1 
          }}>
            {getButtonText()}
          </span>
        )}
      </Button>

      {/* Already Installed Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Iconify icon="eva:checkmark-circle-fill" width="24px" style={{ color: '#52c41a' }} />
            {t('pwa.alreadyInstalledTitle')}
          </div>
        }
        open={showAlreadyInstalledModal}
        onCancel={() => setShowAlreadyInstalledModal(false)}
        footer={[
          <Button 
            key="ok" 
            type="primary" 
            onClick={() => setShowAlreadyInstalledModal(false)}
            style={{
              background: 'linear-gradient(135deg, #1890ff, #40a9ff)',
              border: 'none'
            }}
          >
            {t('common.ok')}
          </Button>
        ]}
        width={400}
        centered
      >
        <div style={{ padding: '1rem 0' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>📱</div>
            <Text style={{ fontSize: '16px', color: '#0369a1' }}>
              {t('pwa.alreadyInstalledDesc')}
            </Text>
          </div>
          
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '6px',
            padding: '12px',
            borderLeft: '4px solid #0ea5e9'
          }}>
            <Text style={{ fontSize: '14px', color: '#0369a1' }}>
              {t('pwa.alreadyInstalledTip')}
            </Text>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PWAInstallButtonAlways; 