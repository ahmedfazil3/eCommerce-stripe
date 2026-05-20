import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Text, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import ProductCard from '../../components/product/ProductCard';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Header from '../../components/ui/Header';
import { COLORS, SPACING } from '../../lib/constants';

export default function WishlistScreen() {
  const dispatch = useAppDispatch();
  const { wishlistItems, loading } = useAppSelector((state) => state.wishlist);
  const { user } = useAppSelector((state) => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchWishlist(user.id));
    }
  }, [dispatch, user]);

  const handleRefresh = async () => {
    if (user) {
      setRefreshing(true);
      await dispatch(fetchWishlist(user.id));
      setRefreshing(false);
    }
  };

  const handleRemove = (productId: string) => {
    if (user) {
      dispatch(removeFromWishlist({ userId: user.id, productIdOrItemId: productId }));
    }
  };

  const handleAddToCart = (productId: string) => {
    if (user) {
      dispatch(addToCart({ userId: user.id, productId, quantity: 1 }));
      Alert.alert('Added to Cart', 'Item has been added to your shopping cart successfully.');
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="My Wishlist" />
        <EmptyState
          title="Sign In Required"
          description="Authenticate to view your custom saved products, catalog favorites, and items."
          icon="heart-outline"
          actionTitle="Sign In Now"
          onActionPress={() => router.push('/(auth)/login' as any)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="My Wishlist" />
      
      {loading && wishlistItems.length === 0 ? (
        <Loader type="spinner" />
      ) : wishlistItems.length === 0 ? (
        <EmptyState
          title="Your Wishlist is Empty"
          description="Explore our new arrivals and tap the heart icon on any product to save it here!"
          icon="heart-outline"
          actionTitle="Explore Shop"
          onActionPress={() => router.push('/(tabs)' as any)}
        />
      ) : (
        <FlatList
          data={wishlistItems}
          renderItem={({ item }) => {
            const product = item.product;
            if (!product) return null;
            return (
              <ProductCard
                product={product}
                isFavorite={true}
                onFavoritePress={() => handleRemove(product.id)}
                onAddCartPress={() => handleAddToCart(product.id)}
                onPress={() => router.push(`/product/${product.id}` as any)}
              />
            );
          }}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.accent]} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    padding: SPACING.lg,
    paddingBottom: 80,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
});
