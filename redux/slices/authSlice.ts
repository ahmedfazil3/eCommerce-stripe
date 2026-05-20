import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import { Profile, User } from '../../types/auth';

interface AuthState {
  user: User | null;
  session: any | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  session: null,
  profile: null,
  loading: false,
  error: null,
};

// Async Thunks
export const signup = createAsyncThunk(
  'auth/signup',
  async ({ email, password, fullName }: { email: string; password: md; fullName: string }, { rejectWithValue }) => {
    try {
      const data = await authService.signUp(email, password, fullName);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: md }, { rejectWithValue, dispatch }) => {
    try {
      const data = await authService.signIn(email, password);
      if (data.user) {
        dispatch(fetchProfile(data.user.id));
      }
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.signOut();
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      return await authService.resetPassword(email);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await authService.getProfile(userId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ userId, updates }: { userId: string; updates: Partial<Profile> }, { rejectWithValue }) => {
    try {
      return await authService.updateProfile(userId, updates);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

type md = string; // placeholder

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<{ session: any; user: User | null }>) => {
      state.session = action.payload.session;
      state.user = action.payload.user;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Signup
    builder
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.session = action.payload.session;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.session = action.payload.session;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.session = null;
        state.profile = null;
        state.loading = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Forgot Password
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Profile
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSession, clearError } = authSlice.actions;
export default authSlice.reducer;
