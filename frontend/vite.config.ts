import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'img/episcopal_logo.png', 'img/episcopal_logo192.png', 'img/episcopal_logo512.png'],
      manifest: {
        name: 'EclesIA - Assistente da Igreja Episcopal',
        short_name: 'EclesIA',
        description: 'Assistente da Igreja Episcopal Carismática do Brasil',
        theme_color: '#5C3D2E',
        background_color: '#F5F5F0',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          },
          {
            src: 'img/episcopal_logo192.png',
            type: 'image/png',
            sizes: '192x192',
            purpose: 'any maskable'
          },
          {
            src: 'img/episcopal_logo512.png',
            type: 'image/png',
            sizes: '512x512',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
