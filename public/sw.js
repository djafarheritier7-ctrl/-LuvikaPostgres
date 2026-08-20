// public/sw.js - VERSION FINALE CORRIGÉE
const CACHE_NAME = 'luvika-v5';
const OFFLINE_URL = '/offline.html';

// Ressources minimales à mettre en cache à l'installation
const CORE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/lo-192.png',
  '/icons/lo-512.png'
];

// 🚀 INSTALLATION
self.addEventListener('install', (event) => {
  console.log('[SW] Installation...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache des ressources de base');
        return Promise.allSettled(
          CORE_ASSETS.map(asset =>
            cache.add(new Request(asset, { credentials: 'same-origin' }))
              .catch(err => console.warn(`[SW] Échec cache ${asset}:`, err))
          )
        );
      })
      .then(() => {
        console.log('[SW] Installation terminée');
        return self.skipWaiting();
      })
  );
});

// 🔄 ACTIVATION
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log(`[SW] Suppression ancien cache: ${cacheName}`);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Prise de contrôle des clients');
        return self.clients.claim();
      })
  );
});

// 🌐 GESTION DES REQUÊTES
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ✅ Ignorer les requêtes non GET (POST, PUT, DELETE, etc.)
  if (request.method !== 'GET') {
    return; // laisse le navigateur gérer normalement
  }

  // Ignorer les requêtes non supportées
  if (
    request.url.startsWith('chrome-extension://') ||
    request.url.startsWith('chrome://') ||
    !request.url.startsWith(self.location.origin)
  ) {
    return;
  }

  // 📄 STRATÉGIE 1: Navigation (HTML) - Network first avec fallback offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Mettre en cache la page visitée
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, clonedResponse);
          });
          return response;
        })
        .catch(async () => {
          // Essayer de retrouver la page dans le cache
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Sinon afficher la page offline
          const offlineResponse = await caches.match(OFFLINE_URL);
          return offlineResponse || new Response(
            '<html><body><h1>Hors ligne</h1></body></html>',
            { 
              status: 503, 
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/html' }
            }
          );
        })
    );
    return;
  }

  // 🔌 STRATÉGIE 2: API - Network only avec fallback JSON
  if (request.url.includes('/api/') || request.url.includes('/_next/data/')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return new Response(
            JSON.stringify({ 
              error: 'offline', 
              message: 'Vous êtes hors ligne',
              timestamp: Date.now()
            }),
            { 
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // 📦 STRATÉGIE 3: Ressources statiques - Cache first avec mise à jour
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Mise à jour silencieuse en arrière-plan
          fetch(request)
            .then(networkResponse => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(request, networkResponse.clone());
                });
              }
            })
            .catch(() => {
              // Silencieux - on utilise la version en cache
            });
          
          return cachedResponse;
        }

        // Pas en cache, on va chercher sur le réseau
        return fetch(request)
          .then(networkResponse => {
            // Ne pas mettre en cache les réponses non-OK
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // Mettre en cache pour la prochaine fois
            const clonedResponse = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, clonedResponse);
            });

            return networkResponse;
          })
          .catch(() => {
            // Fallback pour les images
            if (request.destination === 'image') {
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#1e293b" width="200" height="200"/><text fill="#64748b" font-size="14" text-anchor="middle" x="100" y="100">Image hors ligne</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            }
            
            // Fallback par défaut
            return new Response('Ressource non disponible hors ligne', {
              status: 404,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// 🔔 NOTIFICATIONS PUSH
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Nouvelle notification LUVIKA',
      icon: '/icons/lo-192.png',
      badge: '/icons/lo-192.png',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/',
        ...data.data
      },
      actions: [
        { 
          action: 'open', 
          title: '👁️ Voir', 
          icon: '/icons/lo-72.png' 
        },
        { 
          action: 'close', 
          title: '❌ Fermer', 
          icon: '/icons/lo-72.png' 
        }
      ],
      tag: data.tag || 'default',
      renotify: true,
      requireInteraction: data.requireInteraction || false
    };

    event.waitUntil(
      self.registration.showNotification(
        data.title || 'LUVIKA',
        options
      )
    );
  } catch (error) {
    console.error('[SW] Erreur notification:', error);
  }
});

// 🖱️ CLIC SUR NOTIFICATION
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ 
      type: 'window',
      includeUncontrolled: true 
    })
    .then((clientList) => {
      // Chercher un onglet déjà ouvert
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // Sinon ouvrir un nouvel onglet
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
    .catch(error => {
      console.error('[SW] Erreur ouverture fenêtre:', error);
    })
  );
});

// 📡 GESTION DE LA CONNECTIVITÉ
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CHECK_ONLINE') {
    event.ports[0].postMessage({
      online: navigator.onLine,
      timestamp: Date.now()
    });
  }
});nçais