import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  useColorScheme,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { orderService } from "../services/orderService";

export default function OrderTrackingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params;

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Couleurs selon le thème
  const colors = {
    primary: "#f27f0d",
    background: isDark ? "#221910" : "#f8f7f5",
    text: isDark ? "#f8f7f5" : "#1c140d",
    textSecondary: isDark ? "#a1998f" : "#9c7349",
    subtle: isDark ? "#3c2e1f" : "#e8dbce",
    card: isDark ? "rgba(60, 46, 31, 0.4)" : "#ffffff",
    muted: isDark ? "rgba(60, 46, 31, 0.6)" : "rgba(232, 219, 206, 0.6)",
  };

  // États de progression
  const orderSteps = [
    { key: "paid", label: "Confirmée", icon: "receipt-outline" },
    { key: "preparing", label: "En cuisine", icon: "restaurant-outline" },
    { key: "ready", label: "Prête", icon: "bag-check-outline" },
    { key: "completed", label: "Récupérée", icon: "checkmark-done-outline" },
  ];

  useEffect(() => {
    loadOrder();
    // Polling pour les mises à jour en temps réel
    const interval = setInterval(loadOrder, 10000); // Toutes les 10 secondes
    return () => clearInterval(interval);
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const orderData = await orderService.getOrderWithItems(orderId);
      setOrder(orderData);
    } catch (error) {
      console.error("Error loading order:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculer la progression
  const getCurrentStepIndex = () => {
    if (!order) return 0;
    return orderSteps.findIndex((step) => step.key === order.status);
  };

  // Calculer le pourcentage de progression
  const getProgressPercentage = () => {
    const currentIndex = getCurrentStepIndex();
    return (currentIndex / (orderSteps.length - 1)) * 100;
  };

  // Obtenir le texte de statut
  const getStatusText = () => {
    if (!order) return "";

    switch (order.status) {
      case "paid":
        return "Votre commande est confirmée.";
      case "preparing":
        return "Votre commande est en cours de préparation.";
      case "ready":
        return "Votre commande est prête à être récupérée.";
      case "completed":
        return "Votre commande a été récupérée.";
      default:
        return "Statut inconnu.";
    }
  };

  // Calculer l'heure estimée
  const getEstimatedTime = () => {
    if (!order) return "--:--";

    const created = new Date(order.created_at);
    let minutesToAdd = 0;

    switch (order.status) {
      case "paid":
        minutesToAdd = 25; // Temps estimé total
        break;
      case "preparing":
        minutesToAdd = 15; // Temps restant
        break;
      case "ready":
        return "MAINTENANT";
      default:
        return "--:--";
    }

    const estimated = new Date(created.getTime() + minutesToAdd * 60000);
    return estimated.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const handleContactSupport = () => {
    Alert.alert("Support Client", "Un problème avec votre commande ?", [
      {
        text: "Appeler le restaurant",
        onPress: () => {
          // Ici vous pourriez lancer un appel téléphonique
          Alert.alert("Appel", "Fonctionnalité d'appel à implémenter");
        },
      },
      {
        text: "Envoyer un message",
        onPress: () => {
          // Ici vous pourriez ouvrir un chat
          Alert.alert("Message", "Fonctionnalité de messagerie à implémenter");
        },
      },
      {
        text: "Annuler",
        style: "cancel",
      },
    ]);
  };

  const handleToggleNotifications = (value) => {
    setNotificationsEnabled(value);
    if (value) {
      Alert.alert(
        "Notifications activées",
        "Vous serez averti lorsque votre commande sera prête."
      );
    } else {
      Alert.alert(
        "Notifications désactivées",
        "Vous ne recevrez plus de mises à jour pour cette commande."
      );
    }
  };

  if (loading && !order) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <View style={styles.loadingContainer}>
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

  const currentStepIndex = getCurrentStepIndex();
  const progressPercentage = getProgressPercentage();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          État de votre commande
        </Text>

        <TouchableOpacity
          style={styles.supportButton}
          onPress={handleContactSupport}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Carte de commande */}
        <View style={[styles.orderCard, { backgroundColor: colors.card }]}>
          {/* Numéro de commande */}
          <Text
            style={[styles.orderNumberLabel, { color: colors.textSecondary }]}
          >
            COMMANDE N°
          </Text>
          <Text style={styles.orderNumber}>{order.ticket_number}</Text>

          {/* Indicateur de progression visuel */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${progressPercentage}%`,
                  },
                ]}
              />
            </View>

            <View style={styles.progressSteps}>
              {orderSteps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <View key={step.key} style={styles.progressStep}>
                    <View
                      style={[
                        styles.stepIcon,
                        {
                          backgroundColor: isCompleted
                            ? colors.primary
                            : colors.muted,
                        },
                      ]}
                    >
                      <Ionicons
                        name={step.icon}
                        size={16}
                        color={isCompleted ? "#ffffff" : colors.textSecondary}
                      />
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        {
                          color: isCompleted
                            ? colors.text
                            : colors.textSecondary,
                          fontWeight: isCurrent ? "600" : "400",
                        },
                      ]}
                    >
                      {step.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Texte de statut */}
          <Text style={[styles.statusText, { color: colors.text }]}>
            {getStatusText()}
          </Text>

          {/* Temps estimé */}
          <View
            style={[
              styles.estimatedTimeContainer,
              { backgroundColor: colors.background },
            ]}
          >
            <Text
              style={[
                styles.estimatedTimeLabel,
                { color: colors.textSecondary },
              ]}
            >
              PRÊTE À ÊTRE RÉCUPÉRÉE VERS
            </Text>
            <Text style={styles.estimatedTime}>{getEstimatedTime()}</Text>
          </View>
        </View>

        {/* Notifications CTA */}
        <View
          style={[
            styles.notificationsCard,
            { backgroundColor: `${colors.primary}20` },
          ]}
        >
          <View
            style={[
              styles.notificationsIcon,
              { backgroundColor: `${colors.primary}20` },
            ]}
          >
            <Ionicons name="notifications" size={24} color={colors.primary} />
          </View>

          <View style={styles.notificationsContent}>
            <Text style={[styles.notificationsTitle, { color: colors.text }]}>
              Ne manquez rien !
            </Text>
            <Text
              style={[
                styles.notificationsSubtitle,
                { color: colors.textSecondary },
              ]}
            >
              Activez les notifications pour savoir quand votre commande est
              prête.
            </Text>
          </View>

          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: colors.muted, true: colors.primary }}
            thumbColor="#ffffff"
            ios_backgroundColor={colors.muted}
          />
        </View>

        {/* Détails de la commande (optionnel) */}
        <View style={styles.detailsSection}>
          <Text style={[styles.detailsTitle, { color: colors.text }]}>
            Détails de la commande
          </Text>

          {order.order_items &&
            order.order_items.slice(0, 3).map((item, index) => (
              <View key={item.id} style={styles.detailItem}>
                <Text style={[styles.detailItemName, { color: colors.text }]}>
                  {item.products?.name || item.product_name}
                </Text>
                <Text
                  style={[
                    styles.detailItemQuantity,
                    { color: colors.textSecondary },
                  ]}
                >
                  x{item.quantity}
                </Text>
              </View>
            ))}

          {order.order_items && order.order_items.length > 3 && (
            <Text
              style={[styles.moreItemsText, { color: colors.textSecondary }]}
            >
              +{order.order_items.length - 3} autres articles
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Footer Help Link */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleContactSupport}>
          <Text style={[styles.helpLink, { color: colors.textSecondary }]}>
            Un problème avec votre commande ?
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
  supportButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  orderCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  orderNumberLabel: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 1,
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 48,
    fontWeight: "800",
    color: "#f27f0d",
    letterSpacing: -1,
    marginBottom: 32,
  },
  progressContainer: {
    width: "100%",
    marginBottom: 24,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 2,
    marginBottom: 40,
    position: "relative",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 2,
    position: "absolute",
    left: 0,
    top: 0,
  },
  progressSteps: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    top: -18,
    left: 0,
    right: 0,
  },
  progressStep: {
    alignItems: "center",
    minWidth: 70,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  statusText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  estimatedTimeContainer: {
    width: "100%",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  estimatedTimeLabel: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  estimatedTime: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#f27f0d",
    letterSpacing: -0.5,
  },
  notificationsCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 12,
  },
  notificationsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationsContent: {
    flex: 1,
  },
  notificationsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  notificationsSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  detailsSection: {
    marginTop: 24,
    padding: 16,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  detailItemName: {
    fontSize: 14,
    flex: 1,
  },
  detailItemQuantity: {
    fontSize: 14,
    fontWeight: "500",
  },
  moreItemsText: {
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 8,
    textAlign: "center",
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
    alignItems: "center",
  },
  helpLink: {
    fontSize: 14,
    fontWeight: "500",
  },
});
