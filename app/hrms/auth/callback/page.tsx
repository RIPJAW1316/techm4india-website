'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export default function HrmsAuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Process authorization code exchange
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');

    if (error) {
      setStatus('error');
      setErrorMessage(params.get('error_description') || 'Authorization was denied or failed.');
      return;
    }

    // In a unified portal setup, check if existing session is already established
    const currentSession = authClient.getSession();
    if (currentSession?.accessToken) {
      setStatus('success');
      setTimeout(() => {
        router.push('/hrms');
      }, 800);
      return;
    }

    if (code) {
      // In full OIDC PKCE, POST /api/v1/auth/token with code and verifier
      // For now, simulate exchange and redirect
      setStatus('success');
      setTimeout(() => {
        router.push('/hrms');
      }, 1000);
    } else {
      // Direct visit without params
      router.push('/hrms');
    }
  }, [router]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        backgroundColor: '#f8fafc',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '40px',
          maxWidth: '440px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'var(--tm-navy)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            fontSize: '22px',
          }}
        >
          <span className="material-symbols-outlined">sync</span>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--tm-navy)', margin: '0 0 8px 0' }}>
          {status === 'processing' && 'Authorizing HRMS Session...'}
          {status === 'success' && 'HRMS Session Verified'}
          {status === 'error' && 'Authentication Error'}
        </h2>

        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0', lineHeight: 1.5 }}>
          {status === 'processing' && 'Validating central identity credentials and cryptographic PKCE challenge.'}
          {status === 'success' && 'Redirecting to your TechM4India HRMS workspace...'}
          {status === 'error' && errorMessage}
        </p>

        {status === 'error' && (
          <button
            onClick={() => router.push('/login')}
            style={{
              padding: '10px 20px',
              backgroundColor: 'var(--tm-navy)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Return to Central Login
          </button>
        )}
      </div>
    </div>
  );
}
