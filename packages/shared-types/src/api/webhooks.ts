// Webhook Types
import type { BudgetAlert, BudgetWithCategory } from './budgets';

// =====================================================================================
// WEBHOOK PAYLOAD BASE
// =====================================================================================

export interface WebhookPayload {
  type:
    | 'transaction_created'
    | 'transaction_updated'
    | 'budget_alert'
    | 'email_processed'
    | 'recurring_detected'
    | 'payment_method_created'
    | 'payment_method_updated';
  userId: string;
  data: Record<string, unknown>;
  timestamp: string;
}

// =====================================================================================
// TRANSACTION WEBHOOKS
// =====================================================================================

export interface TransactionCreatedPayload extends WebhookPayload {
  type: 'transaction_created';
  data: {
    transaction: unknown; // TransactionWithRelations
    isAutomatic: boolean;
    confidence?: number;
  };
}

export interface TransactionUpdatedPayload extends WebhookPayload {
  type: 'transaction_updated';
  data: {
    transactionId: string;
    changes: Record<string, unknown>;
  };
}

// =====================================================================================
// BUDGET WEBHOOKS
// =====================================================================================

export interface BudgetAlertPayload extends WebhookPayload {
  type: 'budget_alert';
  data: {
    alert: BudgetAlert;
    budget: BudgetWithCategory;
    currentSpent: number;
    percentage: number;
  };
}

// =====================================================================================
// EMAIL WEBHOOKS
// =====================================================================================

export interface EmailProcessedPayload extends WebhookPayload {
  type: 'email_processed';
  data: {
    emailAccountId: string;
    processedCount: number;
    transactionsCreated: number;
  };
}

// =====================================================================================
// RECURRING PATTERN WEBHOOKS
// =====================================================================================

export interface RecurringDetectedPayload extends WebhookPayload {
  type: 'recurring_detected';
  data: {
    pattern: {
      description: string;
      frequency: string;
      averageAmount: number;
      confidence: number;
    };
  };
}

// =====================================================================================
// PAYMENT METHOD WEBHOOKS
// =====================================================================================

export interface PaymentMethodCreatedPayload extends WebhookPayload {
  type: 'payment_method_created';
  data: {
    paymentMethodId: string;
    account_type: string;
    is_primary: boolean;
  };
}

export interface PaymentMethodUpdatedPayload extends WebhookPayload {
  type: 'payment_method_updated';
  data: {
    paymentMethodId: string;
    changes: Record<string, unknown>;
  };
}
