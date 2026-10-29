import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center'
      }}
    >
      <div
        style={{
          fontSize: '5rem',
          fontWeight: 800,
          color: '#4f46e5',
          lineHeight: 1,
          marginBottom: '16px'
        }}
      >
        404
      </div>
      <h2 style={{ fontSize: '1.75rem', marginBottom: '12px' }}>Page Not Found</h2>
      <p style={{ color: '#64748b', maxWidth: '420px', marginBottom: '28px' }}>
        The page you are looking for does not exist or has been moved to another location.
      </p>
      <Link to="/" className="btn btn-primary">
        ← Return to Home
      </Link>
    </div>
  );
};

export default NotFound;
