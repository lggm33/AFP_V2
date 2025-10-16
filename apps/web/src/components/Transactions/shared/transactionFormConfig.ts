// Shared Transaction Form Configuration
import { type Database } from '@afp/shared-types';
import {
  TrendingDown,
  TrendingUp,
  ArrowLeftRight,
  ShoppingCart,
  Smartphone,
  Receipt,
  Briefcase,
  Undo2,
  Building2,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  CreditCard,
  Shield,
  BarChart3,
} from 'lucide-react';

// Types
type TransactionType = Database['public']['Enums']['transaction_type'];
type TransactionSubtype = Database['public']['Enums']['transaction_subtype'];
type TransactionStatus = Database['public']['Enums']['transaction_status'];

// Configuration data
export const transactionTypes: Array<{
  value: TransactionType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { value: 'expense', label: 'Gasto', icon: TrendingDown },
  { value: 'income', label: 'Ingreso', icon: TrendingUp },
  { value: 'transfer', label: 'Transferencia', icon: ArrowLeftRight },
];

export const transactionSubtypes: Array<{
  value: TransactionSubtype;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { value: 'purchase', label: 'Compra', icon: ShoppingCart },
  { value: 'payment', label: 'Pago', icon: CreditCard },
  { value: 'transfer_in', label: 'Transferencia Entrante', icon: TrendingUp },
  {
    value: 'transfer_out',
    label: 'Transferencia Saliente',
    icon: TrendingDown,
  },
  { value: 'fee', label: 'Comisión', icon: Building2 },
  { value: 'interest_charge', label: 'Cargo por Interés', icon: Building2 },
  { value: 'interest_earned', label: 'Interés Ganado', icon: TrendingUp },
  { value: 'refund', label: 'Reembolso', icon: Undo2 },
  { value: 'adjustment', label: 'Ajuste', icon: FileText },
  { value: 'cash_advance', label: 'Adelanto en Efectivo', icon: CreditCard },
  { value: 'reversal', label: 'Reversión', icon: Undo2 },
  { value: 'chargeback', label: 'Contracargo', icon: Undo2 },
  { value: 'cashback', label: 'Cashback', icon: TrendingUp },
  { value: 'dividend', label: 'Dividendo', icon: TrendingUp },
  { value: 'salary', label: 'Salario', icon: Briefcase },
  { value: 'deposit', label: 'Depósito', icon: TrendingUp },
  { value: 'withdrawal', label: 'Retiro', icon: TrendingDown },
  { value: 'bill_payment', label: 'Pago de Factura', icon: Receipt },
  { value: 'subscription', label: 'Suscripción', icon: Smartphone },
  { value: 'installment', label: 'Cuota', icon: BarChart3 },
  { value: 'other', label: 'Otro', icon: FileText },
];

export const transactionStatuses: Array<{
  value: TransactionStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { value: 'completed', label: 'Completada', icon: CheckCircle },
  { value: 'pending', label: 'Pendiente', icon: Clock },
  { value: 'authorized', label: 'Autorizada', icon: Shield },
  { value: 'posted', label: 'Registrada', icon: FileText },
  { value: 'reversed', label: 'Cancelada', icon: XCircle },
  { value: 'failed', label: 'Fallida', icon: AlertTriangle },
  { value: 'under_review', label: 'En Revisión', icon: Clock },
];

export const currencies = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'MXN', label: 'MXN ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CRC', label: 'CRC (₡)' },
];

// Transformation functions
export const transformPaymentMethods = (
  paymentMethods: Array<{
    id: string;
    name: string;
    institution_name: string;
    account_type: string;
  }>
) =>
  paymentMethods.map(pm => ({
    value: pm.id,
    label: `${pm.name} - ${pm.institution_name}`,
  }));

export const transformCategories = (
  categories: Array<{
    id: string;
    name: string;
    icon?: string;
    color?: string;
  }>
) =>
  categories.map(cat => ({
    value: cat.id,
    label: cat.name,
  }));

// Transform options to include icons
export const getTransactionTypeOptions = () =>
  transactionTypes.map(type => ({
    value: type.value,
    label: type.label,
    icon: type.icon,
  }));

export const getTransactionSubtypeOptions = () =>
  transactionSubtypes.map(subtype => ({
    value: subtype.value,
    label: subtype.label,
    icon: subtype.icon,
  }));

export const getTransactionStatusOptions = () =>
  transactionStatuses.map(status => ({
    value: status.value,
    label: status.label,
    icon: status.icon,
  }));
