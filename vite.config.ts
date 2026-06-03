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
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('/react') || id.includes('react-dom') || id.includes('zustand')) return 'vendor-react';
          if (id.includes('pixi.js') || id.includes('/d3')) return 'vendor-graphics';
          if (id.includes('/tone')) return 'vendor-audio';
          if (id.includes('/dexie')) return 'vendor-data';
          return undefined;
        },
      },
    },
  },
});
