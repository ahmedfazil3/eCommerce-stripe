import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { logout, updateProfile, fetchProfile } from '../../redux/slices/authSlice';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import { COLORS, SPACING, SHADOWS, TYPOGRAPHY } from '../../lib/constants';

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const { user, profile, loading } = useAppSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (user && !profile) {
      dispatch(fetchProfile(user.id));
    }
  }, [dispatch, user, profile]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
  }, [profile, isEditing]);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await dispatch(logout());
          router.replace('/(auth)/login' as any);
        },
      },
    ]);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    if (fullName.trim() === '') {
      Alert.alert('Error', 'Full name cannot be empty.');
      return;
    }

    const action = await dispatch(
      updateProfile({
        userId: user.id,
        updates: {
          full_name: fullName,
          phone: phone,
        },
      })
    );

    if (updateProfile.fulfilled.match(action)) {
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } else {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="My Profile" />
        <EmptyState
          title="Sign In Required"
          description="Log in to manage your account details, edit profiles, and view orders."
          icon="person-outline"
          actionTitle="Sign In Now"
          onActionPress={() => router.push('/(auth)/login' as any)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="My Profile"
        rightElement={
          <TouchableOpacity onPress={handleLogout} activeOpacity={0.7} style={styles.logoutBtnIcon}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {profile?.full_name ? profile.full_name[0].toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={styles.profileName}>{profile?.full_name || 'Customer'}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
        </View>

        {/* Profile details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Account Information</Text>
            {!isEditing && (
              <TouchableOpacity onPress={() => setIsEditing(true)} activeOpacity={0.7}>
                <Text style={styles.editLink}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          {isEditing ? (
            <View style={styles.form}>
              <Input
                label="FULL NAME"
                value={fullName}
                onChangeText={setFullName}
                placeholder="John Doe"
                leftIcon="person-outline"
              />
              <Input
                label="PHONE NUMBER"
                value={phone}
                onChangeText={setPhone}
                placeholder="+1 555-0199"
                keyboardType="phone-pad"
                leftIcon="call-outline"
              />

              <View style={styles.formActions}>
                <Button
                  title="Cancel"
                  onPress={() => setIsEditing(false)}
                  variant="secondary"
                  style={styles.actionBtn}
                />
                <Button
                  title="Save"
                  onPress={handleSaveProfile}
                  variant="accent"
                  loading={loading}
                  style={styles.actionBtn}
                />
              </View>
            </View>
          ) : (
            <View style={styles.infoList}>
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={20} color={COLORS.textMuted} />
                <View style={styles.infoTexts}>
                  <Text style={styles.infoLabel}>Full Name</Text>
                  <Text style={styles.infoValue}>{profile?.full_name || 'Not provided'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={20} color={COLORS.textMuted} />
                <View style={styles.infoTexts}>
                  <Text style={styles.infoLabel}>Phone Number</Text>
                  <Text style={styles.infoValue}>{profile?.phone || 'Not provided'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={20} color={COLORS.textMuted} />
                <View style={styles.infoTexts}>
                  <Text style={styles.infoLabel}>Email Address</Text>
                  <Text style={styles.infoValue}>{user.email}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Menu Options */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>My Actions</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/orders' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="receipt-outline" size={22} color={COLORS.accent} />
              <Text style={styles.menuText}>Order History</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/wishlist' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="heart-outline" size={22} color={COLORS.accent} />
              <Text style={styles.menuText}>My Wishlist</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/cart' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="cart-outline" size={22} color={COLORS.accent} />
              <Text style={styles.menuText}>My Shopping Cart</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <Button
          title="Sign Out"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutBtn}
        />
        <View style={styles.spacingBottom} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Simple EmptyState wrapper for profile sub-screens if needed
const EmptyState = ({
  title,
  description,
  icon,
  actionTitle,
  onActionPress,
}: any) => (
  <View style={styles.emptyContainer}>
    <Ionicons name={icon} size={60} color={COLORS.textMuted} style={{ marginBottom: SPACING.md }} />
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyText}>{description}</Text>
    <Button title={actionTitle} onPress={onActionPress} variant="accent" style={{ maxWidth: 200 }} />
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SPACING.lg,
  },
  logoutBtnIcon: {
    padding: SPACING.xs,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  avatarInitial: {
    fontSize: 36,
    color: COLORS.card,
    fontWeight: '800',
  },
  profileName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    fontWeight: '800',
  },
  profileEmail: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...SHADOWS.light,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: COLORS.primary,
  },
  editLink: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.accent,
    fontWeight: '700',
  },
  infoList: {
    gap: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  infoTexts: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  infoValue: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: 2,
  },
  form: {
    width: '100%',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  actionBtn: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  menuText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text,
    fontWeight: '600',
  },
  logoutBtn: {
    marginTop: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  spacingBottom: {
    height: 100,
  },
});
