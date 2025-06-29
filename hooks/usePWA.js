'use client';

import { useState, useEffect } from 'react';

export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (typeof window !== 'undefined') {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isInApp = window.navigator.standalone === true;
        setIsInstalled(isStandalone || isInApp);
      }
    };

    // Check online status
    const checkOnlineStatus = () => {
      if (typeof window !== 'undefined') {
        setIsOnline(navigator.onLine);
      }
    };

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    checkInstalled();
    checkOnlineStatus();

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installation accepted');
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      } else {
        console.log('PWA installation dismissed');
        return false;
      }
    } catch (error) {
      console.error('PWA installation failed:', error);
      return false;
    }
  };

  const shareApp = async (data = {}) => {
    const shareData = {
      title: 'Destiny - Social Media App',
      text: 'Găsește-ți jumătatea perfectă cu Destiny!',
      url: window.location.origin,
      ...data
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return true;
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareData.url);
        return true;
      }
    } catch (error) {
      console.error('Sharing failed:', error);
      return false;
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      return 'not-supported';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      console.error('Notification permission request failed:', error);
      return 'denied';
    }
  };

  const showNotification = (title, options = {}) => {
    if (Notification.permission !== 'granted') {
      return false;
    }

    const defaultOptions = {
      icon: '/images/destiny-logo.svg',
      badge: '/images/logo.png',
      vibrate: [100, 50, 100],
      ...options
    };

    try {
      new Notification(title, defaultOptions);
      return true;
    } catch (error) {
      console.error('Notification failed:', error);
      return false;
    }
  };

  return {
    isInstalled,
    isInstallable,
    isOnline,
    installApp,
    shareApp,
    requestNotificationPermission,
    showNotification,
    canInstall: isInstallable && !isInstalled
  };
} 