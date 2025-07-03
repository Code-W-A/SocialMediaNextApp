"use client";
import React, { useState } from "react";
import { Button, Typography, message } from "antd";
import Iconify from "./Iconify";
import { usePWA } from "@/hooks/usePWA";

const { Text } = Typography;

const PWAInstallButton = ({ 
  variant = "primary", 
  size = "default", 
  showText = true,
  style = {},
  className = ""
}) => {
  const { canInstall, installApp, isInstalled } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);

  // Don't show button if PWA is already installed or not installable
  if (isInstalled || !canInstall) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    
    try {
      const success = await installApp();
      
      if (success) {
        message.success({
          content: "App instalată cu succes! O vei găsi pe ecranul principal.",
          duration: 5,
          icon: <Iconify icon="eva:checkmark-circle-fill" style={{ color: '#52c41a' }} />
        });
      } else {
        message.info({
          content: "Instalarea a fost anulată. Poți încerca din nou oricând!",
          duration: 3,
          icon: <Iconify icon="eva:info-fill" style={{ color: '#1890ff' }} />
        });
      }
    } catch (error) {
      console.error('PWA install error:', error);
      message.error({
        content: "A apărut o eroare la instalare. Te rugăm să încerci din nou.",
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
          Instalează App
        </span>
      )}
    </Button>
  );
};

export default PWAInstallButton; 