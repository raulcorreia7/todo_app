import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    solid(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'sounds/*.mp3'],
      manifest: {
        name: 'Luxury Todo',
        short_name: 'Todo',
        description: 'Premium todo app with gamification',
        theme_color: '#0c4a3e',
        background_color: '#0c4a3e',
        display: 'standalone',
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
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3}'],
        maximumFileSizeToCacheInBytes: 5242880
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          solid: ['solid-js'],
          solidStore: ['solid-js/store'],
          solidWeb: ['solid-js/web'],
        },
      },
    },
  },
})
