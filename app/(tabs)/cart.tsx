import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Text, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchCartItems, updateQuantity, removeFromCart } from '../../redux/slices/cartSlice';
import CartItemCard from '../../components/cart/CartItemCard';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Header from '../../components/ui/Header';
import { COLORS, SPACING, SHADOWS, TYPOGRAPHY } from '../../lib/constants';

export default function CartScreen() {
  const dispatch = useAppDispatch();
  const { cartItems, subtotal, shippingFee, total, loading } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchCartItems(user.id));
    }
  }, [dispatch, user]);

  const handleRefresh = async () => {
    if (user) {
      setRefreshing(true);
      await dispatch(fetchCartItems(user.id));
      setRefreshing(false);
    }
  };

  const handleUpdateQty = (cartItemId: string, newQty: number) => {
    if (user) {
      dispatch(updateQuantity({ userId: user.id, cartItemId, quantity: newQty }));
    }
  };

  const handleRemove = (cartItemId: string) => {
    if (user) {
      dispatch(removeFromCart({ userId: user.id, cartItemId }));
    }
  };

  const handleCheckoutPress = () => {
    router.push('/checkout' as any);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="My Shopping Cart" />
        <EmptyState
          title="Sign In Required"
          description="Log in to build your shopping cart, manage checkout, and view items."
          icon="cart-outline"
          actionTitle="Sign In Now"
          onActionPress={() => router.push('/(auth)/login' as any)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Shopping Cart" />

      {loading && cartItems.length === 0 ? (
        <Loader type="spinner" />
      ) : cartItems.length === 0 ? (
        <EmptyState
          title="Your Cart is Empty"
          description="Looks like you haven't added anything to your cart yet. Head back to the shop to find items!"
          icon="cart-outline"
          actionTitle="Explore Shop"
          onActionPress={() => router.push('/(tabs)' as any)}
        />
      ) : (
        <React.Fragment>
          <FlatList
            data={cartItems}
            renderItem={({ item }) => (
              <CartItemCard
                item={item}
                onUpdateQuantity={(newQty) => handleUpdateQty(item.id, newQty)}
                onRemove={() => handleRemove(item.id)}
                onPress={() => router.push(`/product/${item.product_id}` as any)}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.accent]} />
            }
          />

          {/* Cart Breakdown Footer */}
          <View style={styles.footer}>
            <View style={styles.summaryContainer}>
              <View style={styles.row}>
                <Text style={styles.label}>Subtotal</Text>
                <Text style={styles.value}>${subtotal.toFixed(2)}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Shipping</Text>
                <Text style={[styles.value, shippingFee === 0 && styles.freeShipping]}>
                  {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={[styles.row, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
              </View>
            </View>

            <Button
              title="Proceed to Checkout"
              onPress={handleCheckoutPress}
              variant="accent"
              style={styles.checkoutBtn}
            />
          </View>
        </React.Fragment>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    padding: SPACING.lg,
    paddingBottom: 220, // Leave spacing for floating billing details
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.lg,
    paddingBottom: 24, // Account for bottom tab layouts safely
    ...SHADOWS.heavy,
  },
  summaryContainer: {
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  label: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
  },
  value: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.text,
  },
  freeShipping: {
    color: COLORS.success,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  totalRow: {
    marginBottom: 0,
  },
  totalLabel: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '700',
    color: COLORS.text,
  },
  totalValue: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
    color: COLORS.primary,
  },
  checkoutBtn: {
    width: '100%',
  },
});
