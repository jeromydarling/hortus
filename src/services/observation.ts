import { supabase } from "@/integrations/supabase/client";

export const observationService = {
  async getByLand(landId: string, limit = 50) {
    const { data, error } = await supabase
      .from("observations")
      .select("*")
      .eq("land_id", landId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async create(observation: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("observations")
      .insert(observation)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
