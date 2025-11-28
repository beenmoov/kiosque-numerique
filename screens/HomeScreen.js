import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
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
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { categoryService } from "../services/categoryService";
import { useCart } from "../context/CartContext"; // Importez le hook

import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

export default function HomeScreen({ navigation }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [categories, setCategories] = useState([]);
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
    input: isDark ? "rgba(31, 41, 55, 0.5)" : "rgba(243, 244, 246, 0.5)",
  };

  // Charger les catégories
  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await categoryService.getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading categories:", error);
      Alert.alert("Erreur", "Impossible de charger les catégories");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Rafraîchir les données
  const handleRefresh = () => {
    setRefreshing(true);
    loadCategories();
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Données des promotions (statiques pour l'exemple)
  const promotions = [
    {
      id: 1,
      title: "Menu du Midi",
      description: "Une offre spéciale pour un déjeuner parfait.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC6lHOjZwlBmIPN4f2josIH4hbFu3ywJwwAb1AaOhU8bkHILblr8GMzcNwUl0x2F6Drr2xeEfdkkIUfrrmuM2PLP3lsfJRyxIJbZfCw3TWlBwWH2Ln305FPM6wSVAbujgeAs9vow14_uawUKu-ZSaquwlzsNVPYnakZx8Zn3HCqYrlZvV-t8ClSX9EJ-xBKrUVqxnzeIYjrPs6QkD2FToSoREFmPQYzaw8UH4KfM1c84YT9WSbhtSXvNrfTQ0HkbwIwCuBzoTE15OQv",
    },
    {
      id: 2,
      title: "Happy Hour",
      description: "Nos cocktails signatures à prix réduit.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA6RnKQj5QZuCqckPsHRL6kLk5_tjEg8YYncjHZ9jufTBY5YhyMhjpk7LIlr-1WsxWSc1RIbALiIpnc6go-Aw38I4GBCWJQvx0SW9bui6CaE-kGTtIHrPq-G_dIS6tslgEYBAab5RIKrgpktGmdvEut0Cq8ZVvsBBogDtRyfRACU5ghDRLLNoa9F-kR8ZoY_USVKyVnsfLyX0RrcZjhWmuBTzsOIYiT-V3PTcOfuKEMU-H7YF_N3wttWFpkbU6qDMxwhfcLCsVMo0El",
    },
  ];

  // Afficher un indicateur de chargement
  if (loading && !refreshing) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Chargement des catégories...
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
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="restaurant-menu" size={28} color={colors.text} />
        </View>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Le Gourmet
        </Text>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="heart-outline" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.cartContainer}>
            <TouchableOpacity
              style={styles.iconButton}
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

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Welcome Message */}
            <View style={styles.welcomeSection}>
              <Text style={[styles.welcomeTitle, { color: colors.text }]}>
                Bonjour!
              </Text>
              <Text
                style={[
                  styles.welcomeSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Qu'est-ce qui vous ferait plaisir aujourd'hui ?
              </Text>
            </View>

            {/* Promotions Carousel */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.promotionsContainer}
              contentContainerStyle={styles.promotionsContent}
            >
              {promotions.map((promo) => (
                <View
                  key={promo.id}
                  style={[
                    styles.promotionCard,
                    { backgroundColor: colors.card },
                  ]}
                >
                  <ImageBackground
                    source={{ uri: promo.image }}
                    style={styles.promotionImage}
                    imageStyle={styles.promotionImageStyle}
                  >
                    <View style={styles.promotionOverlay} />
                  </ImageBackground>
                  <View style={styles.promotionContent}>
                    <View>
                      <Text
                        style={[styles.promotionTitle, { color: colors.text }]}
                      >
                        {promo.title}
                      </Text>
                      <Text
                        style={[
                          styles.promotionDescription,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {promo.description}
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.discoverButton}>
                      <Text style={styles.discoverButtonText}>Découvrir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View
                style={[styles.searchInput, { backgroundColor: colors.input }]}
              >
                <Ionicons
                  name="search"
                  size={20}
                  color={colors.textSecondary}
                />
                <TextInput
                  style={[styles.searchField, { color: colors.text }]}
                  placeholder="Trouver un plat spécifique"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            {/* Categories Section */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Catégories du Menu
            </Text>
          </>
        }
        renderItem={({ item: category }) => (
          <TouchableOpacity
            style={styles.categoryCard}
            onPress={() =>
              navigation.navigate("CategoryProducts", {
                categoryId: category.id,
                categoryName: category.name,
              })
            }
          >
            <ImageBackground
              source={{
                uri:
                  category.image_url ||
                  "https://via.placeholder.com/300x300?text=Image+Non+Disponible",
              }}
              style={styles.categoryImage}
              imageStyle={styles.categoryImageStyle}
            >
              <View style={styles.categoryOverlay} />
              <Text style={styles.categoryTitle}>{category.name}</Text>
            </ImageBackground>
          </TouchableOpacity>
        )}
        numColumns={2}
        columnWrapperStyle={styles.categoriesGrid}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Aucune catégorie disponible
            </Text>
          </View>
        }
        ListFooterComponent={<View style={styles.spacer} />}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={28}
          color="#ffffff"
        />
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
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    width: 48,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: 96,
    justifyContent: "flex-end",
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  cartContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
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
  welcomeSection: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
  },
  promotionsContainer: {
    marginVertical: 8,
  },
  promotionsContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  promotionCard: {
    width: 280,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  promotionImage: {
    width: "100%",
    height: 160,
  },
  promotionImageStyle: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  promotionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  promotionContent: {
    padding: 16,
    gap: 16,
  },
  promotionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  promotionDescription: {
    fontSize: 14,
  },
  discoverButton: {
    backgroundColor: "#f27f0d",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    minWidth: 84,
  },
  discoverButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },
  searchField: {
    flex: 1,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 20,
  },
  categoriesGrid: {
    paddingHorizontal: 16,
    gap: 16,
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "47%",
    aspectRatio: 1,
    marginBottom: 16,
  },
  categoryImage: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "flex-end",
    padding: 16,
  },
  categoryImageStyle: {
    borderRadius: 16,
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  categoryTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    zIndex: 1,
  },
  spacer: {
    height: 96,
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
