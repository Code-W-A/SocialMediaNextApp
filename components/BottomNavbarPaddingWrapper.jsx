"use client";
import React, { useEffect, useState } from 'react';
import useBottomNavbarHeight from '@/hooks/useBottomNavbarHeight';
import useIsMobile from '@/hooks/useIsMobile';
import paddingCss from '@/styles/bottomNavbarPadding.module.css';

const BottomNavbarPaddingWrapper = ({ 
  children, 
  useCSS = false, 
  className = '',
  style = {}
}) => {
  const { paddingBottom, hasBottomNavbar, height } = useBottomNavbarHeight();
  const isMobile = useIsMobile(1024);
  const [isIOS, setIsIOS] = useState(false);

  // Detect iOS
  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(iOS);
  }, []);

  // Use CSS-based solution for better performance
  if (useCSS) {
    return (
      <div 
        className={`${paddingCss.withBottomNavbarPaddingSmooth} ${className}`}
        style={style}
      >
        {children}
      </div>
    );
  }

  // Enhanced JavaScript-based solution with iOS fixes
  const calculatedPadding = hasBottomNavbar ? 
    Math.max(paddingBottom, isIOS ? 80 : 60) : 0;

  return (
    <div 
      className={className}
      style={{
        paddingBottom: `${calculatedPadding}px`,
        transition: 'padding-bottom 0.3s ease',
        minHeight: '100%',
        width: '100%',
        // iOS-specific fixes
        ...(isIOS && {
          paddingBottom: `${calculatedPadding}px`,
          WebkitOverflowScrolling: 'touch',
        }),
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default BottomNavbarPaddingWrapper; 