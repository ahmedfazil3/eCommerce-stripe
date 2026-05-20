import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchProductById, clearSelectedProduct } from '../../redux/slices/productSlice';
import { addToCart, fetchCartItems } from '../../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import { COLORS, SPACING, SHADOWS, TYPOGRAPHY, WINDOW_WIDTH } from '../../lib/constants';

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

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const { selectedProduct, loading, error } = useAppSelector((state) => state.product);
  const { wishlistItems } = useAppSelector((state) => state.wishlist);
  const { user } = useAppSelector((state) => state.auth);

  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [dispatch, id]);

  const isFavorite = wishlistItems.some((item) => item.product_id === id);

  const handleWishlistToggle = () => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please sign in to save items.', [
        { text: 'Cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/login' as any) },
      ]);
      return;
    }
    if (isFavorite) {
      dispatch(removeFromWishlist({ userId: user.id, productIdOrItemId: id }));
    } else {
      dispatch(addToWishlist({ userId: user.id, productId: id }));
    }
  };

  const handleAddToCart = async (checkoutImmediately = false) => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please sign in to make purchases.', [
        { text: 'Cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/login' as any) },
      ]);
      return;
    }

    try {
      const action = await dispatch(addToCart({ userId: user.id, productId: id, quantity }));
      if (addToCart.fulfilled.match(action)) {
        if (checkoutImmediately) {
          router.push('/checkout' as any);
        } else {
          Alert.alert(
            'Added to Cart',
            `Successfully added ${quantity} item(s) to your cart!`,
            [
              { text: 'Continue Shopping' },
              { text: 'View Cart', onPress: () => router.push('/(tabs)/cart' as any) },
            ]
          );
        }
      }
    } catch (e: any) {
      Alert.alert('Error', 'Could not add product to cart. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Loading Details..." showBackButton />
        <Loader type="spinner" />
      </SafeAreaView>
    );
  }

  if (error || !selectedProduct) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Product Details" showBackButton />
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={60} color={COLORS.error} />
          <Text style={styles.errorTitle}>Product Not Found</Text>
          <Text style={styles.errorDesc}>
            {error || "The selected product could not be loaded. It may have been deleted or is currently unavailable."}
          </Text>
          <Button title="Back to Shop" onPress={() => router.back()} variant="accent" style={{ maxWidth: 200 }} />
        </View>
      </SafeAreaView>
    );
  }

  const hasDiscount = selectedProduct.discount_price !== null && selectedProduct.discount_price !== undefined;
  const activePrice = hasDiscount && selectedProduct.discount_price ? selectedProduct.discount_price : selectedProduct.price;
  const imageUrl = getValidImageUrl(selectedProduct.image_url);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Product Details"
        showBackButton
        rightElement={
          <TouchableOpacity onPress={handleWishlistToggle} activeOpacity={0.7} style={styles.heartBtnIcon}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? COLORS.error : COLORS.text}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Large Main Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>SALE DISCOUNT</Text>
            </View>
          )}
        </View>

        {/* Detailed Info Card */}
        <View style={styles.detailsCard}>
          <View style={styles.infoRow}>
            <Text style={styles.title}>{selectedProduct.title}</Text>
          </View>

          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {Array.from({ length: 5 }).map((_, idx) => (
                <Ionicons
                  key={idx}
                  name={idx < Math.floor(selectedProduct.rating) ? 'star' : 'star-outline'}
                  size={16}
                  color={COLORS.star}
                />
              ))}
            </View>
            <Text style={styles.ratingText}>
              {selectedProduct.rating?.toFixed(1) || '4.5'} Rating
            </Text>
          </View>

          <View style={styles.priceRow}>
            <View style={styles.priceContainer}>
              {hasDiscount ? (
                <React.Fragment>
                  <Text style={styles.discountPrice}>${selectedProduct.discount_price?.toFixed(2)}</Text>
                  <Text style={styles.originalPrice}>Original: ${selectedProduct.price.toFixed(2)}</Text>
                </React.Fragment>
              ) : (
                <Text style={styles.price}>${selectedProduct.price.toFixed(2)}</Text>
              )}
            </View>

            <View style={styles.stockStatus}>
              <View
                style={[
                  styles.stockDot,
                  { backgroundColor: selectedProduct.stock > 0 ? COLORS.success : COLORS.error },
                ]}
              />
              <Text
                style={[
                  styles.stockText,
                  { color: selectedProduct.stock > 0 ? COLORS.success : COLORS.error },
                ]}
              >
                {selectedProduct.stock > 0 ? `In Stock (${selectedProduct.stock})` : 'Out of Stock'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {selectedProduct.description ||
              'Velocity standard apparel & footwear delivers premium details, customized sizing, high breathable material configurations, and flexible ergonomic properties for athletic and leisure tasks. Perfect for all seasons, designed for modern performance and comfort.'}
          </Text>

          <View style={styles.divider} />

          {/* Quantity Selector Option */}
          {selectedProduct.stock > 0 && (
            <View style={styles.quantityRow}>
              <Text style={styles.quantityLabel}>Quantity</Text>
              
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  style={styles.qtyBtn}
                  activeOpacity={0.7}
                  disabled={quantity <= 1}
                >
                  <Ionicons name="remove" size={20} color={quantity <= 1 ? COLORS.border : COLORS.text} />
                </TouchableOpacity>
                
                <Text style={styles.qtyText}>{quantity}</Text>
                
                <TouchableOpacity
                  onPress={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                  style={styles.qtyBtn}
                  activeOpacity={0.7}
                  disabled={quantity >= selectedProduct.stock}
                >
                  <Ionicons name="add" size={20} color={COLORS.text} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Bottom Button Row */}
      {selectedProduct.stock > 0 ? (
        <View style={styles.bottomBar}>
          <Button
            title="Add to Cart"
            onPress={() => handleAddToCart(false)}
            variant="secondary"
            style={styles.bottomBtn}
          />
          <Button
            title="Buy Now"
            onPress={() => handleAddToCart(true)}
            variant="accent"
            style={styles.bottomBtn}
          />
        </View>
      ) : (
        <View style={styles.bottomBar}>
          <Button title="Sold Out" onPress={() => {}} disabled variant="primary" style={{ width: '100%' }} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    paddingBottom: 120,
  },
  imageContainer: {
    width: WINDOW_WIDTH,
    height: 320,
    backgroundColor: COLORS.card,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.lg,
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    ...SHADOWS.medium,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.card,
    letterSpacing: 1.5,
  },
  heartBtnIcon: {
    padding: SPACING.xs,
  },
  detailsCard: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    padding: SPACING.lg,
    minHeight: 400,
    ...SHADOWS.heavy,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoRow: {
    marginBottom: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    fontWeight: '800',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  priceContainer: {
    flexDirection: 'column',
  },
  price: {
    ...TYPOGRAPHY.h2,
    fontWeight: '800',
    color: COLORS.primary,
  },
  discountPrice: {
    ...TYPOGRAPHY.h2,
    fontWeight: '800',
    color: COLORS.error,
  },
  originalPrice: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  stockStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  description: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textMuted,
    lineHeight: 22,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  quantityLabel: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '700',
    color: COLORS.text,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
  },
  qtyBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '800',
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
    ...SHADOWS.heavy,
  },
  bottomBtn: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  errorTitle: {
    ...TYPOGRAPHY.h2,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  errorDesc: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
});
