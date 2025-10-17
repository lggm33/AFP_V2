// Custom hook for managing categories
import { useState, useEffect, useCallback } from 'react';
import {
  categoryService,
  type CategoryWithMetadata,
  type CategoryHierarchyNode,
} from '@/services/categoryService';

interface UseCategoriesOptions {
  userId: string;
  autoRefetch?: boolean;
  includeHierarchy?: boolean;
}

interface UseCategoriesReturn {
  categories: CategoryWithMetadata[];
  hierarchy: CategoryHierarchyNode[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createCategory: (categoryData: {
    name: string;
    color?: string;
    icon?: string;
    parent_category_id?: string;
  }) => Promise<CategoryWithMetadata>;
  updateCategory: (
    categoryId: string,
    updates: Partial<{
      name: string;
      color: string;
      icon: string;
      parent_category_id: string;
      is_active: boolean;
    }>
  ) => Promise<CategoryWithMetadata>;
  deleteCategory: (categoryId: string) => Promise<void>;
  getSystemCategories: () => CategoryWithMetadata[];
  getUserCategories: () => CategoryWithMetadata[];
}

/**
 * Hook for managing transaction categories
 */
export function useCategories({
  userId,
  autoRefetch = true,
  includeHierarchy = false,
}: UseCategoriesOptions): UseCategoriesReturn {
  const [categories, setCategories] = useState<CategoryWithMetadata[]>([]);
  const [hierarchy, setHierarchy] = useState<CategoryHierarchyNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const [categoriesData, hierarchyData] = await Promise.all([
        categoryService.getUserCategories(userId),
        includeHierarchy
          ? categoryService.getCategoriesHierarchy(userId)
          : Promise.resolve([]),
      ]);

      setCategories(categoriesData);
      setHierarchy(hierarchyData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch categories';
      setError(errorMessage);
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, includeHierarchy]);

  useEffect(() => {
    if (autoRefetch) {
      fetchCategories();
    }
  }, [fetchCategories, autoRefetch]);

  const createCategory = useCallback(
    async (categoryData: {
      name: string;
      color?: string;
      icon?: string;
      parent_category_id?: string;
    }) => {
      try {
        const newCategory = await categoryService.createUserCategory(userId, {
          name: categoryData.name,
          color: categoryData.color || '#6B7280',
          icon: categoryData.icon,
          parent_category_id: categoryData.parent_category_id || null,
          is_active: true,
        });

        // Refresh categories after creation
        await fetchCategories();
        return newCategory;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create category';
        setError(errorMessage);
        throw err;
      }
    },
    [userId, fetchCategories]
  );

  const updateCategory = useCallback(
    async (
      categoryId: string,
      updates: Partial<{
        name: string;
        color: string;
        icon: string;
        parent_category_id: string;
        is_active: boolean;
      }>
    ) => {
      try {
        const updatedCategory = await categoryService.updateUserCategory(
          categoryId,
          userId,
          updates
        );

        // Refresh categories after update
        await fetchCategories();
        return updatedCategory;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update category';
        setError(errorMessage);
        throw err;
      }
    },
    [userId, fetchCategories]
  );

  const deleteCategory = useCallback(
    async (categoryId: string) => {
      try {
        await categoryService.deleteUserCategory(categoryId, userId);

        // Refresh categories after deletion
        await fetchCategories();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete category';
        setError(errorMessage);
        throw err;
      }
    },
    [userId, fetchCategories]
  );

  const getSystemCategories = useCallback(() => {
    return categories.filter(cat => cat.isSystem);
  }, [categories]);

  const getUserCategories = useCallback(() => {
    return categories.filter(cat => cat.isUserCategory);
  }, [categories]);

  return {
    categories,
    hierarchy,
    loading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getSystemCategories,
    getUserCategories,
  };
}
