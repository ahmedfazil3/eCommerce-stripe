import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cartService from '../../services/cartService';
import { CartItem } from '../../types/cart';

interface CartState {
  cartItems: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cartItems: [],
  subtotal: 0,
  shippingFee: 0,
  total: 0,
  loading: false,
  error: null,
};

// Helper function to calculate totals
const calculateTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((acc, item) => {
    const price = item.product?.discount_price || item.product?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  // Free shipping over $150, else $10 flat rate
  const shippingFee = subtotal > 150 || subtotal === 0 ? 0 : 10;
  const total = subtotal + shippingFee;

  return { subtotal, shippingFee, total };
};

// Async Thunks
export const fetchCartItems = createAsyncThunk(
  'cart/fetchCartItems',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await cartService.fetchCartItems(userId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (
    { userId, productId, quantity }: { userId: string; productId: string; quantity: number },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const data = await cartService.addToCart(userId, productId, quantity);
      dispatch(fetchCartItems(userId)); // Reload to get updated and populated product details
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (
    { userId, cartItemId }: { userId: string; cartItemId: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      await cartService.removeFromCart(cartItemId);
      dispatch(fetchCartItems(userId));
      return cartItemId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async (
    { userId, cartItemId, quantity }: { userId: string; cartItemId: string; quantity: number },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const data = await cartService.updateQuantity(cartItemId, quantity);
      dispatch(fetchCartItems(userId));
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (userId: string, { rejectWithValue }) => {
    try {
      await cartService.clearCart(userId);
      return [];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch Cart Items
    builder
      .addCase(fetchCartItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload;
        const { subtotal, shippingFee, total } = calculateTotals(action.payload);
        state.subtotal = subtotal;
        state.shippingFee = shippingFee;
        state.total = total;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add To Cart
    builder
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Remove From Cart
    builder
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Quantity
    builder
      .addCase(updateQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuantity.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Clear Cart
    builder
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.cartItems = [];
        state.subtotal = 0;
        state.shippingFee = 0;
        state.total = 0;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default cartSlice.reducer;
