import { StripeProvider } from '@stripe/stripe-react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { COLORS } from '../lib/constants';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchProfile, setSession } from '../redux/slices/authSlice';
import { store } from '../redux/store';
import { supabase } from '../services/supabase';

const stripePublishableKey =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

// Create an inner app component to access Redux hooks
function AppContent() {
  const dispatch = useAppDispatch();
  const { session, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // 1. Check for initial session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        dispatch(setSession({ session, user: session.user }));
        dispatch(fetchProfile(session.user.id));
      }
    });

    // 2. Listen for auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      dispatch(setSession({ session, user: session ? session.user : null }));

      if (session) {
        dispatch(fetchProfile(session.user.id));
        // Only redirect to tabs on explicit sign in to prevent race condition during initial splash load
        if (event === 'SIGNED_IN') {
          router.replace('/(tabs)' as any);
        }
      } else {
        // Only redirect to login on explicit sign out
        if (event === 'SIGNED_OUT') {
          router.replace('/(auth)/login' as any);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return (
    <React.Fragment>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="splash" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="product/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="checkout" options={{ presentation: 'card' }} />
        <Stack.Screen name="orders" options={{ presentation: 'card' }} />
      </Stack>
      <StatusBar style="dark" />
    </React.Fragment>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <StripeProvider publishableKey={stripePublishableKey}>
        <AppContent />
      </StripeProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
});
