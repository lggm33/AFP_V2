// Budget API Types
import type { Database } from '../database';
import type { TransactionCategory } from './categories';

// =====================================================================================
// DATABASE TYPES
// =====================================================================================

export type Budget = Database['public']['Tables']['budgets']['Row'];
export type BudgetInsert = Database['public']['Tables']['budgets']['Insert'];
export type BudgetUpdate = Database['public']['Tables']['budgets']['Update'];

export type BudgetAlert = Database['public']['Tables']['budget_alerts']['Row'];

// Enums
export type BudgetStatus = Database['public']['Enums']['budget_status'];
export type AlertType = Database['public']['Enums']['alert_type'];

// =====================================================================================
// BUDGET OPERATIONS
// =====================================================================================

export interface BudgetOperations {
  getUserBudgets: (
    userId: string,
    month?: string
  ) => Promise<BudgetWithCategory[]>;
  getBudget: (budgetId: string) => Promise<Budget | null>;
  createBudget: (budget: BudgetInsert) => Promise<Budget>;
  updateBudget: (budgetId: string, updates: BudgetUpdate) => Promise<Budget>;
  deleteBudget: (budgetId: string) => Promise<void>;
}

// =====================================================================================
// BUDGET WITH RELATIONS
// =====================================================================================

export interface BudgetWithCategory extends Budget {
  category: Pick<TransactionCategory, 'id' | 'name' | 'color' | 'icon'>;
}

export interface BudgetWithProgress extends BudgetWithCategory {
  spent: number;
  remaining: number;
  percentage: number;
  status: BudgetStatus;
  projectedSpend: number;
  daysRemaining: number;
  averageDailySpend: number;
}

// =====================================================================================
// BUDGET ANALYSIS
// =====================================================================================

export interface BudgetAnalysisRequest {
  userId: string;
  month: string; // YYYY-MM
}

export interface BudgetAnalysisResponse {
  budgets: Array<BudgetWithProgress>;
  totalBudgeted: number;
  totalSpent: number;
  totalRemaining: number;
  overallStatus: BudgetStatus;
  categoriesOverBudget: number;
  categoriesOnTrack: number;
}

// =====================================================================================
// DASHBOARD SUMMARY
// =====================================================================================

export interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  budgetStatus: {
    totalBudgets: number;
    onTrack: number;
    approaching: number;
    exceeded: number;
  };
  recentTransactions: any[]; // Will be imported from transactions
  alerts: BudgetAlert[];
}

export interface DashboardRequest {
  userId: string;
  month?: string; // YYYY-MM format
}
