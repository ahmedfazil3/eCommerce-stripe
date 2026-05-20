import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import wishlistService, { WishlistItem } from '../../services/wishlistService';

interface WishlistState {
  wishlistItems: WishlistItem[];
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  wishlistItems: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await wishlistService.fetchWishlist(userId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (
    { userId, productId }: { userId: string; productId: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const data = await wishlistService.addToWishlist(userId, productId);
      dispatch(fetchWishlist(userId));
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (
    { userId, productIdOrItemId }: { userId: string; productIdOrItemId: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      await wishlistService.removeFromWishlist(userId, productIdOrItemId);
      dispatch(fetchWishlist(userId));
      return productIdOrItemId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch Wishlist
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlistItems = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add to Wishlist
    builder
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Remove from Wishlist
    builder
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default wishlistSlice.reducer;
