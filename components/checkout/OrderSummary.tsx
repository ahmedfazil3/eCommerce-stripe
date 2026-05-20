import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, SHADOWS, TYPOGRAPHY } from '../../lib/constants';

interface OrderSummaryProps {
  subtotal: number;
  shippingFee: number;
  total: number;
  itemCount: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  subtotal,
  shippingFee,
  total,
  itemCount,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Summary</Text>
      
      <View style={styles.row}>
        <Text style={styles.label}>Items ({itemCount})</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...SHADOWS.light,
  },
  title: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  label: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textMuted,
  },
  value: {
    ...TYPOGRAPHY.bodyMedium,
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
    marginVertical: SPACING.md,
  },
  totalRow: {
    marginBottom: 0,
  },
  totalLabel: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: COLORS.text,
  },
  totalValue: {
    ...TYPOGRAPHY.h2,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
export default OrderSummary;
