import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { saveShippingInfo } from '../../redux/slices/checkoutSlice';
import { fetchCartItems } from '../../redux/slices/cartSlice';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import { validateEmail, validatePhone, validateRequired } from '../../utils/validation';
import { COLORS, SPACING, TYPOGRAPHY } from '../../lib/constants';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600';

const getValidImageUrl = (url: string | null | undefined): string => {
  if (!url) return PLACEHOLDER_IMAGE;
  const trimmed = url.trim();
  if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
    return PLACEHOLDER_IMAGE;
  }
  if (/^(https?:\/\/|file:\/\/|data:image\/)/i.test(trimmed)) {
    return trimmed;
  }
  return PLACEHOLDER_IMAGE;
};

export default function CheckoutScreen() {
  const dispatch = useAppDispatch();
  const { user, profile } = useAppSelector((state) => state.auth);
  const { shippingInfo } = useAppSelector((state) => state.checkout);
  const { cartItems, total, subtotal, shippingFee } = useAppSelector((state) => state.cart);

  useEffect(() => {
    if (user) {
      dispatch(fetchCartItems(user.id));
    }
  }, [dispatch, user]);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Form Errors
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  // Auto-populate from Profile or existing shippingInfo
  useEffect(() => {
    if (shippingInfo) {
      setFullName(shippingInfo.fullName);
      setEmail(shippingInfo.email);
      setPhone(shippingInfo.phone);
      setAddressLine(shippingInfo.addressLine);
      setCity(shippingInfo.city);
      setState(shippingInfo.state);
      setPostalCode(shippingInfo.postalCode);
      setCountry(shippingInfo.country);
      setOrderNotes(shippingInfo.orderNotes || '');
    } else if (profile) {
      setFullName(profile.full_name || '');
      setEmail(profile.email || user?.email || '');
      setPhone(profile.phone || '');
    } else if (user) {
      setEmail(user.email || '');
    }
  }, [profile, user, shippingInfo]);

  const handleContinue = () => {
    // Reset errors
    const newErrors: Record<string, string | null> = {};
    let isValid = true;

    // Run validations
    const nameVal = validateRequired(fullName, 'Full name');
    const emailVal = validateEmail(email);
    const phoneVal = validatePhone(phone);
    const addressVal = validateRequired(addressLine, 'Address line');
    const cityVal = validateRequired(city, 'City');
    const stateVal = validateRequired(state, 'State / Province');
    const zipVal = validateRequired(postalCode, 'Postal code / Zip');
    const countryVal = validateRequired(country, 'Country');

    if (!nameVal.isValid) { newErrors.fullName = nameVal.error; isValid = false; }
    if (!emailVal.isValid) { newErrors.email = emailVal.error; isValid = false; }
    if (!phoneVal.isValid) { newErrors.phone = phoneVal.error; isValid = false; }
    if (!addressVal.isValid) { newErrors.addressLine = addressVal.error; isValid = false; }
    if (!cityVal.isValid) { newErrors.city = cityVal.error; isValid = false; }
    if (!stateVal.isValid) { newErrors.state = stateVal.error; isValid = false; }
    if (!zipVal.isValid) { newErrors.postalCode = zipVal.error; isValid = false; }
    if (!countryVal.isValid) { newErrors.country = countryVal.error; isValid = false; }

    setErrors(newErrors);

    if (!isValid) {
      Alert.alert('Incomplete Form', 'Please correct the errors in the form before proceeding.');
      return;
    }

    // Save to checkout slice
    dispatch(
      saveShippingInfo({
        fullName,
        email,
        phone,
        addressLine,
        city,
        state,
        postalCode,
        country,
        orderNotes,
      })
    );

    // Route to payment screen
    router.push('/checkout/payment' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Shipping Address" showBackButton />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Order Review Section */}
          {cartItems.length > 0 && (
            <React.Fragment>
              <Text style={styles.sectionHeader}>Review Your Items</Text>
              <View style={styles.itemsReviewContainer}>
                {cartItems.map((item) => {
                  const { product, quantity } = item;
                  if (!product) return null;
                  const activePrice = product.discount_price !== null && product.discount_price !== undefined
                    ? product.discount_price
                    : product.price;
                  return (
                    <View key={item.id} style={styles.itemRow}>
                      <Image source={{ uri: getValidImageUrl(product.image_url) }} style={styles.itemImage} />
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemTitle} numberOfLines={1}>{product.title}</Text>
                        <Text style={styles.itemQty}>Qty: {quantity} × ${activePrice.toFixed(2)}</Text>
                      </View>
                      <Text style={styles.itemTotalPrice}>${(activePrice * quantity).toFixed(2)}</Text>
                    </View>
                  );
                })}
                
                {/* Compact Cost Breakdown inside the Review card */}
                <View style={styles.compactBreakdown}>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Subtotal</Text>
                    <Text style={styles.breakdownValue}>${subtotal.toFixed(2)}</Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Shipping</Text>
                    <Text style={[styles.breakdownValue, shippingFee === 0 && styles.freeShipping]}>
                      {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                    </Text>
                  </View>
                  <View style={styles.breakdownDivider} />
                  <View style={[styles.breakdownRow, styles.breakdownTotalRow]}>
                    <Text style={styles.breakdownTotalLabel}>Total Amount</Text>
                    <Text style={styles.breakdownTotalValue}>${total.toFixed(2)}</Text>
                  </View>
                </View>
              </View>
            </React.Fragment>
          )}

          <Text style={styles.sectionHeader}>Customer Details</Text>
          
          <Input
            label="FULL NAME"
            placeholder="John Doe"
            value={fullName}
            onChangeText={setFullName}
            error={errors.fullName}
            leftIcon="person-outline"
          />

          <Input
            label="EMAIL ADDRESS"
            placeholder="john@example.com"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            leftIcon="mail-outline"
          />

          <Input
            label="PHONE NUMBER"
            placeholder="+1 (555) 0199"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            error={errors.phone}
            leftIcon="call-outline"
          />

          <Text style={styles.sectionHeader}>Delivery Address</Text>
          
          <Input
            label="SHIPPING ADDRESS"
            placeholder="Street address, P.O. Box, Apt #"
            value={addressLine}
            onChangeText={setAddressLine}
            error={errors.addressLine}
            leftIcon="location-outline"
          />

          <View style={styles.gridRow}>
            <View style={{ flex: 1 }}>
              <Input
                label="CITY"
                placeholder="New York"
                value={city}
                onChangeText={setCity}
                error={errors.city}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="STATE"
                placeholder="NY"
                value={state}
                onChangeText={setState}
                error={errors.state}
              />
            </View>
          </View>

          <View style={styles.gridRow}>
            <View style={{ flex: 1 }}>
              <Input
                label="ZIP CODE"
                placeholder="10001"
                keyboardType="number-pad"
                value={postalCode}
                onChangeText={setPostalCode}
                error={errors.postalCode}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="COUNTRY"
                placeholder="United States"
                value={country}
                onChangeText={setCountry}
                error={errors.country}
              />
            </View>
          </View>

          <Input
            label="ORDER NOTES (OPTIONAL)"
            placeholder="E.g. Instructions for gate codes, front door, etc."
            multiline
            numberOfLines={3}
            value={orderNotes}
            onChangeText={setOrderNotes}
            style={{ height: 80, paddingTop: SPACING.sm }}
          />

          <Button
            title="Continue to Payment"
            onPress={handleContinue}
            variant="accent"
            style={styles.continueBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingBottom: SPACING.xxl,
  },
  sectionHeader: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
  },
  gridRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'flex-start',
  },
  continueBtn: {
    marginTop: SPACING.lg,
    width: '100%',
  },
  itemsReviewContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  itemDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  itemTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    color: COLORS.text,
  },
  itemQty: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  itemTotalPrice: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    color: COLORS.primary,
  },
  compactBreakdown: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  breakdownLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  freeShipping: {
    color: COLORS.success,
    fontWeight: '700',
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  breakdownTotalRow: {
    marginTop: 2,
  },
  breakdownTotalLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    color: COLORS.primary,
  },
  breakdownTotalValue: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '800',
    color: COLORS.accent,
  },
});
