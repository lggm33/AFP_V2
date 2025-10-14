import { AuthProvider } from '@/auth';
import { AppRouter } from '@/components/Router/AppRouter';
import { ThemeProvider } from '@/components/Theme';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  );
}
