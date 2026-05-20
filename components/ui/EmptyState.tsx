import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';
import { COLORS, SPACING, TYPOGRAPHY } from '../../lib/constants';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  actionTitle?: string;
  onActionPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionTitle,
  onActionPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={64} color={COLORS.textMuted} />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      
      {actionTitle && onActionPress && (
        <Button
          title={actionTitle}
          onPress={onActionPress}
          variant="accent"
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
    textAlign: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontWeight: '700',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  description: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  button: {
    maxWidth: 220,
  },
});
export default EmptyState;
