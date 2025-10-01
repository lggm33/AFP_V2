// API Types - Request/Response interfaces

// Base API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Email Processing API
export interface ProcessEmailsRequest {
  user_id: string;
  email_account_id?: string;
  force_refresh?: boolean;
}

export interface ProcessEmailsResponse {
  processed_count: number;
  new_transactions: number;
  errors: string[];
  processing_time_ms: number;
}

// Transaction API
export interface CreateTransactionRequest {
  amount: number;
  currency: string;
  description: string;
  category?: string;
  transaction_date: string;
  metadata?: Record<string, any>;
}

export interface UpdateTransactionRequest {
  amount?: number;
  description?: string;
  category?: string;
  transaction_date?: string;
  is_verified?: boolean;
  metadata?: Record<string, any>;
}

export interface TransactionFilters {
  category?: string;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  is_verified?: boolean;
  search?: string;
}

// Budget API
export interface CreateBudgetCategoryRequest {
  name: string;
  color: string;
  icon?: string;
  monthly_limit?: number;
}

export interface UpdateBudgetCategoryRequest {
  name?: string;
  color?: string;
  icon?: string;
  monthly_limit?: number;
  is_active?: boolean;
}

export interface BudgetSummary {
  category_id: string;
  category_name: string;
  limit_amount: number;
  spent_amount: number;
  remaining_amount: number;
  percentage_used: number;
  is_over_budget: boolean;
}

// Auth API
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    full_name: string;
  };
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

// Email Account API
export interface ConnectEmailAccountRequest {
  provider: 'gmail' | 'outlook' | 'yahoo';
  authorization_code: string;
}

export interface EmailAccountResponse {
  id: string;
  email: string;
  provider: string;
  is_active: boolean;
  last_sync: string | null;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}
