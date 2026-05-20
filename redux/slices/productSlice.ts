import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../../services/productService';
import { Product, Category } from '../../types/product';

interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  categories: Category[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  featuredProducts: [],
  categories: [],
  selectedProduct: null,
  loading: false,
  error: null,
};

// Async Thunks
export const fetchCategories = createAsyncThunk(
  'product/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await productService.fetchCategories();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (
    filters: { categoryId?: string; search?: string } | undefined,
    { rejectWithValue }
  ) => {
    try {
      return await productService.fetchProducts(filters?.categoryId, filters?.search);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'product/fetchFeaturedProducts',
  async (_, { rejectWithValue }) => {
    try {
      return await productService.fetchFeaturedProducts();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'product/fetchProductById',
  async (productId: string, { rejectWithValue }) => {
    try {
      return await productService.fetchProductById(productId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchProducts = createAsyncThunk(
  'product/searchProducts',
  async (searchQuery: string, { rejectWithValue }) => {
    try {
      return await productService.fetchProducts(undefined, searchQuery);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const filterByCategory = createAsyncThunk(
  'product/filterByCategory',
  async (categoryId: string, { rejectWithValue }) => {
    try {
      return await productService.fetchProducts(categoryId, undefined);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Products (and search/filter triggers since they resolve to products lists)
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(searchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(filterByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(filterByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(filterByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Featured Products
    builder
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredProducts = action.payload;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Product By ID
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedProduct } = productSlice.actions;
export default productSlice.reducer;
