import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../../lib/constants';
import { Product } from '../../types/product';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onFavoritePress: () => void;
  onAddCartPress: () => void;
  onPress: () => void;
  style?: any;
}

const PLACEHOLDER_IMAGE = 'https://unsplash.com/photos/podium-in-abstract-purple-composition-3d-render-3d-illustration-background-mockup-3d-purple-with-podium-and-minimal-purple-wall-scene-3d-mockup-abstract-geometric-shape-purple-pastel-color-stage-for-awards-on-website-in-modern-k4ipIOoilBA?q=80&w=600'; // Sleek grey sneaker

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

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFavorite,
  onFavoritePress,
  onAddCartPress,
  onPress,
  style,
}) => {
  const hasDiscount = product.discount_price !== null && product.discount_price !== undefined;

  // Calculate discount percentage if discount exists
  let discountPercentage = 0;
  if (hasDiscount && product.discount_price) {
    discountPercentage = Math.round(((product.price - product.discount_price) / product.price) * 100);
  }

  const imageUrl = getValidImageUrl(product.image_url);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.container, style]}
    >
      {/* Image Gallery Header */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPercentage}%</Text>
          </View>
        )}

        {/* Wishlist Icon */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={onFavoritePress}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite ? COLORS.error : COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Info details */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {product.title}
        </Text>

        <Text style={styles.description} numberOfLines={1}>
          {product.description || 'Premium craftsmanship and comfortable design.'}
        </Text>

        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color={COLORS.star} />
          <Text style={styles.ratingText}>{product.rating?.toFixed(1) || '4.5'}</Text>
        </View>

        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            {hasDiscount ? (
              <React.Fragment>
                <Text style={styles.discountPrice}>
                  ${product.discount_price?.toFixed(2)}
                </Text>
                <Text style={styles.originalPrice}>
                  ${product.price.toFixed(2)}
                </Text>
              </React.Fragment>
            ) : (
              <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            )}
          </View>

          {/* Add to Cart small button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={onAddCartPress}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color={COLORS.card} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    width: '47%',
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  imageContainer: {
    height: 150,
    width: '100%',
    backgroundColor: COLORS.background,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.card,
    fontWeight: '700',
  },
  favoriteButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.card,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.light,
  },
  infoContainer: {
    padding: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  description: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  ratingText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.text,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  priceContainer: {
    flexDirection: 'column',
  },
  price: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '700',
    color: COLORS.primary,
  },
  discountPrice: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '700',
    color: COLORS.error,
  },
  originalPrice: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.light,
  },
});
export default ProductCard;
