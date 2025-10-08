// Transaction Category API Types
import type { Database } from '../database';

// =====================================================================================
// DATABASE TYPES
// =====================================================================================

export type TransactionCategory =
  Database['public']['Tables']['transaction_categories']['Row'];
export type TransactionCategoryInsert =
  Database['public']['Tables']['transaction_categories']['Insert'];
export type TransactionCategoryUpdate =
  Database['public']['Tables']['transaction_categories']['Update'];

// =====================================================================================
// CATEGORY OPERATIONS
// =====================================================================================

export interface CategoryOperations {
  getUserCategories: (userId: string) => Promise<TransactionCategory[]>;
  getCategory: (categoryId: string) => Promise<TransactionCategory | null>;
  createCategory: (
    category: TransactionCategoryInsert
  ) => Promise<TransactionCategory>;
  updateCategory: (
    categoryId: string,
    updates: TransactionCategoryUpdate
  ) => Promise<TransactionCategory>;
  deleteCategory: (categoryId: string) => Promise<void>;
}

// =====================================================================================
// CATEGORY HELPERS
// =====================================================================================

export interface CategoryWithStats extends TransactionCategory {
  transactionCount?: number;
  totalAmount?: number;
  lastUsed?: string;
}

export interface CategoryHierarchy extends TransactionCategory {
  subcategories?: TransactionCategory[];
}
