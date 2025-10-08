// Common API Types and Response Wrappers

// =====================================================================================
// API RESPONSE WRAPPERS
// =====================================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// =====================================================================================
// COMMON FILTER TYPES
// =====================================================================================

export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

export interface SearchFilter {
  search?: string;
}

export interface StatusFilter<T extends string> {
  status?: T;
}

// =====================================================================================
// COMMON REQUEST TYPES
// =====================================================================================

export interface UserContextRequest {
  userId: string;
}

export interface MonthContextRequest extends UserContextRequest {
  month: string; // YYYY-MM format
}
