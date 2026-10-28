import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// TechM4India HRMS — Independent Application Vite Configuration
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
  },
  server: {
    port: Number(process.env.PORT) || 3002,
    host: '0.0.0.0',
    strictPort: false,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'https://techm4india-erp-api-l1gv.onrender.com',
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
      'react': fs.existsSync(path.resolve(__dirname, 'node_modules/react'))
        ? path.resolve(__dirname, 'node_modules/react')
        : path.resolve(__dirname, '../../node_modules/react'),
      'react-dom': fs.existsSync(path.resolve(__dirname, 'node_modules/react-dom'))
        ? path.resolve(__dirname, 'node_modules/react-dom')
        : path.resolve(__dirname, '../../node_modules/react-dom'),
      'lucide-react': fs.existsSync(path.resolve(__dirname, 'node_modules/lucide-react'))
        ? path.resolve(__dirname, 'node_modules/lucide-react')
        : path.resolve(__dirname, '../../node_modules/lucide-react'),
      'next/link': path.resolve(__dirname, 'src/shims/next-link.tsx'),
      'next/navigation': path.resolve(__dirname, 'src/shims/next-navigation.tsx'),
      '@/lib': path.resolve(__dirname, '../../lib'),
      '@': path.resolve(__dirname, '../../'),
    },
    dedupe: ['react', 'react-dom', 'lucide-react'],
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    emptyOutDir: true,
  },
});
