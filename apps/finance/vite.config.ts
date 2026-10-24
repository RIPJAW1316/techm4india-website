import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3002,
    strictPort: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://techm4india-erp-api-l1gv.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 3002,
    strictPort: true,
  },
});
