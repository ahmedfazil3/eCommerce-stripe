import { supabase } from './supabase';
import { Product, Category } from '../types/product';

export const productService = {
  // Fetch all categories
  async fetchCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Fetch products (with optional filtering, pagination or category constraint)
  async fetchProducts(categoryId?: string, search?: string): Promise<Product[]> {
    let query = supabase.from('products').select('*');

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    // Default sorting by newest
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Fetch featured products
  async fetchFeaturedProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('featured', true)
      .limit(6);

    if (error) throw error;
    return data || [];
  },

  // Fetch product details by ID
  async fetchProductById(productId: string): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) throw error;
    return data;
  },
};
export default productService;
