// Transaction Constants and Helpers
import type {
  TransactionType,
  TransactionSubtype,
  TransactionStatus,
} from '../api/transactions';

// =====================================================================================
// TRANSACTION TYPE LABELS
// =====================================================================================

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  income: 'Ingreso',
  expense: 'Gasto',
  transfer: 'Transferencia',
};

export const TRANSACTION_TYPE_DESCRIPTIONS: Record<TransactionType, string> = {
  income: 'Dinero que entra a tus cuentas',
  expense: 'Dinero que sale de tus cuentas',
  transfer: 'Movimiento entre tus propias cuentas',
};

// =====================================================================================
// TRANSACTION SUBTYPE LABELS
// =====================================================================================

export const TRANSACTION_SUBTYPE_LABELS: Record<TransactionSubtype, string> = {
  purchase: 'Compra',
  payment: 'Pago',
  transfer_in: 'Transferencia Entrante',
  transfer_out: 'Transferencia Saliente',
  fee: 'Comisión',
  interest_charge: 'Cargo por Interés',
  interest_earned: 'Interés Ganado',
  refund: 'Reembolso',
  adjustment: 'Ajuste',
  cash_advance: 'Adelanto en Efectivo',
  reversal: 'Reversión',
  chargeback: 'Contracargo',
  cashback: 'Cashback',
  dividend: 'Dividendo',
  salary: 'Salario',
  deposit: 'Depósito',
  withdrawal: 'Retiro',
  bill_payment: 'Pago de Factura',
  subscription: 'Suscripción',
  installment: 'Cuota',
  other: 'Otro',
};

// =====================================================================================
// TRANSACTION STATUS LABELS
// =====================================================================================

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  pending: 'Pendiente',
  authorized: 'Autorizada',
  posted: 'Registrada',
  completed: 'Completada',
  reversed: 'Revertida',
  failed: 'Fallida',
  under_review: 'En Revisión',
};

export const TRANSACTION_STATUS_DESCRIPTIONS: Record<
  TransactionStatus,
  string
> = {
  pending: 'Transacción iniciada pero no procesada',
  authorized: 'Transacción autorizada pero no completada',
  posted: 'Transacción registrada en el sistema',
  completed: 'Transacción completada exitosamente',
  reversed: 'Transacción revertida o cancelada',
  failed: 'Transacción falló en el procesamiento',
  under_review: 'Transacción requiere revisión manual',
};

// =====================================================================================
// FORM OPTIONS HELPERS
// =====================================================================================

/**
 * Get transaction type options for form selects
 */
export function getTransactionTypeOptions(): Array<{
  value: TransactionType;
  label: string;
}> {
  return Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => ({
    value: value as TransactionType,
    label,
  }));
}

/**
 * Get transaction subtype options for form selects
 */
export function getTransactionSubtypeOptions(): Array<{
  value: TransactionSubtype;
  label: string;
}> {
  return Object.entries(TRANSACTION_SUBTYPE_LABELS).map(([value, label]) => ({
    value: value as TransactionSubtype,
    label,
  }));
}

/**
 * Get transaction status options for form selects
 */
export function getTransactionStatusOptions(): Array<{
  value: TransactionStatus;
  label: string;
}> {
  return Object.entries(TRANSACTION_STATUS_LABELS).map(([value, label]) => ({
    value: value as TransactionStatus,
    label,
  }));
}

/**
 * Get filtered transaction subtype options based on transaction type
 */
export function getTransactionSubtypeOptionsByType(
  transactionType: TransactionType
): Array<{
  value: TransactionSubtype;
  label: string;
}> {
  // Define which subtypes are appropriate for each transaction type
  const subtypesByType: Record<TransactionType, TransactionSubtype[]> = {
    income: [
      'salary',
      'dividend',
      'interest_earned',
      'cashback',
      'refund',
      'deposit',
      'transfer_in',
      'other',
    ],
    expense: [
      'purchase',
      'payment',
      'bill_payment',
      'subscription',
      'fee',
      'interest_charge',
      'cash_advance',
      'withdrawal',
      'installment',
      'transfer_out',
      'other',
    ],
    transfer: ['transfer_in', 'transfer_out', 'adjustment', 'other'],
  };

  const availableSubtypes = subtypesByType[transactionType] || [];

  return availableSubtypes.map(subtype => ({
    value: subtype,
    label: TRANSACTION_SUBTYPE_LABELS[subtype],
  }));
}
