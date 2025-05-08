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
