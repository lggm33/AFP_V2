// AFP Finance App - Frontend Entry Point
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import { useAuthStore } from '@/stores/authStore';
import '@/index.css';

// Initialize auth store
const initializeApp = async () => {
  try {
    await useAuthStore.getState().initialize();
  } catch (error) {
    console.error('❌ Error initializing auth store:', error);
  }
};

// Start the app
initializeApp();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
