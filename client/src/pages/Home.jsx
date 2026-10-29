import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { checkHealth } from '../services/api.js';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [health, setHealth] = useState({ status: 'checking', database: 'checking' });

  useEffect(() => {
    checkHealth()
      .then((data) => setHealth(data))
      .catch(() => setHealth({ status: 'offline', database: 'offline' }));
  }, []);

  return (
    <div style={{ flex: 1, padding: '50px 0 80px' }}>
      <div className="container">
        {/* Hero Section */}
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 50px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#eef2ff',
              color: '#4f46e5',
              padding: '6px 16px',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '20px'
            }}
          >
            🎓 Node.js & React Lab Project Submission
          </div>

          <h1 style={{ fontSize: '2.75rem', marginBottom: '18px', color: '#0f172a', lineHeight: 1.2 }}>
            User Authentication System
          </h1>

          <p style={{ fontSize: '1.15rem', color: '#64748b', marginBottom: '32px' }}>
            A secure, full-stack demonstration featuring JSON Web Tokens (JWT), HttpOnly session
            cookies, bcrypt password hashing, double-submit CSRF defense, and persistent React state.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '1rem' }}>
                Go to Dashboard ({user?.name}) →
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '1rem' }}>
                  Create Account (Register)
                </Link>
                <Link to="/login" className="btn btn-secondary" style={{ padding: '12px 28px', fontSize: '1rem' }}>
                  Sign In (Login)
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Live API & Database Status Pill */}
        <div
          style={{
            maxWidth: '560px',
            margin: '0 auto 60px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: health.status === 'ok' ? '#10b981' : '#ef4444',
                display: 'inline-block'
              }}
            />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>
              Backend API Status:
            </span>
            <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 700, color: health.status === 'ok' ? '#059669' : '#dc2626' }}>
              {health.status}
            </span>
          </div>

          <div style={{ fontSize: '0.88rem', color: '#64748b' }}>
            Database: <strong style={{ color: health.database === 'connected' ? '#059669' : '#e11d48' }}>{health.database}</strong>
          </div>
        </div>

        {/* Feature Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}
        >
          <div className="dashboard-card">
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🛡️</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>HttpOnly Cookie Storage</h3>
            <p style={{ fontSize: '0.9rem' }}>
              Tokens are never exposed to JavaScript or stored in localStorage, neutralizing Cross-Site Scripting (XSS) token theft.
            </p>
          </div>

          <div className="dashboard-card">
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔒</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Bcrypt Password Hashing</h3>
            <p style={{ fontSize: '0.9rem' }}>
              Passwords are salted and securely hashed using 10 bcrypt work factor rounds prior to storage. Plaintext is never saved.
            </p>
          </div>

          <div className="dashboard-card">
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔄</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Persistent React Session</h3>
            <p style={{ fontSize: '0.9rem' }}>
              Protected routes verify authentication automatically on page refresh without token loss while cookie remains active.
            </p>
          </div>

          <div className="dashboard-card">
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⚡</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Rate Limiting & Helmet</h3>
            <p style={{ fontSize: '0.9rem' }}>
              Express endpoints are shielded with HTTP security headers and rate limits that protect against brute-force attacks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
