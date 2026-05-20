import React from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Category } from '../../types/product';
import { COLORS, SPACING, SHADOWS, TYPOGRAPHY } from '../../lib/constants';

interface CategoryCardProps {
  category: Category;
  isSelected: boolean;
  onPress: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isSelected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.container,
        isSelected && styles.containerSelected,
      ]}
    >
      <Text
        style={[
          styles.text,
          isSelected && styles.textSelected,
        ]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 24,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  containerSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  text: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    fontWeight: '600',
  },
  textSelected: {
    color: COLORS.card,
  },
});
export default CategoryCard;
