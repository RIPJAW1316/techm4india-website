'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient, getApiBaseUrl, setSession } from '@/lib/auth-client';

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

    const currentSession = authClient.getSession();
    if (currentSession?.accessToken && !code) {
      setStatus('success');
      setTimeout(() => {
        const dest = window.location.pathname.startsWith('/hrms') ? '/hrms' : '/';
        router.push(dest);
      }, 500);
      return;
    }

    if (code) {
      const verifier = sessionStorage.getItem('tm4i_pkce_verifier') || params.get('code_verifier') || 'simulated-verifier-during-testing';
      const redirectUri = window.location.origin + window.location.pathname;
      const baseUrl = getApiBaseUrl();

      fetch(`${baseUrl}/api/v1/auth/oidc/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          client_id: 'hrms-app-client',
          code_verifier: verifier,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errBody = await res.json().catch(() => ({}));
            // If code was already redeemed or expired, check existing session
            if (currentSession?.accessToken) {
              return { access_token: currentSession.accessToken, id_token: '' };
            }
            throw new Error(errBody.message || `Token exchange failed with status ${res.status}`);
          }
          return res.json();
        })
        .then((tokens) => {
          setSession({
            accessToken: tokens.access_token,
            expiresIn: tokens.expires_in,
          });
          sessionStorage.removeItem('tm4i_pkce_verifier');

          // Clean sensitive URL params from history
          if (window.history?.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }

          setStatus('success');
          setTimeout(() => {
            const dest = window.location.pathname.startsWith('/hrms') ? '/hrms' : '/';
            router.push(dest);
          }, 600);
        })
        .catch((err) => {
          // If offline or simulation mode without live DB code
          if (currentSession?.accessToken) {
            setStatus('success');
            setTimeout(() => {
              const dest = window.location.pathname.startsWith('/hrms') ? '/hrms' : '/';
              router.push(dest);
            }, 500);
            return;
          }
          setStatus('error');
          setErrorMessage(err.message || 'Failed to exchange authorization code for session token.');
        });
    } else {
      const dest = window.location.pathname.startsWith('/hrms') ? '/hrms' : '/';
      router.push(dest);
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
            onClick={() => {
              const centralUrl = process.env.NEXT_PUBLIC_CENTRAL_AUTH_URL || 'http://localhost:3000/login';
              window.location.href = `${centralUrl}?app=hrms`;
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: 'var(--tm-red)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Authenticate via Central Portal
          </button>
        )}
      </div>
    </div>
  );
}
