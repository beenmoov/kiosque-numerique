import React, { createContext, useContext, useReducer, useState } from "react";

const CartContext = createContext();

// Générer un ID unique pour chaque article du panier
const generateCartItemId = () => {
  return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_ITEM":
      const newItem = {
        ...action.payload,
        id: generateCartItemId(), // Ajouter un ID unique
        quantity: 1,
      };
      return {
        ...state,
        items: [...state.items, newItem],
        itemCount: state.itemCount + 1,
      };

    case "REMOVE_ITEM":
      const itemToRemove = state.items.find(
        (item) => item.id === action.payload
      );
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
        itemCount: Math.max(0, state.itemCount - (itemToRemove?.quantity || 1)),
      };

    case "UPDATE_QUANTITY":
      const updatedItems = state.items.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(1, action.payload.quantity) }
          : item
      );

      const newItemCount = updatedItems.reduce(
        (total, item) => total + item.quantity,
        0
      );

      return {
        ...state,
        items: updatedItems,
        itemCount: newItemCount,
      };

    case "CLEAR_CART":
      return {
        items: [],
        itemCount: 0,
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    itemCount: 0,
  });

  const addToCart = (product) => {
    dispatch({ type: "ADD_ITEM", payload: product });
  };

  const removeFromCart = (itemId) => {
    dispatch({ type: "REMOVE_ITEM", payload: itemId });
  };

  const updateQuantity = (itemId, quantity) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id: itemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => {
      return (
        total +
        parseFloat(item.final_price || item.product_price) * item.quantity
      );
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems: state.items,
        itemCount: state.itemCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
