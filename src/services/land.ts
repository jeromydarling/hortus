import { supabase } from "@/integrations/supabase/client";

export const landService = {
  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from("lands")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(landId: string) {
    const { data, error } = await supabase
      .from("lands")
      .select("*")
      .eq("id", landId)
      .single();
    if (error) throw error;
    return data;
  },

  async create(land: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("lands")
      .insert(land)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(landId: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("lands")
      .update(updates)
      .eq("id", landId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
