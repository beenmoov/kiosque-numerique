import { supabase } from "../utils/supabase";

export const productService = {
  // Récupérer tous les produits disponibles avec leurs catégories
  async getAllAvailableProducts() {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          categories (name, image_url)
        `
        )
        .eq("is_available", true)
        .order("name");

      if (error) {
        console.error("Error fetching products:", error.message);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getAllAvailableProducts:", error.message);
      throw error;
    }
  },

  // Récupérer les produits par catégorie
  async getProductsByCategory(categoryId) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", categoryId)
        .eq("is_available", true)
        .order("name");

      if (error) {
        console.error("Error fetching products by category:", error.message);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getProductsByCategory:", error.message);
      throw error;
    }
  },

  // Rechercher des produits
  async searchProducts(searchTerm) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_available", true)
        .ilike("name", `%${searchTerm}%`)
        .order("name");

      if (error) {
        console.error("Error searching products:", error.message);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in searchProducts:", error.message);
      throw error;
    }
  },
};
