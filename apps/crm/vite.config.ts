import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {
  initialAccounts,
  initialCallLogs,
  initialCampaigns,
  initialContacts,
  initialDeals,
  initialInvoices,
  initialLeads,
  initialMeetings,
  initialQuotes,
  initialTasks,
} from './src/mock/crm-data';

// TechM4India CRM — Resilient Dev API Middleware Plugin
// Intercepts /api/v1/crm/*, /api/v1/institutions, and /api/v1/finance/invoices to return instant HTTP 200 responses
function crmDevApiPlugin(): Plugin {
  return {
    name: 'crm-dev-mock-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const rawUrl = req.url || '';
        const url = rawUrl.split('?')[0];

        if (url.startsWith('/api/v1/crm') || url.startsWith('/api/v1/institutions') || url === '/api/v1/finance/invoices') {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;

          if (url === '/api/v1/crm/leads') {
            if (req.method === 'POST') {
              res.statusCode = 201;
              res.end(JSON.stringify({ success: true, message: 'Lead created successfully', data: initialLeads[0] }));
              return;
            }
            res.end(JSON.stringify({ success: true, data: initialLeads }));
            return;
          }

          if (url.startsWith('/api/v1/crm/leads/') && url.endsWith('/convert')) {
            res.end(JSON.stringify({ success: true, message: 'Lead converted successfully' }));
            return;
          }

          if (url === '/api/v1/crm/deals') {
            if (req.method === 'POST') {
              res.statusCode = 201;
              res.end(JSON.stringify({ success: true, message: 'Deal created', data: initialDeals[0] }));
              return;
            }
            res.end(JSON.stringify({ success: true, data: initialDeals }));
            return;
          }

          if (url.startsWith('/api/v1/crm/deals/') && url.endsWith('/stage')) {
            res.end(JSON.stringify({ success: true, message: 'Deal stage updated' }));
            return;
          }

          if (url === '/api/v1/crm/accounts' || url === '/api/v1/institutions') {
            res.end(JSON.stringify({ success: true, data: initialAccounts }));
            return;
          }

          if (url === '/api/v1/crm/contacts') {
            res.end(JSON.stringify({ success: true, data: initialContacts }));
            return;
          }

          if (url === '/api/v1/crm/quotes') {
            if (req.method === 'POST') {
              res.statusCode = 201;
              res.end(JSON.stringify({ success: true, message: 'Quote created', data: initialQuotes[0] }));
              return;
            }
            res.end(JSON.stringify({ success: true, data: initialQuotes }));
            return;
          }

          if (url.includes('/push-to-finance') || url === '/api/v1/finance/invoices/from-crm-quote') {
            res.end(
              JSON.stringify({
                success: true,
                message: 'Quote bridged to Finance ERP',
                invoiceNumber: 'INV-2026-00045',
              })
            );
            return;
          }

          if (url === '/api/v1/crm/activities') {
            res.end(JSON.stringify({ success: true, data: initialTasks }));
            return;
          }

          if (url === '/api/v1/crm/reports/summary') {
            res.end(
              JSON.stringify({
                success: true,
                data: {
                  totalLeads: initialLeads.length,
                  totalDeals: initialDeals.length,
                  wonDealsCount: initialDeals.filter((d) => d.stage === 'CLOSED_WON').length,
                  totalPipelineValue: initialDeals.reduce((s, d) => s + d.amount, 0),
                  totalWonRevenue: initialDeals
                    .filter((d) => d.stage === 'CLOSED_WON')
                    .reduce((s, d) => s + d.amount, 0),
                  winRatePercentage: 40,
                  averageDealSize: 1800000,
                },
              })
            );
            return;
          }

          if (url === '/api/v1/finance/invoices') {
            res.end(JSON.stringify({ success: true, data: initialInvoices }));
            return;
          }
        }

        next();
      });
    },
  };
}

// TechM4India CRM — Independent Application Vite Configuration
export default defineConfig({
  plugins: [react(), crmDevApiPlugin()],
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
