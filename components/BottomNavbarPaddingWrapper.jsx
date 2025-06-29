"use client";
import React from 'react';
import useBottomNavbarHeight from '@/hooks/useBottomNavbarHeight';
import useIsMobile from '@/hooks/useIsMobile';
import paddingCss from '@/styles/bottomNavbarPadding.module.css';

const BottomNavbarPaddingWrapper = ({ 
  children, 
  useCSS = false, 
  className = '',
  style = {}
}) => {
  const { paddingBottom, hasBottomNavbar } = useBottomNavbarHeight();
  const isMobile = useIsMobile(1024);

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

  // Use JavaScript-based solution for dynamic calculation
  return (
    <div 
      className={className}
      style={{
        paddingBottom: hasBottomNavbar ? `${paddingBottom}px` : '0px',
        transition: 'padding-bottom 0.3s ease',
        minHeight: '100%',
        width: '100%',
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default BottomNavbarPaddingWrapper; 