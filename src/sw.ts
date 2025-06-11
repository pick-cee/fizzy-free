// This is our new custom service worker file

/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

// This event listener is required by the PWA plugin to manage caching
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Our custom notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (const c of clientList) {
          if (c.focused) {
            client = c;
          }
        }
        return client.focus();
      }
      return self.clients.openWindow('/');
    })
  );
});