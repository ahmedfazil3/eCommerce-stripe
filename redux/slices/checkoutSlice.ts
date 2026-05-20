import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import stripeService from '../../services/stripeService';
import orderService from '../../services/orderService';
import { ShippingInfo, PaymentIntentResponse } from '../../types/checkout';
import { CartItem } from '../../types/cart';

interface CheckoutState {
  shippingInfo: ShippingInfo | null;
  paymentIntent: PaymentIntentResponse | null;
  paymentStatus: 'idle' | 'processing' | 'success' | 'failed';
  loading: boolean;
  error: string | null;
}

const initialState: CheckoutState = {
  shippingInfo: null,
  paymentIntent: null,
  paymentStatus: 'idle',
  loading: false,
  error: null,
};

// Async Thunks
export const createPaymentIntent = createAsyncThunk(
  'checkout/createPaymentIntent',
  async (
    {
      amount,
      currency,
      email,
      customerName,
    }: {
      amount: number;
      currency?: string;
      email?: string;
      customerName?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      // amount is expected in cents, e.g. $10.00 is 1000
      return await stripeService.createPaymentIntent(amount, currency, email, customerName);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const confirmOrder = createAsyncThunk(
  'checkout/confirmOrder',
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

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    saveShippingInfo: (state, action: PayloadAction<ShippingInfo>) => {
      state.shippingInfo = action.payload;
    },
    setPaymentStatus: (state, action: PayloadAction<'idle' | 'processing' | 'success' | 'failed'>) => {
      state.paymentStatus = action.payload;
    },
    resetCheckout: (state) => {
      state.paymentIntent = null;
      state.paymentStatus = 'idle';
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create PaymentIntent
    builder
      .addCase(createPaymentIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentIntent = action.payload;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Confirm Order
    builder
      .addCase(confirmOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmOrder.fulfilled, (state) => {
        state.loading = false;
        state.paymentStatus = 'success';
      })
      .addCase(confirmOrder.rejected, (state, action) => {
        state.loading = false;
        state.paymentStatus = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { saveShippingInfo, setPaymentStatus, resetCheckout } = checkoutSlice.actions;
export default checkoutSlice.reducer;
