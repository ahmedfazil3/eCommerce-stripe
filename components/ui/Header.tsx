import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING, TYPOGRAPHY } from '../../lib/constants';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  rightElement?: React.ReactNode;
  style?: ViewStyle;
  onBackPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  rightElement,
  style,
  onBackPress,
}) => {
  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
      
      <View style={styles.rightContainer}>
        {rightElement && rightElement}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  leftContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  backButton: {
    padding: SPACING.xs,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    fontWeight: '700',
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
});
export default Header;
