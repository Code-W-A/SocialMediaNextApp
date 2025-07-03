"use client";
import { useState, useEffect } from 'react';
import useIsMobile from './useIsMobile';

export const useBottomNavbarHeight = () => {
  const [navbarHeight, setNavbarHeight] = useState(0);
  const isMobile = useIsMobile(1024); // BottomNavbar se afișează sub 1024px

  useEffect(() => {
    if (!isMobile) {
      setNavbarHeight(0);
      return;
    }

    const calculateNavbarHeight = () => {
      // Try multiple selectors to find the navbar
      const navbar = document.querySelector('[class*="BottomNavbar_wrapper"]') || 
                    document.querySelector('.BottomNavbar_wrapper') ||
                    document.querySelector('[data-testid="bottom-navbar"]');
      
      if (navbar) {
        const height = navbar.offsetHeight;
        setNavbarHeight(height);
      } else {
        // Fallback height calculation with iOS-specific adjustments
        const safeAreaInsetBottom = parseInt(
          getComputedStyle(document.documentElement)
            .getPropertyValue('env(safe-area-inset-bottom)') || '0px'
        );
        
        // Detect iOS device
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        
        // Use fallback values that match CSS
        let baseHeight = 60; // Reduced from 90 to match new CSS values
        
        if (window.innerWidth <= 480) {
          baseHeight = 50; // Even smaller for very small screens
        }
        
        // Add extra padding for iOS due to safe area issues
        if (isIOS) {
          baseHeight += 20;
        }
        
        setNavbarHeight(baseHeight + safeAreaInsetBottom);
      }
    };

    // Calculate on mount
    calculateNavbarHeight();

    // Recalculate on resize
    window.addEventListener('resize', calculateNavbarHeight);
    
    // Recalculate when viewport changes (mobile keyboard)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', calculateNavbarHeight);
    }

    return () => {
      window.removeEventListener('resize', calculateNavbarHeight);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', calculateNavbarHeight);
      }
    };
  }, [isMobile]);

  return {
    height: navbarHeight,
    paddingBottom: navbarHeight,
    hasBottomNavbar: isMobile && navbarHeight > 0
  };
};

export default useBottomNavbarHeight; 