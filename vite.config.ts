import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'DeCA',
        short_name: 'DeCA',
        description: 'Documento electrónico de Control Administrativo',
        theme_color: '#C0090E',
        background_color: '#F5F5F5',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // The app shell (HTML/JS/CSS/icons) is precached so the app opens
        // instantly and works even through a brief connectivity drop.
        // Firestore/Storage requests are deliberately left alone here —
        // they're either a streaming channel (not cacheable this way) or
        // need to hit the network anyway to actually create a DeCA — see
        // AuthContext's Firestore persistence for the part of "offline"
        // that's real (reading previously-loaded data).
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
