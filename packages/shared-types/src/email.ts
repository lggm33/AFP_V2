// Email processing and AI-related types

export enum EmailProvider {
  GMAIL = 'gmail',
  OUTLOOK = 'outlook',
  YAHOO = 'yahoo',
  IMAP = 'imap',
}

export interface EmailMessage {
  id: string;
  thread_id?: string;
  subject: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  date: string;
  body_text: string;
  body_html?: string;
  attachments?: EmailAttachment[];
  labels?: string[];
  is_read: boolean;
  is_important: boolean;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  mime_type: string;
  size: number;
  content_id?: string;
}

export interface EmailProcessingJob {
  id: string;
  user_id: string;
  email_account_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  messages_processed: number;
  transactions_found: number;
  errors: string[];
  started_at: string;
  completed_at?: string;
  processing_time_ms?: number;
}

export interface RegexPattern {
  id: string;
  name: string;
  description: string;
  pattern: string;
  flags: string;
  bank_name?: string;
  transaction_type: 'debit' | 'credit' | 'transfer';
  confidence_score: number;
  field_mappings: {
    amount?: string;
    description?: string;
    date?: string;
    merchant?: string;
    account?: string;
    reference?: string;
  };
  is_active: boolean;
  created_by: 'ai' | 'manual';
  usage_count: number;
  success_rate: number;
  created_at: string;
  updated_at: string;
}

export interface TransactionExtraction {
  email_id: string;
  pattern_id: string;
  extracted_data: {
    amount?: number;
    currency?: string;
    description?: string;
    date?: string;
    merchant?: string;
    account_info?: string;
    reference_number?: string;
    transaction_type?: 'debit' | 'credit' | 'transfer';
  };
  confidence_score: number;
  raw_matches: Record<string, string>;
  processing_notes?: string[];
}

export interface AIAnalysisRequest {
  email_content: string;
  email_subject: string;
  sender: string;
  existing_patterns?: RegexPattern[];
}

export interface AIAnalysisResponse {
  is_financial: boolean;
  confidence_score: number;
  suggested_patterns: {
    pattern: string;
    description: string;
    field_mappings: Record<string, string>;
    confidence: number;
  }[];
  extracted_transaction?: TransactionExtraction['extracted_data'];
  analysis_notes: string[];
}

export interface EmailSyncStatus {
  email_account_id: string;
  last_sync_at: string;
  next_sync_at: string;
  messages_synced: number;
  messages_processed: number;
  transactions_created: number;
  errors_count: number;
  is_syncing: boolean;
  sync_frequency: number; // minutes
}

export interface BankEmailTemplate {
  id: string;
  bank_name: string;
  sender_patterns: string[];
  subject_patterns: string[];
  body_patterns: RegexPattern[];
  supported_transaction_types: ('debit' | 'credit' | 'transfer')[];
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailProcessingStats {
  total_emails_processed: number;
  financial_emails_detected: number;
  transactions_extracted: number;
  accuracy_rate: number;
  processing_time_avg_ms: number;
  top_banks: {
    name: string;
    count: number;
    accuracy: number;
  }[];
  error_categories: {
    type: string;
    count: number;
    examples: string[];
  }[];
}

// User feedback for improving AI
export interface TransactionFeedback {
  id: string;
  user_id: string;
  transaction_id: string;
  email_id: string;
  pattern_id?: string;
  feedback_type: 'correct' | 'incorrect' | 'partial' | 'missing';
  corrections?: {
    amount?: number;
    description?: string;
    category?: string;
    date?: string;
  };
  notes?: string;
  created_at: string;
}

export type EmailAccountStatus =
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'syncing'
  | 'rate_limited';
