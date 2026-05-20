import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useStripe } from '@stripe/stripe-react-native';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { createPaymentIntent, confirmOrder, resetCheckout, setPaymentStatus } from '../../redux/slices/checkoutSlice';
import { fetchCartItems } from '../../redux/slices/cartSlice';
import OrderSummary from '../../components/checkout/OrderSummary';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import { COLORS, SPACING, SHADOWS, TYPOGRAPHY } from '../../lib/constants';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentScreen() {
  const dispatch = useAppDispatch();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const { user } = useAppSelector((state) => state.auth);
  const { cartItems, total, subtotal, shippingFee } = useAppSelector((state) => state.cart);
  const { shippingInfo, paymentIntent, loading, error, paymentStatus } = useAppSelector((state) => state.checkout);

  const [stripeReady, setStripeReady] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // 1. Reset checkout state on mount and get PaymentIntent from Edge Function
  useEffect(() => {
    dispatch(resetCheckout());
    
    if (user && total > 0 && shippingInfo) {
      // Stripe expects amount in cents. $10.00 is 1000 cents.
      const amountInCents = Math.round(total * 100);
      
      dispatch(
        createPaymentIntent({
          amount: amountInCents,
          currency: 'usd',
          email: shippingInfo.email,
          customerName: shippingInfo.fullName,
        })
      );
    }
  }, [dispatch, user, total, shippingInfo]);

  // 2. Initialize Stripe PaymentSheet when paymentIntent is fetched
  useEffect(() => {
    if (paymentIntent && shippingInfo) {
      initializeStripe();
    }
  }, [paymentIntent, shippingInfo]);

  const initializeStripe = async () => {
    try {
      const { paymentIntent: clientSecret, ephemeralKey, customer } = paymentIntent!;
      
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Velocity Inc.',
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: clientSecret,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: shippingInfo!.fullName,
          email: shippingInfo!.email,
          phone: shippingInfo!.phone,
        },
      });

      if (initError) {
        console.warn('Stripe PaymentSheet Init Error:', initError.message);
        setStripeReady(false);
      } else {
        setStripeReady(true);
      }
    } catch (e) {
      console.warn('Stripe Init catch:', e);
      setStripeReady(false);
    }
  };

  // 3. Process actual Stripe payment
  const handleStripePayment = async () => {
    if (!user || !shippingInfo || !paymentIntent) return;

    setPaymentLoading(true);
    dispatch(setPaymentStatus('processing'));

    try {
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        // Payment failed or was cancelled
        if (presentError.code === 'Canceled') {
          Alert.alert('Payment Cancelled', 'You cancelled the transaction.');
          dispatch(setPaymentStatus('idle'));
        } else {
          Alert.alert('Payment Failed', presentError.message);
          dispatch(setPaymentStatus('failed'));
        }
        setPaymentLoading(false);
      } else {
        // Payment success! Proceed to create paid order in Supabase
        await handleOrderCreation(paymentIntent.paymentIntent, 'paid');
      }
    } catch (e: any) {
      Alert.alert('Payment Error', e.message || 'An error occurred during payment.');
      dispatch(setPaymentStatus('failed'));
      setPaymentLoading(false);
    }
  };

  // 4. Fallback Simulated Test Payment (for Expo Go, Web or when Edge Function keys are missing)
  const handleSimulatedPayment = () => {
    Alert.alert(
      'Simulate Payment',
      'This will simulate a successful card transaction for testing order placements in Expo Go / Dev Builds.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Test Payment',
          onPress: async () => {
            setPaymentLoading(true);
            dispatch(setPaymentStatus('processing'));
            
            // Mock a transaction ID
            const mockTxId = `pi_mock_${Math.random().toString(36).substr(2, 9)}`;
            await handleOrderCreation(mockTxId, 'paid');
          },
        },
      ]
    );
  };

  // 5. Submit Order to Supabase and clear Cart
  const handleOrderCreation = async (stripeIntentId: string | null, status: 'pending' | 'paid') => {
    if (!user || !shippingInfo) return;

    const action = await dispatch(
      confirmOrder({
        userId: user.id,
        cartItems,
        totalAmount: total,
        shippingAddress: shippingInfo,
        stripePaymentIntent: stripeIntentId,
        paymentStatus: status,
      })
    );

    setPaymentLoading(false);

    if (confirmOrder.fulfilled.match(action)) {
      // Clear local cart thunk to reflect empty cart
      dispatch(fetchCartItems(user.id));
      
      Alert.alert(
        'Order Placed!',
        'Thank you! Your order was created successfully and is being prepared.',
        [{ text: 'View My Orders', onPress: () => router.replace('/orders' as any) }]
      );
    } else {
      const errMsg = action.payload as string || 'Could not save your order in the database. Please contact support.';
      Alert.alert('Database Sync Error', errMsg);
      dispatch(setPaymentStatus('failed'));
    }
  };

  if (!shippingInfo) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Secure Checkout" showBackButton />
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Shipping Info Missing</Text>
          <Text style={styles.errorDesc}>Please enter your shipping address details first.</Text>
          <Button title="Add Address" onPress={() => router.push('/checkout' as any)} variant="accent" style={{ maxWidth: 200 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Payment Details" showBackButton />
      
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Shipping summary block */}
        <View style={styles.shippingSummaryCard}>
          <View style={styles.shippingHeader}>
            <Ionicons name="location" size={20} color={COLORS.accent} />
            <Text style={styles.shippingTitle}>Shipping Details</Text>
          </View>
          <Text style={styles.shippingTextName}>{shippingInfo.fullName}</Text>
          <Text style={styles.shippingTextAddress}>
            {shippingInfo.addressLine}, {shippingInfo.city}, {shippingInfo.state} {shippingInfo.postalCode}
          </Text>
          <Text style={styles.shippingTextContact}>
            Phone: {shippingInfo.phone} | Email: {shippingInfo.email}
          </Text>
        </View>

        {/* Order Items Summary */}
        <OrderSummary
          subtotal={subtotal}
          shippingFee={shippingFee}
          total={total}
          itemCount={itemCount}
        />

        {/* Payment options */}
        <View style={styles.paymentSection}>
          <Text style={styles.paymentHeader}>Secure Payment (TEST Mode)</Text>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={COLORS.accent} size="small" />
              <Text style={styles.loadingText}>Initializing Stripe connection...</Text>
            </View>
          ) : stripeReady ? (
            <React.Fragment>
              <Button
                title="Pay with Card (Stripe SDK)"
                onPress={handleStripePayment}
                variant="accent"
                loading={paymentLoading}
                icon={<Ionicons name="card" size={20} color={COLORS.card} />}
                style={styles.payBtn}
              />
              <Text style={styles.stripeNote}>
                Supports Visa, MasterCard, Amex via Stripe PaymentSheet.
              </Text>
            </React.Fragment>
          ) : (
            <View style={styles.stripeWarningBox}>
              <Ionicons name="warning-outline" size={22} color={COLORS.warning} />
              <Text style={styles.warningText}>
                Stripe SDK is restricted in Expo Go or missing API keys. Use the simulated bypass below to place orders.
              </Text>
            </View>
          )}

          <View style={styles.dividerRow}>
            <View style={styles.borderLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.borderLine} />
          </View>

          {/* Test mock button */}
          <Button
            title="Simulate Card Success"
            onPress={handleSimulatedPayment}
            variant="secondary"
            loading={paymentLoading}
            icon={<Ionicons name="checkmark-circle-outline" size={20} color={COLORS.text} />}
            style={styles.mockBtn}
          />
          <Text style={styles.mockText}>
            Simulates a successful credit transaction using Stripe test card details.
          </Text>
        </View>

        {paymentStatus === 'processing' && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color={COLORS.card} />
            <Text style={styles.processingText}>Processing payment securely...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SPACING.lg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  errorTitle: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  errorDesc: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  shippingSummaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...SHADOWS.light,
  },
  shippingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  shippingTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: COLORS.primary,
  },
  shippingTextName: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '600',
    color: COLORS.text,
  },
  shippingTextAddress: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  shippingTextContact: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  paymentSection: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
    ...SHADOWS.light,
  },
  paymentHeader: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
  },
  loadingText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  payBtn: {
    backgroundColor: COLORS.success,
  },
  stripeNote: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  stripeWarningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: COLORS.warning,
    borderRadius: 12,
    padding: SPACING.md,
    gap: SPACING.sm,
    alignItems: 'center',
  },
  warningText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  borderLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  orText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: '700',
    paddingHorizontal: SPACING.md,
  },
  mockBtn: {
    borderColor: COLORS.border,
  },
  mockText: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  processingText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.card,
    fontWeight: '700',
  },
});
