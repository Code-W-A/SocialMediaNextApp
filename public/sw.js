const CACHE_NAME = 'destiny-pwa-v1';
const STATIC_CACHE_NAME = 'destiny-static-v1';
const DYNAMIC_CACHE_NAME = 'destiny-dynamic-v1';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/images/sigla-512.png',
  '/images/auth.png',
  '/images/comunity.jpg',
  '/images/landing-page.jpg',
  '/images/placeholder-avatar.png',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Skip waiting');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response for caching
          const responseClone = response.clone();
          
          // Cache successful GET requests
          if (request.method === 'GET' && response.status === 200) {
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          
          return response;
        })
        .catch(() => {
          // Return cached version if available
          return caches.match(request);
        })
    );
    return;
  }

  // Handle static assets and pages
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Only cache GET requests
            if (request.method !== 'GET') {
              return response;
            }

            // Clone response for caching
            const responseToCache = response.clone();

            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.destination === 'document') {
              return caches.match('/offline');
            }
            
            // Return placeholder for images
            if (request.destination === 'image') {
              return caches.match('/images/placeholder-avatar.png');
            }
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