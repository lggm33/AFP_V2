// Local copy of shared types for Railway deployment
// This avoids workspace dependency issues in Railway

// Base API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
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
