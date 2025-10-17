// Category Service - Handles both system and user categories
import { supabase } from '@/config/supabase';
import type { TransactionCategory, TransactionCategoryInsert } from '@shared-types/api/categories';

export interface CategoryWithMetadata extends TransactionCategory {
  isSystem: boolean;
  isUserCategory: boolean;
}

export interface CategoryHierarchyNode extends CategoryWithMetadata {
  children: CategoryHierarchyNode[];
  level: number;
}

/**
 * Category Service for managing transaction categories
 */
export class CategoryService {
  /**
   * Get all categories available to a user (system + user categories)
   */
  static async getUserCategories(userId: string): Promise<CategoryWithMetadata[]> {
    const { data, error } = await supabase
      .from('transaction_categories')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .eq('is_active', true)
      .order('is_system_category', { ascending: false }) // System categories first
      .order('name');

    if (error) throw error;

    return (data || []).map(category => ({
      ...category,
      isSystem: category.user_id === null,
      isUserCategory: category.user_id === userId,
    }));
  }

  /**
   * Get categories organized in hierarchy
   */
  static async getCategoriesHierarchy(userId: string): Promise<CategoryHierarchyNode[]> {
    const categories = await this.getUserCategories(userId);
    return this.buildHierarchy(categories);
  }

  /**
   * Get only system categories
   */
  static async getSystemCategories(): Promise<CategoryWithMetadata[]> {
    const { data, error } = await supabase
      .from('transaction_categories')
      .select('*')
      .is('user_id', null)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    return (data || []).map(category => ({
      ...category,
      isSystem: true,
      isUserCategory: false,
    }));
  }

  /**
   * Get only user-specific categories
   */
  static async getUserSpecificCategories(userId: string): Promise<CategoryWithMetadata[]> {
    const { data, error } = await supabase
      .from('transaction_categories')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    return (data || []).map(category => ({
      ...category,
      isSystem: false,
      isUserCategory: true,
    }));
  }

  /**
   * Create a new user category
   */
  static async createUserCategory(
    userId: string,
    categoryData: Omit<TransactionCategoryInsert, 'user_id'>
  ): Promise<CategoryWithMetadata> {
    const { data, error } = await supabase
      .from('transaction_categories')
      .insert({
        ...categoryData,
        user_id: userId,
        is_system_category: false,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      isSystem: false,
      isUserCategory: true,
    };
  }

  /**
   * Update a user category (only user's own categories can be updated)
   */
  static async updateUserCategory(
    categoryId: string,
    userId: string,
    updates: Partial<Omit<TransactionCategoryInsert, 'user_id'>>
  ): Promise<CategoryWithMetadata> {
    const { data, error } = await supabase
      .from('transaction_categories')
      .update(updates)
      .eq('id', categoryId)
      .eq('user_id', userId) // Ensure user can only update their own categories
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      isSystem: false,
      isUserCategory: true,
    };
  }

  /**
   * Soft delete a user category
   */
  static async deleteUserCategory(categoryId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('transaction_categories')
      .update({ is_active: false })
      .eq('id', categoryId)
      .eq('user_id', userId); // Ensure user can only delete their own categories

    if (error) throw error;
  }

  /**
   * Get categories formatted for select components
   */
  static formatCategoriesForSelect(categories: CategoryWithMetadata[]) {
    return categories.map(category => ({
      value: category.id,
      label: category.name,
      color: category.color,
      icon: category.icon,
      isSystem: category.isSystem,
      disabled: false,
    }));
  }

  /**
   * Build category hierarchy from flat list
   */
  private static buildHierarchy(categories: CategoryWithMetadata[]): CategoryHierarchyNode[] {
    const categoryMap = new Map<string, CategoryHierarchyNode>();
    const rootCategories: CategoryHierarchyNode[] = [];

    // First pass: create all nodes
    categories.forEach(category => {
      const node: CategoryHierarchyNode = {
        ...category,
        children: [],
        level: 0,
      };
      categoryMap.set(category.id, node);
    });

    // Second pass: build hierarchy
    categories.forEach(category => {
      const node = categoryMap.get(category.id)!;
      
      if (category.parent_category_id) {
        const parent = categoryMap.get(category.parent_category_id);
        if (parent) {
          parent.children.push(node);
          node.level = parent.level + 1;
        } else {
          // Parent not found, treat as root
          rootCategories.push(node);
        }
      } else {
        rootCategories.push(node);
      }
    });

    return rootCategories;
  }

  /**
   * Get flattened hierarchy for display purposes
   */
  static flattenHierarchy(hierarchy: CategoryHierarchyNode[]): CategoryHierarchyNode[] {
    const flattened: CategoryHierarchyNode[] = [];

    function flatten(nodes: CategoryHierarchyNode[]) {
      nodes.forEach(node => {
        flattened.push(node);
        if (node.children.length > 0) {
          flatten(node.children);
        }
      });
    }

    flatten(hierarchy);
    return flattened;
  }
}

export const categoryService = CategoryService;
