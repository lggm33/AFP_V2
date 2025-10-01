// AFP Finance App - Main App Component (Minimal Version)
import React from 'react';

export function App() {
  const [status] = React.useState('✅ Web App is running!');

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#1f2937',
          marginBottom: '1rem'
        }}>
          AFP Finance App
        </h1>
        <p style={{ 
          color: '#6b7280',
          marginBottom: '1rem'
        }}>
          Personal Finance with AI-Powered Email Analysis
        </p>
        <div style={{
          padding: '1rem',
          backgroundColor: '#f0fdf4',
          borderRadius: '4px',
          border: '1px solid #bbf7d0'
        }}>
          <p style={{ color: '#166534', fontWeight: '500' }}>
            {status}
          </p>
          <p style={{ color: '#166534', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Version: 1.0.0 | Deployment: Railway
          </p>
        </div>
      </div>
    </div>
  );
}
