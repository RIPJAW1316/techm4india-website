import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// TechM4India HRMS — Independent Application Vite Configuration
export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.PORT) || 3002,
    host: '0.0.0.0',
    strictPort: false,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: Number(process.env.PORT) || 3002,
    host: '0.0.0.0',
  },
  resolve: {
    alias: {
      'next/link': path.resolve(__dirname, 'src/shims/next-link.tsx'),
      'next/navigation': path.resolve(__dirname, 'src/shims/next-navigation.tsx'),
      '@/lib': path.resolve(__dirname, '../../lib'),
      '@': path.resolve(__dirname, '../../'),
    },
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    emptyOutDir: true,
  },
});
