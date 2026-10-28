import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
// TechM4India CRM — Independent Application Vite Configuration
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
  },
  server: {
    port: Number(process.env.PORT) || 3003,
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
    port: Number(process.env.PORT) || 3003,
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
