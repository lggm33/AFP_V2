// AFP Finance App - Frontend Entry Point
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// Import shared types to test path mapping
import type { User } from '@afp/shared-types';

// Test type usage
const testUser: User = {
  id: '1',
  email: 'test@example.com',
  full_name: 'Test User',
  email_verified: true,
  phone_verified: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_login: new Date().toISOString()
};

console.log('Test user:', testUser);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
