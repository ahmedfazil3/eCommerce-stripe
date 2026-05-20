import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../lib/constants';
import { useAppSelector } from '../../redux/hooks';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { cartItems } = useAppSelector((state) => state.cart);

  const cartBadgeCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: 50 + (insets.bottom > 0 ? insets.bottom : 8),
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'bag' : 'bag-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'heart' : 'heart-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.cartIconContainer as any}>
              <Ionicons name={focused ? 'cart' : 'cart-outline'} size={22} color={color} />
              {cartBadgeCount > 0 && (
                <View style={styles.badge as any}>
                  <Text style={styles.badgeText as any}>{cartBadgeCount}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  cartIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: COLORS.accent,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.card,
  },
  badgeText: {
    color: COLORS.card,
    fontSize: 8,
    fontWeight: '800',
    textAlign: 'center',
  },
});
