import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryCard from '../../components/product/CategoryCard';
import ProductCard from '../../components/product/ProductCard';
import EmptyState from '../../components/ui/EmptyState';
import Loader from '../../components/ui/Loader';
import { COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../../lib/constants';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { addToCart } from '../../redux/slices/cartSlice';
import {
  fetchCategories,
  fetchFeaturedProducts,
  fetchProducts,
  filterByCategory,
  searchProducts,
} from '../../redux/slices/productSlice';
import { addToWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice';

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const { products, featuredProducts, categories, loading } = useAppSelector((state) => state.product);
  const { wishlistItems } = useAppSelector((state) => state.wishlist);
  const { user } = useAppSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    loadData();
  }, [dispatch]);

  const loadData = async () => {
    dispatch(fetchCategories());
    dispatch(fetchFeaturedProducts());
    dispatch(fetchProducts());
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setSearchQuery('');
    setSelectedCategoryId(null);
    await loadData();
    setRefreshing(false);
  };

  const handleCategoryPress = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    setSearchQuery('');
    if (categoryId) {
      dispatch(filterByCategory(categoryId));
    } else {
      dispatch(fetchProducts());
    }
  };

  const handleSearchSubmit = () => {
    setSelectedCategoryId(null);
    if (searchQuery.trim() !== '') {
      dispatch(searchProducts(searchQuery));
    } else {
      dispatch(fetchProducts());
    }
  };

  const handleWishlistToggle = (productId: string) => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please sign in to save items to your wishlist.', [
        { text: 'Cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/login' as any) },
      ]);
      return;
    }

    const isInWishlist = wishlistItems.some((item) => item.product_id === productId);
    if (isInWishlist) {
      dispatch(removeFromWishlist({ userId: user.id, productIdOrItemId: productId }));
    } else {
      dispatch(addToWishlist({ userId: user.id, productId }));
    }
  };

  const handleAddToCart = (productId: string) => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please sign in to add items to your cart.', [
        { text: 'Cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/login' as any) },
      ]);
      return;
    }

    dispatch(addToCart({ userId: user.id, productId, quantity: 1 }));
    Alert.alert('Added to Cart', 'Item has been added to your shopping cart successfully.');
  };

  const renderProductItem = ({ item }: { item: any }) => {
    const isFavorite = wishlistItems.some((w) => w.product_id === item.id);
    return (
      <ProductCard
        product={item}
        isFavorite={isFavorite}
        onFavoritePress={() => handleWishlistToggle(item.id)}
        onAddCartPress={() => handleAddToCart(item.id)}
        onPress={() => router.push(`/product/${item.id}` as any)}
      />
    );
  };

  const renderFeaturedItem = ({ item }: { item: any }) => {
    const isFavorite = wishlistItems.some((w) => w.product_id === item.id);
    return (
      <ProductCard
        product={item}
        isFavorite={isFavorite}
        onFavoritePress={() => handleWishlistToggle(item.id)}
        onAddCartPress={() => handleAddToCart(item.id)}
        onPress={() => router.push(`/product/${item.id}` as any)}
        style={styles.featuredCard}
      />
    );
  };

  // Build temporary Category All Badge
  const allCategory = { id: '', name: 'All Products', image_url: null, created_at: '' };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header Search Section */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Text style={styles.brandText}>VELOCITY</Text>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => router.push('/(tabs)/cart' as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="cart-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
          <TextInput
            placeholder="Search premium collections..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); dispatch(fetchProducts()); }}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.accent]} />
        }
      >
        {/* Banner Section */}
        {products.length > 0 && !selectedCategoryId && searchQuery === '' && (
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000' }}
            style={styles.heroBanner}
            imageStyle={styles.heroImage}
          >
            <View style={styles.overlay}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>LIMITED SEASON</Text>
              </View>
              <Text style={styles.bannerTitle}>UP TO 40% OFF</Text>
              <Text style={styles.bannerSubtitle}>Discover high craftsmanship footwear & clothing</Text>
              <TouchableOpacity
                onPress={() => handleCategoryPress(categories[0]?.id || null)}
                style={styles.bannerBtn}
              >
                <Text style={styles.bannerBtnText}>Shop Collection</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        )}

        {/* Categories Slider */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesSlider}
        >
          <CategoryCard
            category={allCategory}
            isSelected={selectedCategoryId === null}
            onPress={() => handleCategoryPress(null)}
          />
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              isSelected={selectedCategoryId === cat.id}
              onPress={() => handleCategoryPress(cat.id)}
            />
          ))}
        </ScrollView>

        {/* Dynamic products views */}
        {loading ? (
          <Loader type="skeleton" count={4} height={180} />
        ) : products.length === 0 ? (
          <EmptyState
            title="No Products Found"
            description="We couldn't find any products fitting your request. Please try search or other category filters."
            icon="search-outline"
            actionTitle="Reset Catalog"
            onActionPress={handleRefresh}
          />
        ) : (
          <View style={styles.catalogContainer}>
            {/* Featured Section */}
            {!selectedCategoryId && searchQuery === '' && featuredProducts.length > 0 && (
              <React.Fragment>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Featured Items</Text>
                </View>
                <FlatList
                  data={featuredProducts}
                  renderItem={renderFeaturedItem}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.featuredSlider}
                />
              </React.Fragment>
            )}

            {/* Catalog Grid */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {selectedCategoryId ? 'Selected Items' : searchQuery !== '' ? 'Search Results' : 'New Arrivals'}
              </Text>
            </View>

            <View style={styles.grid}>
              {products.map((item) => (
                <React.Fragment key={item.id}>
                  {renderProductItem({ item })}
                </React.Fragment>
              ))}
            </View>
          </View>
        )}
        <View style={styles.spacingBottom} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.light,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  brandText: {
    ...TYPOGRAPHY.h2,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1.5,
  },
  cartButton: {
    padding: SPACING.xs,
  },
  searchBar: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
  },
  heroBanner: {
    height: 180,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  heroImage: {
    borderRadius: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: SPACING.xs,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.card,
    letterSpacing: 1,
  },
  bannerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.card,
    fontWeight: '900',
  },
  bannerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.border,
    marginTop: 2,
    marginBottom: SPACING.md,
    maxWidth: 240,
  },
  bannerBtn: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  bannerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sectionHeader: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    fontWeight: '800',
    color: COLORS.primary,
  },
  categoriesSlider: {
    paddingLeft: SPACING.lg,
    paddingRight: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  catalogContainer: {
    width: '100%',
  },
  featuredSlider: {
    paddingLeft: SPACING.lg,
    paddingRight: SPACING.md,
    gap: SPACING.md,
  },
  featuredCard: {
    width: 200,
    marginBottom: SPACING.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
  },
  spacingBottom: {
    height: 80,
  },
});
