// ViLaw Service Worker
const CACHE_NAME = 'vilaw-next-v1.0.0';
const urlsToCache = [
  '/',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
  'https://unpkg.com/lucide@latest/dist/umd/lucide.js'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Failed to cache resources:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('googleapis.com') &&
      !event.request.url.includes('unpkg.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          console.log('Serving from cache:', event.request.url);
          return response;
        }

        console.log('Fetching from network:', event.request.url);
        return fetch(event.request).then((response) => {
          // Don't cache if not a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch((error) => {
        console.error('Fetch failed:', error);
        
        // Return offline fallback for HTML requests
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'vilaw-chat-sync') {
    event.waitUntil(syncChatMessages());
  }
});

async function syncChatMessages() {
  try {
    // Get stored offline messages
    const offlineMessages = await getOfflineMessages();
    
    // Send messages when online
    for (const message of offlineMessages) {
      await sendMessage(message);
    }
    
    // Clear offline storage
    await clearOfflineMessages();
    console.log('Offline messages synced successfully');
  } catch (error) {
    console.error('Failed to sync offline messages:', error);
  }
}

async function getOfflineMessages() {
  // Implementation would depend on your offline storage strategy
  return [];
}

async function sendMessage(message) {
  // Implementation would send message to your API
  console.log('Sending message:', message);
}

async function clearOfflineMessages() {
  // Clear offline message storage
  console.log('Cleared offline messages');
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Push message received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Bạn có thông báo mới từ ViLaw',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'vilaw-notification',
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Mở ViLaw',
        icon: '/icons/icon-32x32.png'
      },
      {
        action: 'close',
        title: 'Đóng',
        icon: '/icons/close-32x32.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('ViLaw', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Periodic background sync (experimental)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'vilaw-sync') {
    event.waitUntil(doPeriodicSync());
  }
});

async function doPeriodicSync() {
  try {
    console.log('Performing periodic sync...');
    // Sync data, update caches, etc.
  } catch (error) {
    console.error('Periodic sync failed:', error);
  }
}