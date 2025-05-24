// Service worker para cache e funcionamento offline

const CACHE_NAME = 'eclesia-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/img/app_logo.jpeg',
  '/img/episcopal_logo.png'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Interceptação de requisições para servir do cache quando offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se encontrou no cache, retorna a resposta
        if (response) {
          return response;
        }

        // Faz uma cópia da requisição porque é um stream que só pode ser consumido uma vez
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then(response => {
            // Se não for uma resposta válida, apenas retorna
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona a resposta pois vai para o cache e para o navegador
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Para requisições de página que falham (offline), retorna a página offline
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            // Para outros tipos, retorna uma resposta vazia
            return new Response();
          });
      })
  );
});

// Atualização do Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Se o cache não estiver na whitelist, exclui
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Evento de push: exibe a notificação recebida
self.addEventListener('push', function(event) {
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: 'EclesIA', body: event.data.text() };
  }
  const title = data.title || 'EclesIA';
  const options = {
    body: data.body || '',
    icon: '/img/app_logo.jpeg',
    badge: '/img/app_logo.jpeg',
    data: data.url ? { url: data.url } : {},
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Evento de click na notificação: foca ou abre a URL
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification.data && event.notification.data.url;
  if (url) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(windowClients => {
        for (let client of windowClients) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});
