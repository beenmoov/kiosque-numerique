import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  StyleSheet,
  useColorScheme,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCart } from "../context/CartContext"; // Importez le hook useCart

export default function ProductCustomizationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { product } = route.params;
  const { addToCart } = useCart(); // Utilisez le hook useCart

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [selectedOptions, setSelectedOptions] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [basePrice, setBasePrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Couleurs selon le thème
  const colors = {
    primary: "#f27f0d",
    background: isDark ? "#221910" : "#f8f7f5",
    text: isDark ? "#ffffff" : "#1c140d",
    textSecondary: isDark ? "#9ca3af" : "#6b7280",
    card: isDark ? "rgba(31, 41, 55, 0.5)" : "#ffffff",
    border: isDark ? "#374151" : "#e8dbce",
  };

  // Parse les options de configuration depuis la chaîne JSON
  const parseOptionsConfig = () => {
    if (!product.options_config) return [];

    try {
      // Si c'est déjà un objet, on le retourne directement
      if (typeof product.options_config === "object") {
        return product.options_config;
      }

      // Sinon on parse la chaîne JSON
      return JSON.parse(product.options_config);
    } catch (error) {
      console.error("Error parsing options_config:", error);
      return [];
    }
  };

  const optionsConfig = parseOptionsConfig();

  // Initialiser les sélections par défaut
  useEffect(() => {
    if (product.price) {
      const price = parseFloat(product.price);
      setBasePrice(price);
      setTotalPrice(price);
    }

    // Initialiser les sections étendues
    const initialExpanded = {};
    optionsConfig.forEach((option, index) => {
      initialExpanded[option.title || `option_${index}`] = true;
    });
    setExpandedSections(initialExpanded);

    // Initialiser les sélections par défaut
    const initialSelections = {};
    optionsConfig.forEach((option) => {
      if (
        option.type === "radio" &&
        option.values &&
        option.values.length > 0
      ) {
        // Pour les radios, sélectionner la première valeur par défaut
        initialSelections[option.title] = option.values[0].label;
      } else if (option.type === "checkbox") {
        // Pour les checkboxes, commencer avec un tableau vide
        initialSelections[option.title] = [];
      }
    });
    setSelectedOptions(initialSelections);
  }, [product]);

  // Calculer le prix total
  useEffect(() => {
    let additionalPrice = 0;

    optionsConfig.forEach((option) => {
      if (option.type === "radio") {
        const selectedValue = option.values.find(
          (v) => v.label === selectedOptions[option.title]
        );
        if (selectedValue && selectedValue.price_extra) {
          additionalPrice += selectedValue.price_extra;
        }
      } else if (option.type === "checkbox") {
        const selectedValues = selectedOptions[option.title] || [];
        selectedValues.forEach((selectedLabel) => {
          const selectedValue = option.values.find(
            (v) => v.label === selectedLabel
          );
          if (selectedValue && selectedValue.price_extra) {
            additionalPrice += selectedValue.price_extra;
          }
        });
      }
    });

    setTotalPrice(basePrice + additionalPrice);
  }, [selectedOptions, basePrice, optionsConfig]);

  // Gérer la sélection radio
  const handleRadioSelect = (optionTitle, valueLabel) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionTitle]: valueLabel,
    }));
  };

  // Gérer la sélection checkbox
  const handleCheckboxToggle = (optionTitle, valueLabel) => {
    setSelectedOptions((prev) => {
      const currentSelection = prev[optionTitle] || [];
      const newSelection = currentSelection.includes(valueLabel)
        ? currentSelection.filter((item) => item !== valueLabel)
        : [...currentSelection, valueLabel];

      return {
        ...prev,
        [optionTitle]: newSelection,
      };
    });
  };

  // Basculer l'expansion des sections
  const toggleSection = (sectionTitle) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle],
    }));
  };

  // Ajouter au panier
  const handleAddToCart = () => {
    const customizedProduct = {
      product_id: product.id,
      product_name: product.name,
      base_price: basePrice,
      final_price: totalPrice,
      customization: selectedOptions,
      image_url: product.image_url,
      options_config: optionsConfig,
    };

    addToCart(customizedProduct);

    Alert.alert(
      "Ajouté au panier  🛒",
      `${product.name} personnalisé a été ajouté au panier`,
      [
        {
          text: "Continuer mes achats",
          onPress: () => navigation.goBack(),
        },
        {
          text: "Voir le panier",
          onPress: () => navigation.navigate("OrderSummary"),
        },
      ]
    );
  };

  // Rendu d'une option radio
  const renderRadioOption = (option, value) => (
    <TouchableOpacity
      key={value.label}
      style={[
        styles.optionItem,
        {
          backgroundColor: colors.card,
          borderColor:
            selectedOptions[option.title] === value.label
              ? colors.primary
              : colors.border,
        },
      ]}
      onPress={() => handleRadioSelect(option.title, value.label)}
    >
      <View style={styles.optionContent}>
        <Text style={[styles.optionName, { color: colors.text }]}>
          {value.label}
        </Text>
        {value.price_extra > 0 && (
          <Text style={[styles.optionPrice, { color: colors.textSecondary }]}>
            +{value.price_extra.toFixed(2)}€
          </Text>
        )}
      </View>
      <View
        style={[
          styles.radioOuter,
          {
            borderColor:
              selectedOptions[option.title] === value.label
                ? colors.primary
                : colors.border,
          },
        ]}
      >
        {selectedOptions[option.title] === value.label && (
          <View
            style={[styles.radioInner, { backgroundColor: colors.primary }]}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  // Rendu d'une option checkbox
  const renderCheckboxOption = (option, value) => (
    <TouchableOpacity
      key={value.label}
      style={[
        styles.optionItem,
        {
          backgroundColor: colors.card,
          borderColor: (selectedOptions[option.title] || []).includes(
            value.label
          )
            ? colors.primary
            : colors.border,
        },
      ]}
      onPress={() => handleCheckboxToggle(option.title, value.label)}
    >
      <View style={styles.optionContent}>
        <Text style={[styles.optionName, { color: colors.text }]}>
          {value.label}
        </Text>
        {value.price_extra > 0 && (
          <Text style={[styles.optionPrice, { color: colors.textSecondary }]}>
            +{value.price_extra.toFixed(2)}€
          </Text>
        )}
      </View>
      <View
        style={[
          styles.checkboxOuter,
          {
            borderColor: (selectedOptions[option.title] || []).includes(
              value.label
            )
              ? colors.primary
              : colors.border,
          },
        ]}
      >
        {(selectedOptions[option.title] || []).includes(value.label) && (
          <View
            style={[styles.checkboxInner, { backgroundColor: colors.primary }]}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  // Rendu d'une section d'options
  const renderOptionSection = (option, index) => {
    const sectionTitle = option.title || `Option ${index + 1}`;
    const isExpanded = expandedSections[sectionTitle];

    return (
      <View key={sectionTitle} style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection(sectionTitle)}
        >
          <View style={styles.sectionTitleContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {sectionTitle}
            </Text>
            {option.required && (
              <Text style={[styles.requiredBadge, { color: colors.primary }]}>
                Obligatoire
              </Text>
            )}
          </View>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.text}
          />
        </TouchableOpacity>

        {isExpanded && option.values && (
          <View style={styles.optionsList}>
            {option.type === "radio" &&
              option.values.map((value) => renderRadioOption(option, value))}
            {option.type === "checkbox" &&
              option.values.map((value) => renderCheckboxOption(option, value))}
          </View>
        )}
      </View>
    );
  };

  // Si pas d'options de configuration, on affiche un écran simplifié
  if (!optionsConfig || optionsConfig.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {product.name}
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Product Image */}
          <View style={styles.imageContainer}>
            <ImageBackground
              source={{
                uri:
                  product.image_url ||
                  "https://via.placeholder.com/300x200?text=Image+Non+Disponible",
              }}
              style={styles.productImage}
              imageStyle={styles.productImageStyle}
            >
              <View style={styles.imageOverlay} />
            </ImageBackground>
          </View>

          {/* Product Description */}
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {product.description || "Description non disponible"}
          </Text>

          {/* No customization message */}
          <View style={styles.noOptionsContainer}>
            <Ionicons
              name="restaurant-outline"
              size={48}
              color={colors.textSecondary}
            />
            <Text
              style={[styles.noOptionsText, { color: colors.textSecondary }]}
            >
              Aucune personnalisation disponible pour ce produit
            </Text>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Sticky Footer */}
        <View
          style={[
            styles.footer,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
        >
          <View style={styles.footerContent}>
            <View style={styles.priceContainer}>
              <Text
                style={[styles.totalLabel, { color: colors.textSecondary }]}
              >
                Total
              </Text>
              <Text style={[styles.totalPrice, { color: colors.text }]}>
                {basePrice.toFixed(2)}€
              </Text>
            </View>

            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={handleAddToCart}
            >
              <Text style={styles.addToCartText}>Ajouter au panier</Text>
            </TouchableOpacity>
          </View>
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {product.name}
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <ImageBackground
            source={{
              uri:
                product.image_url ||
                "https://via.placeholder.com/300x200?text=Image+Non+Disponible",
            }}
            style={styles.productImage}
            imageStyle={styles.productImageStyle}
          >
            <View style={styles.imageOverlay} />
          </ImageBackground>
        </View>

        {/* Product Description */}
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {product.description || "Description non disponible"}
        </Text>

        {/* Customization Sections */}
        <View style={styles.sectionsContainer}>
          {optionsConfig.map(renderOptionSection)}
        </View>

        {/* Spacer for footer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Sticky Footer */}
      <View
        style={[
          styles.footer,
          { backgroundColor: colors.background, borderColor: colors.border },
        ]}
      >
        <View style={styles.footerContent}>
          <View style={styles.priceContainer}>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
              Total
            </Text>
            <Text style={[styles.totalPrice, { color: colors.text }]}>
              {totalPrice.toFixed(2)}€
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <Text style={styles.addToCartText}>Ajouter au panier</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    paddingHorizontal: 16,
  },
  productImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
  },
  productImageStyle: {
    borderRadius: 16,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionsContainer: {
    paddingHorizontal: 16,
  },
  section: {
    borderTopWidth: 1,
    paddingVertical: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  sectionTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  requiredBadge: {
    fontSize: 12,
    fontWeight: "600",
  },
  optionsList: {
    gap: 12,
    paddingTop: 8,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionContent: {
    flex: 1,
  },
  optionName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  optionPrice: {
    fontSize: 14,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  checkboxOuter: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  noOptionsContainer: {
    alignItems: "center",
    padding: 32,
    gap: 16,
  },
  noOptionsText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  bottomSpacer: {
    height: 100,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    padding: 16,
  },
  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  priceContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: "bold",
  },
  addToCartButton: {
    flex: 2,
    backgroundColor: "#f27f0d",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  addToCartText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
