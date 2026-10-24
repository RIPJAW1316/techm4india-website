import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('HRMS Root Error Caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '32px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '40px auto', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#c62d37', margin: '0 0 12px 0' }}>HRMS Application Error</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 16px 0' }}>An error occurred while rendering the HRMS workspace.</p>
          <pre style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '12px', overflowX: 'auto', color: '#0f172a' }}>
            {this.state.error?.message || String(this.state.error)}
          </pre>
          <button
            onClick={() => {
              sessionStorage.clear();
              window.location.href = '/';
            }}
            style={{ marginTop: '16px', padding: '8px 16px', background: '#1f2946', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
          >
            Reset Session &amp; Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
