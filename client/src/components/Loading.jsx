import React from 'react';

const Loading = ({ message = 'Loading, please wait...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '280px',
        width: '100%',
        gap: '16px'
      }}
      role="status"
      aria-live="polite"
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '3.5px solid #e2e8f0',
          borderTopColor: '#4f46e5',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}
      />
      <p style={{ color: '#64748b', fontSize: '0.92rem', fontWeight: 500 }}>
        {message}
      </p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loading;
