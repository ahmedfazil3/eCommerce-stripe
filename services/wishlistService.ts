import { supabase } from './supabase';
import { Product } from '../types/product';

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export const wishlistService = {
  // Fetch wishlist items for current user
  async fetchWishlist(userId: string): Promise<WishlistItem[]> {
    const { data, error } = await supabase
      .from('wishlist_items')
      .select('*, product:products(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Add item to wishlist
  async addToWishlist(userId: string, productId: string): Promise<WishlistItem> {
    // Check if already in wishlist
    const { data: existing, error: fetchError } = await supabase
      .from('wishlist_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (existing) return existing;

    const { data, error } = await supabase
      .from('wishlist_items')
      .insert({
        user_id: userId,
        product_id: productId,
      })
      .select('*, product:products(*)')
      .single();

    if (error) throw error;
    return data;
  },

  // Remove from wishlist by product_id or wishlist_item id
  async removeFromWishlist(userId: string, productIdOrItemId: string): Promise<void> {
    // Determine if it's a UUID of a wishlist_item or a product
    // Let's delete by matching either of them
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', userId)
      .or(`id.eq.${productIdOrItemId},product_id.eq.${productIdOrItemId}`);

    if (error) throw error;
  },
};
export default wishlistService;
