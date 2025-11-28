import { supabase } from "../utils/supabase";

export const categoryService = {
  // Récupérer toutes les catégories triées par sort_order
  async getAllCategories() {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Error fetching categories:", error.message);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getAllCategories:", error.message);
      throw error;
    }
  },

  // Récupérer une catégorie spécifique par ID
  async getCategoryById(id) {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching category:", error.message);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in getCategoryById:", error.message);
      throw error;
    }
  },

  // Récupérer les produits d'une catégorie spécifique
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
};
