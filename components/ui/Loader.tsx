import React from 'react';
import { View, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { COLORS, SPACING } from '../../lib/constants';

interface LoaderProps {
  type?: 'spinner' | 'skeleton' | 'skeleton-row';
  count?: number;
  height?: number;
  width?: string | number;
  style?: ViewStyle;
}

export const Loader: React.FC<LoaderProps> = ({
  type = 'spinner',
  count = 3,
  height = 100,
  width = '100%',
  style,
}) => {
  if (type === 'spinner') {
    return (
      <View style={[styles.centered, style]}>
        <View style={styles.spinnerCard}>
          <ActivityIndicator color={COLORS.accent} size="large" />
        </View>
      </View>
    );
  }

  const skeletons = Array.from({ length: count });

  if (type === 'skeleton-row') {
    return (
      <View style={[styles.row, style]}>
        {skeletons.map((_, index) => (
          <View
            key={index}
            style={[
              styles.skeletonBlock,
              {
                height: 48,
                width: 80,
                borderRadius: 24,
                marginRight: SPACING.sm,
              },
            ]}
          />
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.skeletonContainer, style]}>
      {skeletons.map((_, index) => (
        <View
          key={index}
          style={[
            styles.skeletonBlock,
            {
              height: height,
              width: width as any,
              borderRadius: 14,
              marginBottom: SPACING.md,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    minHeight: 200,
  },
  spinnerCard: {
    padding: SPACING.xl,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  skeletonContainer: {
    padding: SPACING.lg,
    width: '100%',
  },
  skeletonBlock: {
    backgroundColor: COLORS.border,
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: SPACING.lg,
    marginVertical: SPACING.sm,
  },
});
export default Loader;
