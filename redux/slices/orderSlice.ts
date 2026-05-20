import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderService from '../../services/orderService';
import { Order } from '../../types/order';
import { CartItem } from '../../types/cart';
import { ShippingInfo } from '../../types/checkout';

interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null,
};

// Async Thunks
export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await orderService.fetchOrders(userId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'order/fetchOrderById',
  async (orderId: string, { rejectWithValue }) => {
    try {
      return await orderService.fetchOrderById(orderId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (
    {
      userId,
      cartItems,
      totalAmount,
      shippingAddress,
      stripePaymentIntent,
      paymentStatus,
    }: {
      userId: string;
      cartItems: CartItem[];
      totalAmount: number;
      shippingAddress: ShippingInfo;
      stripePaymentIntent: string | null;
      paymentStatus: 'pending' | 'paid';
    },
    { rejectWithValue }
  ) => {
    try {
      return await orderService.createOrder(
        userId,
        cartItems,
        totalAmount,
        shippingAddress,
        stripePaymentIntent,
        paymentStatus
      );
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Orders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Order By ID
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Order (Duplicate from checkout if needed, but handles order state integration)
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = [action.payload, ...state.orders];
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedOrder } = orderSlice.actions;
export default orderSlice.reducer;
