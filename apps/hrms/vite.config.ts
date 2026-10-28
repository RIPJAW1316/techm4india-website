import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {
  initialAnnouncements,
  initialAttendance,
  initialClaims,
  initialEmployees,
  initialHolidays,
  initialLeaveApplications,
  initialLeaveBalances,
  initialPayrollRecords,
} from './src/mock/hrms-data';

// TechM4India HRMS — Mock Dev API Middleware Plugin
// Intercepts /api/v1/hrms/* to return instant HTTP 200 responses during local development
function hrmsDevApiPlugin(): Plugin {
  return {
    name: 'hrms-dev-mock-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const rawUrl = req.url || '';
        const url = rawUrl.split('?')[0];

        if (url.startsWith('/api/v1/hrms')) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;

          if (url === '/api/v1/hrms/dashboard/summary') {
            res.end(
              JSON.stringify({
                success: true,
                data: {
                  overview: {
                    totalEmployees: initialEmployees.length,
                    presentToday: initialEmployees.length - 1,
                    onLeaveToday: 1,
                    attendanceRate: '96.2%',
                    pendingApprovals: {
                      leaves: initialLeaveApplications.filter((l) => l.status === 'PENDING').length,
                      claims: initialClaims.filter((c) => c.status === 'SUBMITTED').length,
                    },
                  },
                  todayAttendance: initialAttendance,
                  holidays: initialHolidays,
                  announcements: initialAnnouncements,
                  leaveBalances: initialLeaveBalances,
                },
              }),
            );
            return;
          }

          if (url === '/api/v1/hrms/attendance/today') {
            res.end(JSON.stringify({ success: true, data: initialAttendance }));
            return;
          }

          if (url === '/api/v1/hrms/attendance/clock-in' || url === '/api/v1/hrms/attendance/clock-out') {
            res.end(JSON.stringify({ success: true, data: { ...initialAttendance, clockInTime: '09:00 AM' } }));
            return;
          }

          if (url === '/api/v1/hrms/attendance/regularize') {
            res.end(JSON.stringify({ success: true, data: { regularized: true } }));
            return;
          }

          if (url === '/api/v1/hrms/employees') {
            res.end(JSON.stringify({ success: true, data: initialEmployees }));
            return;
          }

          if (url === '/api/v1/hrms/leave/applications') {
            res.end(JSON.stringify({ success: true, data: initialLeaveApplications }));
            return;
          }

          if (url.startsWith('/api/v1/hrms/leave/applications/') && url.endsWith('/review')) {
            res.end(JSON.stringify({ success: true, data: { status: 'APPROVED' } }));
            return;
          }

          if (url === '/api/v1/hrms/leave/balances') {
            res.end(JSON.stringify({ success: true, data: initialLeaveBalances }));
            return;
          }

          if (url === '/api/v1/hrms/payroll/records') {
            res.end(JSON.stringify({ success: true, data: initialPayrollRecords }));
            return;
          }

          if (url === '/api/v1/hrms/claims') {
            res.end(JSON.stringify({ success: true, data: initialClaims }));
            return;
          }

          if (url.startsWith('/api/v1/hrms/claims/') && (url.endsWith('/review') || url.endsWith('/settle'))) {
            res.end(JSON.stringify({ success: true, data: { status: 'SETTLED' } }));
            return;
          }

          res.end(JSON.stringify({ success: true, data: [] }));
          return;
        }

        next();
      });
    },
  };
}

// TechM4India HRMS — Independent Application Vite Configuration
export default defineConfig({
  plugins: [hrmsDevApiPlugin(), react()],
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
        configure: (proxy) => {
          proxy.on('error', (_err, _req, res) => {
            if (res && 'writeHead' in res && !(res as any).headersSent) {
              (res as any).writeHead(502, { 'Content-Type': 'application/json' });
              (res as any).end(JSON.stringify({ error: 'Backend API unavailable. Using client fallback data.' }));
            }
          });
        },
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
