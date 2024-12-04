import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        client: resolve(__dirname, 'src/entry-client.tsx')
      },
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'framework': ['@tanstack/react-query']
        }
      }
    },
    // Enable module splitting
    modulePreload: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production debugging
    sourcemap: true
  },
  optimizeDeps: {
    include: ['@tanstack/react-query'],
    exclude: ['@swc/core']
  },
  esbuild: {
    // Use top-level await
    target: 'esnext',
    // Enable JSX runtime
    jsxInject: `import React from 'react'`
  },
  server: {
    // Enable HMR
    hmr: true,
    // Pre-bundle dependencies
    force: true,
    port: 3000,
    open: true
  }
});
