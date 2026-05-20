import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem } from '../../types/cart';
import { COLORS, SPACING, SHADOWS, TYPOGRAPHY } from '../../lib/constants';

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (newQty: number) => void;
  onRemove: () => void;
  onPress: () => void;
}

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

export const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  onPress,
}) => {
  const { product, quantity } = item;
  if (!product) return null;

  const hasDiscount = product.discount_price !== null && product.discount_price !== undefined;
  const singlePrice = hasDiscount && product.discount_price ? product.discount_price : product.price;
  const imageUrl = getValidImageUrl(product.image_url);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.container}
    >
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {product.title}
          </Text>
          
          <TouchableOpacity
            onPress={onRemove}
            style={styles.removeButton}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        <Text style={styles.price}>
          ${singlePrice.toFixed(2)}{' '}
          {hasDiscount && (
            <Text style={styles.originalPrice}>
              ${product.price.toFixed(2)}
            </Text>
          )}
        </Text>

        <View style={styles.footerRow}>
          <Text style={styles.totalItemPrice}>
            Total: ${(singlePrice * quantity).toFixed(2)}
          </Text>
          
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              onPress={() => onUpdateQuantity(quantity - 1)}
              style={styles.qtyButton}
              activeOpacity={0.7}
              disabled={quantity <= 1}
            >
              <Ionicons
                name="remove"
                size={16}
                color={quantity <= 1 ? COLORS.border : COLORS.text}
              />
            </TouchableOpacity>
            
            <Text style={styles.qtyText}>{quantity}</Text>
            
            <TouchableOpacity
              onPress={() => onUpdateQuantity(quantity + 1)}
              style={styles.qtyButton}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={16} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    flexDirection: 'row',
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  title: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  removeButton: {
    padding: SPACING.xs,
  },
  price: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginVertical: SPACING.xs,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    fontSize: 11,
    fontWeight: '400',
    color: COLORS.border,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  totalItemPrice: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    color: COLORS.primary,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.background,
  },
  qtyButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: SPACING.sm,
  },
});
export default CartItemCard;
