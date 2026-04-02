import { supabase } from "@/integrations/supabase/client";

export const compostService = {
  async getByLand(landId: string) {
    const { data, error } = await supabase
      .from("compost_logs")
      .select("*")
      .eq("land_id", landId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getEntries(compostId: string) {
    const { data, error } = await supabase
      .from("compost_entries")
      .select("*")
      .eq("compost_id", compostId)
      .order("logged_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async createPile(pile: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("compost_logs")
      .insert(pile)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async addEntry(entry: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("compost_entries")
      .insert(entry)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updatePile(pileId: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("compost_logs")
      .update(updates)
      .eq("id", pileId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
