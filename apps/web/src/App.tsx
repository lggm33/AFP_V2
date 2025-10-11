import { useEffect } from 'react';
import { AppRouter } from '@/components/Router/AppRouter';
import { useAuthStore } from '@/stores/authStore';
import { SuspensionDetector } from '@/components/Auth/SuspensionDetector';

export default function App() {
  const initialize = useAuthStore(state => state.initialize);
  const isInitialized = useAuthStore(state => state.initialized);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  return (
    <SuspensionDetector
      inactivityCheckThresholdMinutes={30}
      checkIntervalMinutes={0.2}
    >
      <AppRouter />
    </SuspensionDetector>
  );
}
