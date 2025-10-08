// Email Account API Types
import type { Database } from '../database';
import type { Transaction } from './transactions';

// =====================================================================================
// DATABASE TYPES
// =====================================================================================

export type EmailAccount =
  Database['public']['Tables']['email_accounts']['Row'];
export type EmailAccountInsert =
  Database['public']['Tables']['email_accounts']['Insert'];
export type EmailAccountUpdate =
  Database['public']['Tables']['email_accounts']['Update'];

// =====================================================================================
// EMAIL ACCOUNT OPERATIONS
// =====================================================================================

export interface EmailAccountOperations {
  getUserEmailAccounts: (userId: string) => Promise<EmailAccount[]>;
  getEmailAccount: (accountId: string) => Promise<EmailAccount | null>;
  createEmailAccount: (
    emailAccount: EmailAccountInsert
  ) => Promise<EmailAccount>;
  updateEmailAccount: (
    accountId: string,
    updates: EmailAccountUpdate
  ) => Promise<EmailAccount>;
  deleteEmailAccount: (accountId: string) => Promise<void>;
}

// =====================================================================================
// EMAIL PROCESSING
// =====================================================================================

export interface EmailProcessingRequest {
  emailAccountId: string;
  forceSync?: boolean;
}

export interface EmailProcessingResponse {
  success: boolean;
  processedEmails: number;
  extractedTransactions: number;
  errors: string[];
  newTransactions: Transaction[];
}

export interface EmailSyncStatus {
  accountId: string;
  email_address: string;
  is_active: boolean;
  last_sync_at?: string;
  next_sync_at?: string;
  sync_frequency?: string;
  total_emails_processed: number;
  total_transactions_extracted: number;
  last_sync_status?: 'success' | 'error' | 'in_progress';
  last_error?: string;
}
