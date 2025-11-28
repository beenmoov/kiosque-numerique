import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  useColorScheme,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { orderService } from "../services/orderService";

export default function OrderConfirmationScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = route.params;

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Couleurs selon le thème
  const colors = {
    primary: "#f27f0d",
    background: isDark ? "#221910" : "#f8f7f5",
    text: isDark ? "#e8e3dd" : "#1c140d",
    textSecondary: isDark ? "#a69584" : "#9c7349",
    subtle: isDark ? "#3a2d20" : "#f4ede7",
    border: isDark ? "#4a3c2d" : "#e0d9d1",
    card: isDark ? "rgba(58, 45, 32, 0.5)" : "rgba(244, 237, 231, 0.5)",
    success: isDark ? "#10b981" : "#059669",
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const orderData = await orderService.getOrderWithItems(orderId);
      setOrder(orderData);
    } catch (error) {
      console.error("Error loading order:", error);
      Alert.alert("Erreur", "Impossible de charger les détails de la commande");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2) + " €";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return colors.success;
      case "preparing":
        return colors.primary;
      case "ready":
        return "#3b82f6";
      case "completed":
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "paid":
        return "Confirmée";
      case "preparing":
        return "En préparation";
      case "ready":
        return "Prête";
      case "completed":
        return "Terminée";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Chargement de votre commande...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={colors.textSecondary}
          />
          <Text style={[styles.errorText, { color: colors.text }]}>
            Commande non trouvée
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.buttonText}>Retour à l'accueil</Text>
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

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header de confirmation */}
        <View style={styles.header}>
          <View
            style={[styles.successIcon, { backgroundColor: colors.success }]}
          >
            <Ionicons name="checkmark" size={32} color="#ffffff" />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>
            Commande Confirmée !
          </Text>
          <Text
            style={[styles.successSubtitle, { color: colors.textSecondary }]}
          >
            Votre commande a été enregistrée avec succès
          </Text>
        </View>

        {/* Numéro de ticket */}
        <View style={[styles.ticketSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.ticketLabel, { color: colors.textSecondary }]}>
            Numéro de ticket
          </Text>
          <Text style={[styles.ticketNumber, { color: colors.text }]}>
            #{order.ticket_number}
          </Text>
        </View>

        {/* Statut de la commande */}
        <View style={[styles.statusSection, { backgroundColor: colors.card }]}>
          <View style={styles.statusHeader}>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
              Statut
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(order.status) },
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {getStatusText(order.status)}
              </Text>
            </View>
          </View>
          <Text style={[styles.statusMessage, { color: colors.text }]}>
            {order.status === "paid" &&
              "Votre commande est en attente de préparation."}
            {order.status === "preparing" &&
              "Votre commande est en cours de préparation."}
            {order.status === "ready" &&
              "Votre commande est prête à être récupérée."}
            {order.status === "completed" && "Votre commande a été complétée."}
          </Text>
        </View>

        {/* Informations de la commande */}
        <View style={styles.detailsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Détails de la commande
          </Text>

          {/* Informations client */}
          <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
            <View style={styles.infoRow}>
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Client:
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {order.guest_name || "Invité"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons
                name="call-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Téléphone:
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {order.guest_phone || "Non renseigné"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons
                name="time-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Date:
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {formatDate(order.created_at)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons
                name="card-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Paiement:
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {order.payment_method === "credit_card"
                  ? "Carte de crédit"
                  : order.payment_method === "mobile"
                  ? "Paiement mobile"
                  : order.payment_method || "Non spécifié"}
              </Text>
            </View>
          </View>

          {/* Articles de la commande */}
          <Text style={[styles.subsectionTitle, { color: colors.text }]}>
            Articles commandés
          </Text>

          <View style={styles.itemsList}>
            {order.order_items &&
              order.order_items.map((item, index) => (
                <View
                  key={item.id}
                  style={[styles.itemCard, { backgroundColor: colors.card }]}
                >
                  <View style={styles.itemHeader}>
                    <Text style={[styles.itemName, { color: colors.text }]}>
                      {item.products?.name || item.product_name}
                    </Text>
                    <Text
                      style={[
                        styles.itemQuantity,
                        { color: colors.textSecondary },
                      ]}
                    >
                      x{item.quantity}
                    </Text>
                  </View>

                  <View style={styles.itemDetails}>
                    <Text style={[styles.itemPrice, { color: colors.text }]}>
                      {formatPrice(item.unit_price)}
                    </Text>
                    <Text style={[styles.itemTotal, { color: colors.text }]}>
                      {formatPrice(item.unit_price * item.quantity)}
                    </Text>
                  </View>

                  {/* Personnalisations */}
                  {item.selected_options &&
                    Object.keys(item.selected_options).length > 0 && (
                      <View style={styles.customizations}>
                        {Object.entries(item.selected_options).map(
                          ([key, value]) => (
                            <Text
                              key={key}
                              style={[
                                styles.customizationText,
                                { color: colors.textSecondary },
                              ]}
                            >
                              • {key}:{" "}
                              {Array.isArray(value) ? value.join(", ") : value}
                            </Text>
                          )
                        )}
                      </View>
                    )}
                </View>
              ))}
          </View>

          {/* Résumé financier */}
          <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <View style={[styles.summaryRow, { borderColor: colors.border }]}>
              <Text
                style={[styles.summaryLabel, { color: colors.textSecondary }]}
              >
                Sous-total
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formatPrice(order.total_price / 1.2)}
              </Text>
            </View>

            <View style={[styles.summaryRow, { borderColor: colors.border }]}>
              <Text
                style={[styles.summaryLabel, { color: colors.textSecondary }]}
              >
                TVA (20%)
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formatPrice(order.total_price * 0.2)}
              </Text>
            </View>

            <View style={[styles.totalRow, { borderColor: colors.primary }]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>
                Total
              </Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>
                {formatPrice(order.total_price)}
              </Text>
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View
          style={[styles.instructionsCard, { backgroundColor: colors.card }]}
        >
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={colors.primary}
          />
          <View style={styles.instructionsText}>
            <Text style={[styles.instructionsTitle, { color: colors.text }]}>
              Prochaines étapes
            </Text>
            <Text
              style={[styles.instructionsBody, { color: colors.textSecondary }]}
            >
              Présentez votre numéro de ticket au comptoir pour récupérer votre
              commande. Vous recevrez une notification lorsque votre commande
              sera prête.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Actions */}
      <View
        style={[
          styles.actions,
          { backgroundColor: colors.background, borderColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={() =>
            navigation.navigate("OrderTracking", { orderId: order.id })
          }
        >
          <Ionicons name="time-outline" size={20} color="#ffffff" />
          <Text style={styles.primaryButtonText}>Suivre ma commande</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: colors.primary }]}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
            Nouvelle commande
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  ticketSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  ticketLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  ticketNumber: {
    fontSize: 32,
    fontWeight: "bold",
  },
  statusSection: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 20,
    borderRadius: 12,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  statusMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  detailsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 12,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  itemsList: {
    gap: 12,
    marginBottom: 16,
  },
  itemCard: {
    padding: 16,
    borderRadius: 12,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: "500",
  },
  itemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemPrice: {
    fontSize: 14,
    color: "#666",
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "600",
  },
  customizations: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  customizationText: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 2,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderStyle: "dashed",
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 2,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  instructionsCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  instructionsText: {
    flex: 1,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  instructionsBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 100,
  },
  actions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    padding: 16,
    flexDirection: "row",
    gap: 12,
  },
  primaryButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 2,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
