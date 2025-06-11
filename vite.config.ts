import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // FIX: Change strategy to 'injectManifest' to use our own service worker logic
      strategies: 'injectManifest',
      // FIX: Point to our custom service worker file
      srcDir: 'src',
      filename: 'sw.ts',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'Fizzy Free Journey',
        short_name: 'Fizzy Free',
        description: 'An application to help you quit fizzy drinks and track your progress.',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })

  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
