import { AuthProvider } from '@/auth';
import { AppRouter } from '@/components/Router/AppRouter';

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
