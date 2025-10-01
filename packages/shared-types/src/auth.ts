// Authentication and authorization types

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  email_verified: boolean;
  phone?: string;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: 'bearer';
  user: User;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  GITHUB = 'github',
  APPLE = 'apple'
}

export interface OAuthProvider {
  provider: AuthProvider;
  redirect_url: string;
  scopes?: string[];
}

export interface PasswordResetRequest {
  email: string;
  redirect_url?: string;
}

export interface PasswordUpdateRequest {
  current_password: string;
  new_password: string;
}

export interface EmailUpdateRequest {
  new_email: string;
  password: string;
}

export interface ProfileUpdateRequest {
  full_name?: string;
  avatar_url?: string;
  phone?: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  currency: string;
  timezone: string;
  date_format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  number_format: 'US' | 'EU' | 'IN';
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    budget_alerts: boolean;
    transaction_updates: boolean;
    weekly_summary: boolean;
    monthly_report: boolean;
  };
  privacy: {
    profile_visibility: 'private' | 'public';
    data_sharing: boolean;
    analytics: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface AuthError {
  code: string;
  message: string;
  details?: {
    field?: string;
    constraint?: string;
  };
}

// JWT Token payload
export interface JWTPayload {
  sub: string; // user id
  email: string;
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  role?: string;
}

// Permission system (for future use)
export enum Permission {
  READ_TRANSACTIONS = 'read:transactions',
  WRITE_TRANSACTIONS = 'write:transactions',
  READ_BUDGETS = 'read:budgets',
  WRITE_BUDGETS = 'write:budgets',
  READ_EMAIL_ACCOUNTS = 'read:email_accounts',
  WRITE_EMAIL_ACCOUNTS = 'write:email_accounts',
  ADMIN = 'admin'
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  user_id: string;
  role_id: string;
  assigned_at: string;
  assigned_by: string;
}
