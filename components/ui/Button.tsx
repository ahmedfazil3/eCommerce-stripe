import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, SHADOWS, TYPOGRAPHY } from '../../lib/constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'text';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const isOutline = variant === 'outline';
  const isText = variant === 'text';
  const isSecondary = variant === 'secondary';
  const isAccent = variant === 'accent';

  const isDisabled = disabled || loading;

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          color={isOutline || isText ? COLORS.accent : COLORS.card}
          size="small"
        />
      );
    }

    return (
      <React.Fragment>
        {icon && <React.Fragment>{icon}</React.Fragment>}
        <Text
          style={[
            styles.text,
            isOutline && styles.textOutline,
            isText && styles.textText,
            isSecondary && styles.textSecondary,
            textStyle,
          ]}
        >
          {title}
        </Text>
      </React.Fragment>
    );
  };

  if (variant === 'accent') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        disabled={isDisabled}
        style={[styles.pressable, style]}
      >
        <LinearGradient
          colors={[...COLORS.accentGradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.container, styles.accent, isDisabled && styles.disabled]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.container,
        styles[variant] as ViewStyle,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  container: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    width: '100%',
  },
  primary: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.light,
  },
  secondary: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  accent: {
    // Background is rendered by the LinearGradient
    width: '100%',
    ...SHADOWS.medium,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  text: {
    ...TYPOGRAPHY.button,
    color: COLORS.card,
  },
  textSecondary: {
    color: COLORS.text,
  },
  textOutline: {
    color: COLORS.primary,
  },
  textText: {
    color: COLORS.accent,
  },
  disabled: {
    opacity: 0.5,
  },
});
export default Button;
