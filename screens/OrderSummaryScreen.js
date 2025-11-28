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
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { orderService } from "../services/orderService";
import { useCart } from "../context/CartContext";

export default function OrderSummaryScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { cartItems, updateQuantity, removeFromCart, clearCart, itemCount } =
    useCart();

  const [selectedPayment, setSelectedPayment] = useState("credit_card");
  const [loading, setLoading] = useState(false);
  const [guestInfo, setGuestInfo] = useState({
    name: "",
    phone: "",
  });

  // Couleurs selon le thème
  const colors = {
    primary: "#f27f0d",
    background: isDark ? "#221910" : "#f8f7f5",
    text: isDark ? "#e8e3dd" : "#1c140d",
    textSecondary: isDark ? "#a69584" : "#9c7349",
    subtle: isDark ? "#3a2d20" : "#f4ede7",
    border: isDark ? "#4a3c2d" : "#e0d9d1",
    card: isDark ? "rgba(58, 45, 32, 0.5)" : "rgba(244, 237, 231, 0.5)",
    error: "#ef4444",
  };

  // Calcul des totaux
  const subtotal = cartItems.reduce((total, item) => {
    return (
      total + parseFloat(item.final_price || item.product_price) * item.quantity
    );
  }, 0);

  const vat = subtotal * 0.2;
  const total = subtotal + vat;

  // Mettre à jour la quantité
  const handleUpdateQuantity = (itemId, change) => {
    const item = cartItems.find((item) => item.id === itemId);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      updateQuantity(itemId, newQuantity);
    }
  };

  // Supprimer un article
  const handleRemoveItem = (itemId) => {
    Alert.alert(
      "Supprimer l'article",
      "Êtes-vous sûr de vouloir supprimer cet article du panier ?",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => removeFromCart(itemId),
        },
      ]
    );
  };

  // Valider les informations client
  const validateGuestInfo = () => {
    if (!guestInfo.name.trim()) {
      Alert.alert("Information manquante", "Veuillez saisir votre nom");
      return false;
    }
    if (!guestInfo.phone.trim()) {
      Alert.alert(
        "Information manquante",
        "Veuillez saisir votre numéro de téléphone"
      );
      return false;
    }

    // Validation basique du numéro de téléphone
    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (!phoneRegex.test(guestInfo.phone)) {
      Alert.alert(
        "Numéro invalide",
        "Veuillez saisir un numéro de téléphone valide"
      );
      return false;
    }

    return true;
  };

  // Valider le panier
  const validateCart = () => {
    if (cartItems.length === 0) {
      Alert.alert(
        "Panier vide",
        "Votre panier est vide. Ajoutez des articles avant de commander."
      );
      return false;
    }
    return true;
  };

  // Traiter le paiement
  const handlePayment = async () => {
    if (!validateCart() || !validateGuestInfo()) return;

    try {
      setLoading(true);

      // Préparer les données de la commande
      const orderData = {
        guest_name: guestInfo.name.trim(),
        guest_phone: guestInfo.phone.trim(),
        customer_id: null, // Client invité
        status: "paid",
        total_price: total,
        payment_method: selectedPayment,
      };

      // Créer la commande complète
      const order = await orderService.createCompleteOrder(
        orderData,
        cartItems
      );

      // Vider le panier après commande réussie
      clearCart();

      Alert.alert(
        "Commande Confirmée ! 🎉",
        `Votre commande #${
          order.ticket_number
        } a été enregistrée.\n\nTotal: ${total.toFixed(2)} €`,
        [
          {
            text: "Voir le récapitulatif",
            onPress: () => {
              navigation.navigate("OrderConfirmation", { orderId: order.id });
            },
          },
          {
            text: "Nouvelle commande",
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: "Home" }],
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error("Order creation error:", error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de la création de votre commande. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  // Rendu d'un article du panier
  const renderCartItem = (item) => (
    <View
      key={item.id}
      style={[styles.cartItem, { backgroundColor: colors.card }]}
    >
      <ImageBackground
        source={{
          uri:
            item.image_url || "https://via.placeholder.com/100x100?text=Image",
        }}
        style={styles.itemImage}
        imageStyle={styles.itemImageStyle}
      >
        <View style={styles.imageOverlay} />
      </ImageBackground>

      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: colors.text }]}>
          {item.product_name}
        </Text>
        <Text style={[styles.itemPrice, { color: colors.textSecondary }]}>
          {parseFloat(item.final_price || item.product_price).toFixed(2)} €
        </Text>

        {/* Affichage des personnalisations */}
        {item.customization && Object.keys(item.customization).length > 0 && (
          <View style={styles.customizations}>
            {Object.entries(item.customization).map(([key, value]) => (
              <Text
                key={key}
                style={[
                  styles.customizationText,
                  { color: colors.textSecondary },
                ]}
              >
                {key}: {Array.isArray(value) ? value.join(", ") : value}
              </Text>
            ))}
          </View>
        )}
      </View>

      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={[styles.quantityButton, { backgroundColor: colors.subtle }]}
          onPress={() => handleUpdateQuantity(item.id, -1)}
          onLongPress={() => handleRemoveItem(item.id)}
        >
          <Text style={[styles.quantityButtonText, { color: colors.text }]}>
            -
          </Text>
        </TouchableOpacity>

        <Text style={[styles.quantityText, { color: colors.text }]}>
          {item.quantity}
        </Text>

        <TouchableOpacity
          style={[styles.quantityButton, { backgroundColor: colors.primary }]}
          onPress={() => handleUpdateQuantity(item.id, 1)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Si le panier est vide
  if (cartItems.length === 0) {
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
            Votre Panier
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons
            name="cart-outline"
            size={80}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Votre panier est vide
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Ajoutez des délicieux plats pour commencer
          </Text>

          <TouchableOpacity
            style={[
              styles.continueShoppingButton,
              { backgroundColor: colors.primary },
            ]}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.continueShoppingText}>Découvrir le menu</Text>
          </TouchableOpacity>
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
          Votre Commande
        </Text>

        <View style={styles.cartContainer}>
          <TouchableOpacity style={styles.cartButton}>
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

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Informations client */}
        <View style={styles.guestInfoSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Vos informations
          </Text>

          <View style={styles.guestInfoForm}>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Nom complet *
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.card,
                    borderColor: guestInfo.name
                      ? colors.primary
                      : colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="Entrez votre nom"
                placeholderTextColor={colors.textSecondary}
                value={guestInfo.name}
                onChangeText={(text) =>
                  setGuestInfo((prev) => ({ ...prev, name: text }))
                }
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Numéro de téléphone *
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.card,
                    borderColor: guestInfo.phone
                      ? colors.primary
                      : colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="Ex: 06 12 34 56 78"
                placeholderTextColor={colors.textSecondary}
                value={guestInfo.phone}
                onChangeText={(text) =>
                  setGuestInfo((prev) => ({ ...prev, phone: text }))
                }
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {/* Articles de la commande */}
        <View style={styles.itemsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Votre commande ({cartItems.length} article
              {cartItems.length > 1 ? "s" : ""})
            </Text>
            <TouchableOpacity
              style={styles.clearCartButton}
              onPress={() => {
                Alert.alert(
                  "Vider le panier",
                  "Êtes-vous sûr de vouloir vider tout votre panier ?",
                  [
                    { text: "Annuler", style: "cancel" },
                    {
                      text: "Vider",
                      style: "destructive",
                      onPress: clearCart,
                    },
                  ]
                );
              }}
            >
              <Text style={[styles.clearCartText, { color: colors.error }]}>
                Tout supprimer
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cartItemsContainer}>
            {cartItems.map(renderCartItem)}
          </View>
        </View>

        {/* Résumé financier */}
        <View style={[styles.summaryContainer, { borderColor: colors.border }]}>
          <View style={styles.summaryRow}>
            <Text
              style={[styles.summaryLabel, { color: colors.textSecondary }]}
            >
              Sous-total
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {subtotal.toFixed(2)} €
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text
              style={[styles.summaryLabel, { color: colors.textSecondary }]}
            >
              TVA (20%)
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {vat.toFixed(2)} €
            </Text>
          </View>

          <View style={[styles.totalRow, { borderColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              Total à payer
            </Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>
              {total.toFixed(2)} €
            </Text>
          </View>
        </View>

        {/* Options de paiement */}
        <View style={styles.paymentSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Méthode de paiement
          </Text>

          <View style={styles.paymentOptions}>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                {
                  backgroundColor: colors.card,
                  borderColor:
                    selectedPayment === "credit_card"
                      ? colors.primary
                      : colors.border,
                },
              ]}
              onPress={() => setSelectedPayment("credit_card")}
            >
              <View style={styles.paymentOptionLeft}>
                <View
                  style={[
                    styles.paymentRadio,
                    {
                      backgroundColor:
                        selectedPayment === "credit_card"
                          ? colors.primary
                          : "transparent",
                      borderColor:
                        selectedPayment === "credit_card"
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                >
                  {selectedPayment === "credit_card" && (
                    <Ionicons name="checkmark" size={16} color="#ffffff" />
                  )}
                </View>
                <View>
                  <Text
                    style={[styles.paymentOptionText, { color: colors.text }]}
                  >
                    Carte de crédit
                  </Text>
                  <Text
                    style={[
                      styles.paymentOptionSubtext,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Visa, Mastercard, American Express
                  </Text>
                </View>
              </View>
              <Ionicons name="card" size={24} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                {
                  backgroundColor: colors.card,
                  borderColor:
                    selectedPayment === "mobile"
                      ? colors.primary
                      : colors.border,
                },
              ]}
              onPress={() => setSelectedPayment("mobile")}
            >
              <View style={styles.paymentOptionLeft}>
                <View
                  style={[
                    styles.paymentRadio,
                    {
                      backgroundColor:
                        selectedPayment === "mobile"
                          ? colors.primary
                          : "transparent",
                      borderColor:
                        selectedPayment === "mobile"
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                >
                  {selectedPayment === "mobile" && (
                    <Ionicons name="checkmark" size={16} color="#ffffff" />
                  )}
                </View>
                <View>
                  <Text
                    style={[styles.paymentOptionText, { color: colors.text }]}
                  >
                    Paiement Mobile
                  </Text>
                  <Text
                    style={[
                      styles.paymentOptionSubtext,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Apple Pay, Google Pay
                  </Text>
                </View>
              </View>
              <Ionicons name="phone-portrait" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Footer avec bouton de paiement */}
      <View
        style={[
          styles.footer,
          { backgroundColor: colors.background, borderColor: colors.border },
        ]}
      >
        <View style={styles.footerContent}>
          <View style={styles.footerPrice}>
            <Text
              style={[styles.footerTotalLabel, { color: colors.textSecondary }]}
            >
              Total
            </Text>
            <Text style={[styles.footerTotalPrice, { color: colors.text }]}>
              {total.toFixed(2)} €
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.payButton,
              {
                backgroundColor: colors.primary,
                opacity: loading || cartItems.length === 0 ? 0.6 : 1,
              },
            ]}
            onPress={handlePayment}
            disabled={loading || cartItems.length === 0}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.payButtonText}>Payer maintenant</Text>
            )}
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
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  continueShoppingButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    marginTop: 16,
  },
  continueShoppingText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  guestInfoSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  guestInfoForm: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  textInput: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: "500",
  },
  itemsSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  clearCartButton: {
    padding: 8,
  },
  clearCartText: {
    fontSize: 14,
    fontWeight: "600",
  },
  cartItemsContainer: {
    gap: 12,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    overflow: "hidden",
  },
  itemImageStyle: {
    borderRadius: 8,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
  },
  customizations: {
    marginTop: 4,
  },
  customizationText: {
    fontSize: 12,
    fontStyle: "italic",
    lineHeight: 16,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    minWidth: 20,
    textAlign: "center",
  },
  summaryContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingTop: 24,
    borderTopWidth: 1,
    borderStyle: "dashed",
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderStyle: "solid",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  paymentSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  paymentOptions: {
    gap: 12,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  paymentOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  paymentRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentOptionText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  paymentOptionSubtext: {
    fontSize: 12,
  },
  bottomSpacer: {
    height: 120,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    padding: 16,
    paddingBottom: 24,
  },
  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  footerPrice: {
    flex: 1,
  },
  footerTotalLabel: {
    fontSize: 14,
  },
  footerTotalPrice: {
    fontSize: 20,
    fontWeight: "bold",
  },
  payButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#f27f0d",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  payButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
