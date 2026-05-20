import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Text, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchOrders } from '../../redux/slices/orderSlice';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Header from '../../components/ui/Header';
import { COLORS, SPACING, SHADOWS, TYPOGRAPHY } from '../../lib/constants';
import { Ionicons } from '@expo/vector-icons';

export default function OrdersScreen() {
  const dispatch = useAppDispatch();
  const { orders, loading } = useAppSelector((state) => state.order);
  const { user } = useAppSelector((state) => state.auth);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchOrders(user.id));
    }
  }, [dispatch, user]);

  const handleRefresh = async () => {
    if (user) {
      setRefreshing(true);
      await dispatch(fetchOrders(user.id));
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return COLORS.success;
      case 'shipped':
        return COLORS.info;
      case 'delivered':
        return '#059669'; // Emerald
      case 'pending':
      default:
        return COLORS.warning;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return isoString;
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="My Orders" showBackButton />
        <EmptyState
          title="Sign In Required"
          description="Log in to view your previous purchase receipts and transaction history."
          icon="receipt-outline"
          actionTitle="Sign In Now"
          onActionPress={() => router.push('/(auth)/login' as any)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="My Orders" showBackButton />

      {loading && orders.length === 0 ? (
        <Loader type="spinner" />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No Orders Yet"
          description="You haven't placed any orders yet. Shop our premium collection to make your first purchase!"
          icon="receipt-outline"
          actionTitle="Start Shopping"
          onActionPress={() => router.push('/(tabs)' as any)}
        />
      ) : (
        <FlatList
          data={orders}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderIdText} numberOfLines={1}>
                    ORDER ID: {item.id.substring(0, 8).toUpperCase()}...
                  </Text>
                  <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
                </View>
                
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(item.order_status)}10` },
                  ]}
                >
                  <Text style={[styles.statusText, { color: getStatusColor(item.order_status) }]}>
                    {item.order_status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.addressSection}>
                <Ionicons name="location-outline" size={16} color={COLORS.textMuted} />
                <Text style={styles.addressText} numberOfLines={1}>
                  Shipped to: {item.shipping_address?.addressLine}, {item.shipping_address?.city}
                </Text>
              </View>

              <View style={styles.footerRow}>
                <Text style={styles.paymentStatusText}>
                  Payment: <Text style={{ color: item.payment_status === 'paid' ? COLORS.success : COLORS.error, fontWeight: '700' }}>
                    {item.payment_status.toUpperCase()}
                  </Text>
                </Text>
                <Text style={styles.totalText}>
                  Total Paid: <Text style={styles.amountText}>${item.total_amount.toFixed(2)}</Text>
                </Text>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.accent]} />
          }
        />
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
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...SHADOWS.light,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderIdText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '800',
    color: COLORS.primary,
  },
  dateText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  addressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  addressText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  paymentStatusText: {
    fontSize: 11,
    color: COLORS.text,
    fontWeight: '500',
  },
  totalText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  amountText: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '800',
    color: COLORS.primary,
  },
});
