import { supabase } from '@/lib/supabase';

/**
 * Category Service - Handles category-related operations
 */

// Get all categories
export const getAllCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { success: false, error: error.message };
  }
};

// Get category by ID
export const getCategoryById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching category:', error);
    return { success: false, error: error.message };
  }
};

// Get category by slug
export const getCategoryBySlug = async (slug) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching category:', error);
    return { success: false, error: error.message };
  }
};
