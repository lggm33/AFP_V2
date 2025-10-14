import { Button } from '@/components/ui/button';
import { useThemeContext } from './ThemeProvider';
import { Sun, Moon, Monitor } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

export function ThemeToggle({
  variant = 'ghost',
  size = 'icon',
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, setTheme, isDark } = useThemeContext();

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = [
      'light',
      'dark',
      'system',
    ];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className='h-4 w-4' />;
      case 'dark':
        return <Moon className='h-4 w-4' />;
      case 'system':
        return <Monitor className='h-4 w-4' />;
      default:
        return <Sun className='h-4 w-4' />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Tema Claro';
      case 'dark':
        return 'Tema Oscuro';
      case 'system':
        return 'Tema del Sistema';
      default:
        return 'Cambiar Tema';
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={cycleTheme}
      className='transition-colors'
      title={getLabel()}
    >
      {getIcon()}
      {showLabel && <span className='ml-2'>{getLabel()}</span>}
    </Button>
  );
}
