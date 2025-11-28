import { supabase } from "../utils/supabase";

export const orderService = {
  // Créer une nouvelle commande
  async createOrder(orderData) {
    try {
      // Générer un numéro de ticket unique
      const ticketNumber = await this.generateTicketNumber();

      const orderWithTicket = {
        ...orderData,
        ticket_number: ticketNumber,
      };

      const { data: order, error } = await supabase
        .from("orders")
        .insert([orderWithTicket])
        .select()
        .single();

      if (error) {
        console.error("Error creating order:", error.message);
        throw error;
      }

      return order;
    } catch (error) {
      console.error("Error in createOrder:", error.message);
      throw error;
    }
  },

  // Générer un numéro de ticket unique
  async generateTicketNumber() {
    try {
      // Récupérer le dernier numéro de ticket
      const { data: lastOrder, error } = await supabase
        .from("orders")
        .select("ticket_number")
        .order("ticket_number", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        console.error("Error fetching last ticket number:", error.message);
        throw error;
      }

      // Commencer à 1 ou incrémenter le dernier numéro
      return lastOrder ? lastOrder.ticket_number + 1 : 1;
    } catch (error) {
      console.error("Error in generateTicketNumber:", error.message);
      return Math.floor(Math.random() * 1000) + 1; // Fallback aléatoire
    }
  },

  // Ajouter un élément à la commande
  async addOrderItem(orderItemData) {
    try {
      const { data: orderItem, error } = await supabase
        .from("order_items")
        .insert([orderItemData])
        .select()
        .single();

      if (error) {
        console.error("Error adding order item:", error.message);
        throw error;
      }

      return orderItem;
    } catch (error) {
      console.error("Error in addOrderItem:", error.message);
      throw error;
    }
  },

  // Créer une commande complète avec tous les articles
  async createCompleteOrder(orderData, items) {
    try {
      // 1. Créer la commande principale
      const order = await this.createOrder(orderData);

      // 2. Ajouter tous les articles
      const orderItems = [];
      for (const item of items) {
        const orderItem = await this.addOrderItem({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.final_price || item.product_price,
          selected_options: item.customization || null,
        });
        orderItems.push(orderItem);
      }

      return {
        ...order,
        items: orderItems,
      };
    } catch (error) {
      console.error("Error in createCompleteOrder:", error.message);
      throw error;
    }
  },

  // Récupérer une commande avec ses éléments
  async getOrderWithItems(orderId) {
    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (*),
          customers (phone_number, loyalty_points)
        `
        )
        .eq("id", orderId)
        .single();

      if (orderError) {
        console.error("Error fetching order:", orderError.message);
        throw orderError;
      }

      return order;
    } catch (error) {
      console.error("Error in getOrderWithItems:", error.message);
      throw error;
    }
  },

  // Récupérer les commandes d'un client
  async getCustomerOrders(customerId) {
    try {
      const { data: orders, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            *,
            products (name, image_url)
          )
        `
        )
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching customer orders:", error.message);
        throw error;
      }

      return orders || [];
    } catch (error) {
      console.error("Error in getCustomerOrders:", error.message);
      throw error;
    }
  },

  // Mettre à jour le statut d'une commande
  async updateOrderStatus(orderId, status) {
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId)
        .select()
        .single();

      if (error) {
        console.error("Error updating order status:", error.message);
        throw error;
      }

      return order;
    } catch (error) {
      console.error("Error in updateOrderStatus:", error.message);
      throw error;
    }
  },

  // Calculer le total d'une commande
  calculateOrderTotal(items) {
    return items.reduce((total, item) => {
      return (
        total +
        parseFloat(item.unit_price || item.product_price) * item.quantity
      );
    }, 0);
  },

  // Calculer la TVA (20%)
  calculateVAT(subtotal) {
    return subtotal * 0.2;
  },
};
