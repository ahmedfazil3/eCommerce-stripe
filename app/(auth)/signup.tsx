import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { COLORS, SPACING, TYPOGRAPHY } from '../../lib/constants';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { clearError, signup } from '../../redux/slices/authSlice';
import { validateEmail, validatePassword, validateRequired } from '../../utils/validation';

export default function SignupScreen() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [nameErr, setNameErr] = useState<string | null>(null);
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [passErr, setPassErr] = useState<string | null>(null);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSignup = async () => {
    setNameErr(null);
    setEmailErr(null);
    setPassErr(null);

    const nameValidation = validateRequired(fullName, 'Full name');
    const emailValidation = validateEmail(email);
    const passValidation = validatePassword(password);

    let isValid = true;
    if (!nameValidation.isValid) {
      setNameErr(nameValidation.error);
      isValid = false;
    }
    if (!emailValidation.isValid) {
      setEmailErr(emailValidation.error);
      isValid = false;
    }
    if (!passValidation.isValid) {
      setPassErr(passValidation.error);
      isValid = false;
    }

    if (!isValid) return;

    const resultAction = await dispatch(signup({ email, password, fullName }));
    if (signup.fulfilled.match(resultAction)) {
      Alert.alert(
        'Success',
        'Your account was created successfully! Please sign in to verify.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login' as any) }]
      );
    } else {
      const errMsg = resultAction.payload as string || 'Signup failed. Please try again.';
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to discover the ultimate store catalog</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="FULL NAME"
              placeholder="John Doe"
              leftIcon="person-outline"
              value={fullName}
              onChangeText={setFullName}
              error={nameErr}
            />

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

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Button
              title="Create Account"
              onPress={handleSignup}
              variant="accent"
              loading={loading}
              style={styles.signupBtn}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login' as any)} activeOpacity={0.7}>
              <Text style={styles.loginText}>Sign In</Text>
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
  signupBtn: {
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
  loginText: {
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
