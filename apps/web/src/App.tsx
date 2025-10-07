import { useEffect } from 'react';
import { AppRouter } from '@/components/Router/AppRouter';
import { useAuthStore } from '@/stores/authStore';

export default function App() {
  const initialize = useAuthStore(state => state.initialize);
  const isInitialized = useAuthStore(state => state.initialized);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  return <AppRouter />;
}
