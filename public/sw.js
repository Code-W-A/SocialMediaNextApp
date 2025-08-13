// Simplified versioning - minimal caching for instant updates
const APP_VERSION = '20250103-3';
const OFFLINE_CACHE = `destiny-offline-${APP_VERSION}`;
const IMAGES_CACHE = `destiny-images-${APP_VERSION}`;

// Only cache essentials for offline - no HTML/JS/CSS caching for instant updates
const OFFLINE_ESSENTIALS = [
  '/offline',
  '/images/sigla-512.png',
  '/images/placeholder-avatar.png',
  '/manifest.json'
];

// Install event - cache only offline essentials
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker: Installing with instant update strategy...');
  event.waitUntil(
    caches.open(OFFLINE_CACHE)
      .then((cache) => {
        console.log('📦 Service Worker: Caching offline essentials only');
        return cache.addAll(OFFLINE_ESSENTIALS);
      })
      .then(() => {
        console.log('⚡ Service Worker: Skip waiting for instant activation');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Cache failed', error);
      })
  );
});

// Activate event - clean up old caches and claim clients immediately
self.addEventListener('activate', (event) => {
  console.log('🔥 Service Worker: Activating with instant takeover...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== OFFLINE_CACHE && cacheName !== IMAGES_CACHE) {
              console.log('🗑️ Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('👑 Service Worker: Taking control immediately');
        return self.clients.claim();
      })
  );
});

// Fetch event - NETWORK FIRST strategy for instant updates
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Special handling for images - cache for performance (REVERT TO ORIGINAL)
  if (request.destination === 'image') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache images for better performance
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(IMAGES_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cached image or placeholder
          return caches.match(request)
            .then((cachedResponse) => {
              return cachedResponse || caches.match('/images/placeholder-avatar.png');
            });
        })
    );
    return;
  }

  // NETWORK FIRST for all other requests (HTML, JS, CSS, API)
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Always return fresh network response
        console.log(`🌐 Fresh from network: ${url.pathname}`);
        return response;
      })
      .catch(() => {
        console.log(`📱 Network failed, trying cache: ${url.pathname}`);
        
        // Only fallback to cache for critical offline resources
        if (request.destination === 'document') {
          return caches.match('/offline') || new Response('Offline - please check your connection');
        }
        
        // For other resources, return a minimal fallback
        return new Response('Network unavailable', { 
          status: 503,
          statusText: 'Service Unavailable' 
        });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle offline actions when back online
      handleBackgroundSync()
    );
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'Ai primit o notificare nouă!',
    icon: '/images/sigla-512.png',
    badge: '/images/sigla-512.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Vezi',
        icon: '/images/sigla-512.png'
      },
      {
        action: 'close',
        title: 'Închide',
        icon: '/images/sigla-512.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Destiny', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  console.log('📨 [SW] Received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⏩ [SW] Skip waiting requested');
    self.skipWaiting();
  }
  
  // Handle cache clearing request from ErrorBoundary
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('🧹 [SW] Cache clear requested from ErrorBoundary');
    clearAllCaches().then(() => {
      console.log('✅ [SW] All caches cleared successfully');
      // Send confirmation back to main thread
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ type: 'CACHE_CLEARED', success: true });
      }
    }).catch((error) => {
      console.error('❌ [SW] Failed to clear caches:', error);
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ type: 'CACHE_CLEARED', success: false, error: error.message });
      }
    });
  }
});

// Function to clear all caches
async function clearAllCaches() {
  try {
    console.log('🧹 [SW] Starting comprehensive cache clearing...');
    
    // Get all cache names
    const cacheNames = await caches.keys();
    console.log('📋 [SW] Found caches:', cacheNames);
    
    // Delete all caches
    const deletePromises = cacheNames.map(async (cacheName) => {
      console.log(`🗑️ [SW] Deleting cache: ${cacheName}`);
      return caches.delete(cacheName);
    });
    
    await Promise.all(deletePromises);
    console.log('✅ [SW] All caches deleted successfully');
    
    return true;
  } catch (error) {
    console.error('❌ [SW] Error clearing caches:', error);
    throw error;
  }
}

// Helper function for background sync
async function handleBackgroundSync() {
  try {
    // Handle any pending offline actions
    console.log('Service Worker: Handling background sync');
    // Implementation for offline actions would go here
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
} 