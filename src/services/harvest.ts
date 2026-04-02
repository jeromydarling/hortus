import { supabase } from "@/integrations/supabase/client";

export const harvestService = {
  async getByLand(landId: string) {
    const { data, error } = await supabase
      .from("harvest_logs")
      .select("*")
      .eq("land_id", landId)
      .order("harvest_date", { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(log: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("harvest_logs")
      .insert(log)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
