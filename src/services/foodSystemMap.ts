import { supabase } from "@/integrations/supabase/client";

export const foodSystemMapService = {
  async getPoints(bounds?: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  }) {
    let query = supabase.from("food_system_points").select("*");

    if (bounds) {
      query = query
        .gte("lat", bounds.minLat)
        .lte("lat", bounds.maxLat)
        .gte("lon", bounds.minLon)
        .lte("lon", bounds.maxLon);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getUserPins() {
    const { data, error } = await supabase
      .from("user_map_pins")
      .select("*")
      .gt("user_count", 0);
    if (error) throw error;
    return data;
  },

  async getPointsByZip(zip: string) {
    const { data, error } = await supabase
      .from("food_system_points")
      .select("*")
      .eq("zip", zip);
    if (error) throw error;
    return data;
  },

  async searchFoodSystems(zip: string) {
    const { data, error } = await supabase.functions.invoke(
      "search-food-systems",
      { body: { zip } },
    );
    if (error) throw error;
    return data;
  },
};
