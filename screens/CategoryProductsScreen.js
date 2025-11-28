// screens/CategoryProductsScreen.js
import { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { productService } from "../services/productService";
import { categoryService } from "../services/categoryService";
import { useCart } from "../context/CartContext"; // Importez le hook

export default function CategoryProductsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { categoryId, categoryName } = route.params || {};

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryId);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { itemCount } = useCart(); // Récupérez le nombre d'articles

  // Couleurs selon le thème
  const colors = {
    primary: "#f27f0d",
    background: isDark ? "#221910" : "#f8f7f5",
    text: isDark ? "#ffffff" : "#000000",
    textSecondary: isDark ? "#9ca3af" : "#6b7280",
    card: isDark ? "rgba(31, 41, 55, 0.5)" : "#ffffff",
    chipSelected: isDark ? "#f27f0d" : "#f27f0d",
    chipUnselected: isDark
      ? "rgba(242, 127, 13, 0.2)"
      : "rgba(242, 127, 13, 0.2)",
  };

  // Charger les catégories et les produits
  const loadData = async () => {
    try {
      setLoading(true);

      // Charger toutes les catégories
      const categoriesData = await categoryService.getAllCategories();
      setCategories(categoriesData);

      // Charger les produits de la catégorie sélectionnée
      if (selectedCategory) {
        const productsData = await productService.getProductsByCategory(
          selectedCategory
        );
        setProducts(productsData);
      } else if (categoriesData.length > 0) {
        // Si aucune catégorie n'est sélectionnée, prendre la première
        const firstCategory = categoriesData[0];
        setSelectedCategory(firstCategory.id);
        const productsData = await productService.getProductsByCategory(
          firstCategory.id
        );
        setProducts(productsData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Erreur", "Impossible de charger les données");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Changer de catégorie
  const handleCategoryChange = async (categoryId) => {
    try {
      setSelectedCategory(categoryId);
      setLoading(true);

      const productsData = await productService.getProductsByCategory(
        categoryId
      );
      setProducts(productsData);
    } catch (error) {
      console.error("Error changing category:", error);
      Alert.alert("Erreur", "Impossible de charger les produits");
    } finally {
      setLoading(false);
    }
  };

  // Rafraîchir les données
  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Ajouter au panier
  const handleAddToCart = (product) => {
    // Si le produit a des options de personnalisation, aller à l'écran de personnalisation
    if (
      product.options_config &&
      product.options_config !== "[]" &&
      product.options_config !== "{}"
    ) {
      navigation.navigate("ProductCustomization", { product });
    } else {
      // Sinon, ajouter directement au panier
      const simpleProduct = {
        product_id: product.id,
        product_name: product.name,
        base_price: parseFloat(product.price),
        final_price: parseFloat(product.price),
        customization: {},
        image_url: product.image_url,
      };

      addToCart(simpleProduct);
      Alert.alert("Ajouté au panier", `${product.name} a été ajouté au panier`);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Rendu d'un produit
  const renderProductItem = ({ item }) => (
    <View style={[styles.productCard, { backgroundColor: colors.card }]}>
      <ImageBackground
        source={{
          uri:
            item.image_url ||
            "https://via.placeholder.com/300x200?text=Image+Non+Disponible",
        }}
        style={styles.productImage}
        imageStyle={styles.productImageStyle}
      >
        <View style={styles.productImageOverlay} />
      </ImageBackground>

      <View style={styles.productContent}>
        <Text style={[styles.productName, { color: colors.text }]}>
          {item.name}
        </Text>

        <View style={styles.productDetails}>
          <View style={styles.productInfo}>
            <Text
              style={[
                styles.productDescription,
                { color: colors.textSecondary },
              ]}
            >
              {item.description || "Description non disponible"}
            </Text>
            <Text style={[styles.productPrice, { color: colors.text }]}>
              {item.price
                ? `${parseFloat(item.price).toFixed(2)} €`
                : "Prix non disponible"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddToCart(item)}
          >
            <Text style={styles.addButtonText}>Ajouter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Chargement des produits...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Notre Menu
        </Text>

        <View style={styles.headerRight}>
          <View style={styles.cartContainer}>
            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => navigation.navigate("OrderSummary")}
            >
              <Ionicons name="bag-outline" size={24} color={colors.text} />
            </TouchableOpacity>
            {itemCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {itemCount > 99 ? "99+" : itemCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Categories Filter */}
      <View
        style={[
          styles.categoriesContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                {
                  backgroundColor:
                    selectedCategory === category.id
                      ? colors.chipSelected
                      : colors.chipUnselected,
                },
              ]}
              onPress={() => handleCategoryChange(category.id)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  {
                    color:
                      selectedCategory === category.id
                        ? "#ffffff"
                        : colors.text,
                  },
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products List */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProductItem}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="fast-food-outline"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Aucun produit disponible dans cette catégorie
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="cart" size={28} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 8,
  },
  headerLeft: {
    width: 48,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  headerRight: {
    width: 48,
    alignItems: "flex-end",
  },
  cartContainer: {
    position: "relative",
  },
  cartButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#f27f0d",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoriesScrollContent: {
    gap: 12,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  productsList: {
    padding: 16,
    gap: 16,
    paddingBottom: 100,
  },
  productCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  productImage: {
    width: "100%",
    height: 200,
  },
  productImageStyle: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  productImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  productContent: {
    padding: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  productDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#f27f0d",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 84,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f27f0d",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
