import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { forgotPassword, clearError } from '../../redux/slices/authSlice';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { validateEmail } from '../../utils/validation';
import { COLORS, SPACING, TYPOGRAPHY } from '../../lib/constants';

export default function ForgotPasswordScreen() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [emailErr, setEmailErr] = useState<string | null>(null);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleReset = async () => {
    setEmailErr(null);

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailErr(emailValidation.error);
      return;
    }

    const resultAction = await dispatch(forgotPassword(email));
    if (forgotPassword.fulfilled.match(resultAction)) {
      Alert.alert(
        'Email Sent',
        'If an account exists with this email address, you will receive instructions shortly on how to reset your password.',
        [{ text: 'Back to Login', onPress: () => router.replace('/(auth)/login' as any) }]
      );
    } else {
      const errMsg = resultAction.payload as string || 'Password reset request failed. Please try again.';
      Alert.alert('Error', errMsg);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            onPress={() => router.replace('/(auth)/login' as any)}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="key-outline" size={40} color={COLORS.accent} />
            </View>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you instructions to reset your password.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="EMAIL ADDRESS"
              placeholder="yourname@example.com"
              keyboardType="email-address"
              leftIcon="mail-outline"
              value={email}
              onChangeText={setEmail}
              error={emailErr}
            />

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Button
              title="Reset Password"
              onPress={handleReset}
              variant="accent"
              loading={loading}
              style={styles.resetBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: SPACING.lg,
    padding: SPACING.xs,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.primary,
    fontWeight: '900',
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
    lineHeight: 20,
    paddingHorizontal: SPACING.lg,
  },
  form: {
    width: '100%',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: SPACING.md,
    borderRadius: 10,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  errorText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.error,
    fontWeight: '600',
    textAlign: 'center',
  },
  resetBtn: {
    marginTop: SPACING.sm,
  },
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
