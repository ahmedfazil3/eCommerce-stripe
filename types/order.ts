import { Product } from './product';
import { ShippingInfo } from './checkout';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  user_id: string | null;
  total_amount: number;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  shipping_address: ShippingInfo;
  stripe_payment_intent: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  quantity: number;
  price: number;
  created_at: string;
  product?: Product;
}
