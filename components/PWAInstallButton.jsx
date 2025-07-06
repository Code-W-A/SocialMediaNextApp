"use client";
import React, { useState, useEffect } from "react";
import { Button, Typography, message } from "antd";
import Iconify from "./Iconify";
import { usePWA } from "@/hooks/usePWA";
import { useLanguage } from "@/lib/i18n";

const { Text } = Typography;

const PWAInstallButton = ({ 
  variant = "primary", 
  size = "default", 
  showText = true,
  style = {},
  className = ""
}) => {
  const { canInstall, installApp, isInstalled } = usePWA();
  const { t } = useLanguage();
  const [isInstalling, setIsInstalling] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  // Detect Android device
  useEffect(() => {
    const checkAndroid = () => {
      if (typeof window !== 'undefined') {
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isAndroidDevice = userAgent.includes('android');
        setIsAndroid(isAndroidDevice);
      }
    };

    checkAndroid();
  }, []);

  // Don't show button if PWA is already installed, not installable, or not Android
  if (isInstalled || !canInstall || !isAndroid) {
    return null;
  }

  const handleInstall = async () => {
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

  return (
    <Button
      onClick={handleInstall}
      loading={isInstalling}
      style={getButtonStyles()}
      className={className}
      size={size}
    >
      <Iconify 
        icon="eva:smartphone-fill" 
        width={size === 'large' ? '24px' : size === 'small' ? '16px' : '20px'}
      />
      {showText && (
        <span style={{ 
          fontSize: size === 'large' ? '16px' : size === 'small' ? '12px' : '14px',
          lineHeight: 1 
        }}>
          {t('pwa.installApp')}
        </span>
      )}
    </Button>
  );
};

export default PWAInstallButton; 