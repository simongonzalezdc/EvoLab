import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    // Disable sourcemaps in production to reduce bundle size
    sourcemap: false,
    // Add bundle size limits
    chunkSizeWarningLimit: 500,
    // Configure code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'zustand'],
          'vendor-graphics': ['pixi.js', 'd3'],
          'vendor-audio': ['tone'],
          'vendor-data': ['dexie'],
        },
      },
    },
  },
});
