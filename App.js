import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { CartProvider } from "./context/CartContext";
import HomeScreen from "./screens/HomeScreen";
// Importe les autres écrans qui seront créés plus tard (Menu, Cart, etc.)
import CategoryProductsScreen from "./screens/CategoryProductsScreen";
import ProductCustomizationScreen from "./screens/ProductCustomizationScreen";
import OrderSummaryScreen from "./screens/OrderSummaryScreen";
import OrderTrackingScreen from "./screens/OrderTrackingScreen";
import OrderConfirmationScreen from "./screens/OrderConfirmationScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            {/* Ajouter les autres écrans ici plus tard */}
            <Stack.Screen
              name="CategoryProducts"
              component={CategoryProductsScreen}
            />
            <Stack.Screen
              name="ProductCustomization"
              component={ProductCustomizationScreen}
            />
            <Stack.Screen name="OrderSummary" component={OrderSummaryScreen} />
            <Stack.Screen
              name="OrderTracking"
              component={OrderTrackingScreen}
            />
            <Stack.Screen
              name="OrderConfirmation"
              component={OrderConfirmationScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </SafeAreaProvider>
  );
}
