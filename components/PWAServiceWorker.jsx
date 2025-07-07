'use client';

import { useEffect } from 'react';
import { message } from 'antd';

export default function PWAServiceWorker() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerServiceWorker = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none'
          });

          console.log('Service Worker registered successfully:', registration);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              console.log('📦 New service worker available');
              
              // Show update notification
              message.info({
                content: '🚀 Versiune nouă detectată! Se actualizează instant...',
                duration: 2,
                key: 'sw-update'
              });

              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('✅ New service worker installed, triggering update');
                  
                  // Show reload notification
                  message.success({
                    content: '⚡ Actualizare completă! Reîncărcare automată...',
                    duration: 1.5,
                    key: 'sw-reload'
                  });

                  // Auto-reload after a short delay
                  setTimeout(() => {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                  }, 1000);
                }
              });
            }
          });

          // Handle service worker updates
          let refreshing = false;
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
              console.log('🔄 Service worker updated, reloading page...');
              window.location.reload();
              refreshing = true;
            }
          });

          // Check for updates frequently (every 30 seconds) for instant deployment detection
          setInterval(() => {
            console.log('🔄 Verificare actualizări instant...');
            registration.update();
          }, 30 * 1000);

        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      };

      registerServiceWorker();
    }
  }, []);

  return null;
} 