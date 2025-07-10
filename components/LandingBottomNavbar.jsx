"use client";
import React, { useState, useEffect } from "react";
import { Typography } from "antd";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import Iconify from "./Iconify";

const LandingBottomNavbar = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [theme, setTheme] = useState('light'); // Default to light theme for landing page
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Check if user prefers dark mode
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    // Listen for theme changes
    const themeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e) => setTheme(e.matches ? 'dark' : 'light');
    themeQuery.addEventListener('change', handleThemeChange);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
      themeQuery.removeEventListener('change', handleThemeChange);
    };
  }, []);

  // Only show on mobile
  if (!mounted || !isMobile) return null;

  const handleContactClick = () => {
    router.push('/public-contact');
  };

  const activeColor = "var(--primary)"; // Always use primary color (golden) to stand out

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: '#ffffff',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(0, 0, 0, 0.1)',
      padding: '12px 0 max(12px, env(safe-area-inset-bottom))',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)'
    }}>
      <div
        onClick={handleContactClick}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        onTouchStart={(e) => {
          setIsPressed(true);
          e.currentTarget.style.opacity = '0.7';
        }}
        onTouchEnd={(e) => {
          setIsPressed(false);
          e.currentTarget.style.opacity = '1';
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          padding: '8px 16px',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          background: 'transparent',
          minWidth: '80px',
          position: 'relative'
        }}
        role="button"
        tabIndex={0}
        aria-label={t('landing.contactSupport')}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <Iconify 
            icon="eva:email-fill" 
            width="24px" 
            style={{ color: activeColor }}
          />
          {isPressed && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--primary)',
              opacity: 0.1,
              zIndex: -1
            }} />
          )}
        </div>
        <Typography.Text 
          style={{ 
            color: activeColor,
            fontSize: '12px',
            fontWeight: '500',
            textAlign: 'center',
            lineHeight: '1.2'
          }}
        >
          {t('landing.contactSupport')}
        </Typography.Text>
      </div>
    </div>
  );
};

export default LandingBottomNavbar; 