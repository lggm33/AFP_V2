// AFP Finance App - Frontend Entry Point (Minimal Version)
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

console.log('🚀 AFP Finance Web App starting...');
console.log('📅 Deployment time:', new Date().toISOString());

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
