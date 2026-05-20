import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { login, clearError } from '../../redux/slices/authSlice';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { validateEmail, validatePassword } from '../../utils/validation';
import { COLORS, SPACING, TYPOGRAPHY } from '../../lib/constants';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [passErr, setPassErr] = useState<string | null>(null);

  useEffect(() => {
    // Clear redux errors on mount
    dispatch(clearError());
  }, [dispatch]);

  const handleLogin = async () => {
    // Reset local errors
    setEmailErr(null);
    setPassErr(null);

    const emailValidation = validateEmail(email);
    const passValidation = validatePassword(password);

    let isValid = true;
    if (!emailValidation.isValid) {
      setEmailErr(emailValidation.error);
      isValid = false;
    }
    if (!passValidation.isValid) {
      setPassErr(passValidation.error);
      isValid = false;
    }

    if (!isValid) return;

    const resultAction = await dispatch(login({ email, password }));
    if (login.fulfilled.match(resultAction)) {
      router.replace('/(tabs)' as any);
    } else {
      const errMsg = resultAction.payload as string || 'Login failed. Please check your credentials.';
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
          <View style={styles.header}>
            <Ionicons name="bag-handle" size={48} color={COLORS.accent} />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue shopping premium products</Text>
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

          <Input
            label="PASSWORD"
            placeholder="••••••••"
            secureTextEntry
            leftIcon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            error={passErr}
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password' as any)}
            style={styles.forgotButton}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Button
            title="Sign In"
            onPress={handleLogin}
            variant="accent"
            loading={loading}
            style={styles.loginBtn}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup' as any)} activeOpacity={0.7}>
            <Text style={styles.signupText}>Sign Up</Text>
          </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.primary,
    fontWeight: '900',
    marginTop: SPACING.md,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  form: {
    width: '100%',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
  },
  forgotText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.accent,
    fontWeight: '600',
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
  loginBtn: {
    marginTop: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xxl,
  },
  footerText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textMuted,
  },
  signupText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.accent,
    fontWeight: '700',
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
