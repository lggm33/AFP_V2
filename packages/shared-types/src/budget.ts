// Budget-specific types and interfaces

export enum BudgetPeriod {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

export enum BudgetStatus {
  UNDER_BUDGET = 'under_budget',
  ON_TRACK = 'on_track',
  APPROACHING_LIMIT = 'approaching_limit',
  OVER_BUDGET = 'over_budget'
}

export interface BudgetAlert {
  id: string;
  user_id: string;
  budget_id: string;
  type: 'approaching_limit' | 'over_budget' | 'monthly_summary';
  threshold_percentage: number;
  is_active: boolean;
  notification_methods: ('email' | 'push' | 'in_app')[];
  created_at: string;
  updated_at: string;
}

export interface BudgetGoal {
  id: string;
  user_id: string;
  name: string;
  description: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category_id?: string;
  is_achieved: boolean;
  created_at: string;
  updated_at: string;
}

export interface BudgetInsight {
  type: 'overspending' | 'saving_opportunity' | 'trend_change' | 'category_analysis';
  title: string;
  description: string;
  category?: string;
  amount?: number;
  percentage?: number;
  recommendation?: string;
  priority: 'low' | 'medium' | 'high';
  generated_at: string;
}

export interface BudgetAnalytics {
  period: string; // YYYY-MM
  total_budget: number;
  total_spent: number;
  total_remaining: number;
  categories: {
    [category_id: string]: {
      name: string;
      budgeted: number;
      spent: number;
      remaining: number;
      percentage_used: number;
      status: BudgetStatus;
      trend: 'increasing' | 'decreasing' | 'stable';
    };
  };
  insights: BudgetInsight[];
  comparison_previous_month: {
    budget_change_percentage: number;
    spending_change_percentage: number;
    savings_change_percentage: number;
  };
}

export interface BudgetTemplate {
  id: string;
  name: string;
  description: string;
  categories: {
    name: string;
    percentage: number;
    color: string;
    icon?: string;
  }[];
  is_public: boolean;
  created_by: string;
  usage_count: number;
  created_at: string;
}

// Import from database types
import type { Budget, BudgetCategory } from './database';

export type BudgetWithCategory = Budget & {
  category: BudgetCategory;
};

export type BudgetCategoryWithBudget = BudgetCategory & {
  current_budget?: Budget;
  spent_this_month: number;
  remaining_this_month: number;
  status: BudgetStatus;
};

export type BudgetCreateInput = Omit<Budget, 'id' | 'created_at' | 'updated_at'>;
export type BudgetUpdateInput = Partial<BudgetCreateInput>;

export type BudgetCategoryCreateInput = Omit<BudgetCategory, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type BudgetCategoryUpdateInput = Partial<BudgetCategoryCreateInput>;
