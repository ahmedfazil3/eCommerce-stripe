import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { COLORS, SPACING, TYPOGRAPHY } from '../lib/constants';

export default function SplashScreen() {
  useEffect(() => {
    const checkSession = async () => {
      // Small delay for branding view
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/(tabs)' as any);
      } else {
        router.replace('/(auth)/login' as any);
      }
    };

    checkSession();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Ionicons name="bag-handle" size={80} color={COLORS.accent} />
        <Text style={styles.logoText}>VELOCITY</Text>
        <Text style={styles.subtitle}>Premium E-Commerce</Text>
      </View>
      
      <View style={styles.loaderContainer}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    ...TYPOGRAPHY.h1,
    fontSize: 38,
    color: COLORS.card,
    fontWeight: '900',
    marginTop: SPACING.md,
    letterSpacing: 2,
  },
  subtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: SPACING.xs,
    letterSpacing: 1.5,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 80,
  },
});
