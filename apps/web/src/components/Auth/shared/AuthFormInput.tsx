import { useState } from 'react';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';

interface AuthFormInputProps {
  id: string;
  name: string;
  type: 'text' | 'email' | 'password';
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon: LucideIcon;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  showPasswordToggle?: boolean;
}

export function AuthFormInput({
  id,
  name,
  type,
  label,
  placeholder,
  value,
  onChange,
  icon: Icon,
  autoComplete,
  required = false,
  disabled = false,
  showPasswordToggle = false,
}: AuthFormInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = showPasswordToggle && showPassword ? 'text' : type;

  return (
    <div>
      <label
        htmlFor={id}
        className='block text-sm font-medium text-foreground mb-2'
      >
        {label}
      </label>
      <div className='relative'>
        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
          <Icon className='h-5 w-5 text-muted-foreground' />
        </div>
        <input
          id={id}
          name={name}
          type={inputType}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={e => onChange(e.target.value)}
          className='block w-full pl-12 pr-12 py-3 border border-input rounded-xl text-foreground placeholder-muted-foreground bg-background focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all'
          placeholder={placeholder}
          disabled={disabled}
        />
        {showPasswordToggle && (
          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className='absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground'
            disabled={disabled}
          >
            {showPassword ? (
              <EyeOff className='h-5 w-5' />
            ) : (
              <Eye className='h-5 w-5' />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
