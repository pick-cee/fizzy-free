/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

// FIX: Import the necessary Workbox functions
import { precacheAndRoute } from 'workbox-precaching';

// This is the placeholder the build error is asking for.
// The PWA plugin will replace `self.__WB_MANIFEST` with a list of all your app's files (JS, CSS, etc.) to cache.
precacheAndRoute(self.__WB_MANIFEST);

// This event listener is required by the PWA plugin to manage updates.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Our custom notification click handler.
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
