import { supabase } from './supabase';
import { Order, OrderItem } from '../types/order';
import { ShippingInfo } from '../types/checkout';
import { CartItem } from '../types/cart';

export const orderService = {
  // Fetch orders for current user
  async fetchOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Fetch single order details with its items
  async fetchOrderById(orderId: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, product:products(*))')
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new order, its items, and clear user cart
  async createOrder(
    userId: string,
    cartItems: CartItem[],
    totalAmount: number,
    shippingAddress: ShippingInfo,
    stripePaymentIntent: string | null,
    paymentStatus: 'pending' | 'paid' = 'pending'
  ): Promise<Order> {
    if (cartItems.length === 0) {
      throw new Error('Cannot create order with an empty cart');
    }

    // 1. Create order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total_amount: totalAmount,
        payment_status: paymentStatus,
        order_status: paymentStatus === 'paid' ? 'paid' : 'pending',
        shipping_address: shippingAddress,
        stripe_payment_intent: stripePaymentIntent,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Prepare order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.product?.discount_price || item.product?.price || 0,
    }));

    // 3. Insert order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      // Rollback order if items fail (delete order)
      await supabase.from('orders').delete().eq('id', order.id);
      throw itemsError;
    }

    // 4. Clear the cart
    const { error: clearCartError } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (clearCartError) {
      console.warn('Order was created but cart could not be cleared:', clearCartError.message);
    }

    return order;
  },
};
export default orderService;
