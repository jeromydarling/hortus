import { supabase } from "@/integrations/supabase/client";

export const plotService = {
  async getByLand(landId: string) {
    const { data, error } = await supabase
      .from("plots")
      .select("*")
      .eq("land_id", landId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data;
  },

  async create(plot: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("plots")
      .insert(plot)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(plotId: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("plots")
      .update(updates)
      .eq("id", plotId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(plotId: string) {
    const { error } = await supabase.from("plots").delete().eq("id", plotId);
    if (error) throw error;
  },
};
