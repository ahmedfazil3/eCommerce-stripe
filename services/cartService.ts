import { supabase } from './supabase';
import { CartItem } from '../types/cart';

export const cartService = {
  // Fetch cart items for current authenticated user
  async fetchCartItems(userId: string): Promise<CartItem[]> {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Add item to cart
  async addToCart(userId: string, productId: string, quantity: number = 1): Promise<CartItem> {
    // Check if the item already exists in the cart
    const { data: existing, error: fetchError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existing) {
      // Increment quantity
      const newQty = existing.quantity + quantity;
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: newQty, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select('*, product:products(*)')
        .single();

      if (error) throw error;
      return data;
    } else {
      // Insert new cart item
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: productId,
          quantity,
        })
        .select('*, product:products(*)')
        .single();

      if (error) throw error;
      return data;
    }
  },

  // Remove item from cart
  async removeFromCart(cartItemId: string): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) throw error;
  },

  // Update item quantity in cart
  async updateQuantity(cartItemId: string, quantity: number): Promise<CartItem> {
    if (quantity <= 0) {
      await this.removeFromCart(cartItemId);
      throw new Error('Quantity must be greater than 0');
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq('id', cartItemId)
      .select('*, product:products(*)')
      .single();

    if (error) throw error;
    return data;
  },

  // Clear all cart items for a user
  async clearCart(userId: string): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  },
};
export default cartService;
