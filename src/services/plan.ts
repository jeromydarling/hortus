import { supabase } from "@/integrations/supabase/client";

export const planService = {
  async getByLand(landId: string) {
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("land_id", landId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getActive(landId: string) {
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("land_id", landId)
      .eq("status", "active")
      .single();
    if (error) throw error;
    return data;
  },

  async create(plan: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("plans")
      .insert(plan)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(planId: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("plans")
      .update(updates)
      .eq("id", planId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
