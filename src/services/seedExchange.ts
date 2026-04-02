import { supabase } from "@/integrations/supabase/client";

export const seedExchangeService = {
  async getAvailable(zip?: string) {
    let query = supabase
      .from("seed_exchanges")
      .select("*")
      .eq("status", "available")
      .order("created_at", { ascending: false });

    if (zip) {
      query = query.eq("zip", zip);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from("seed_exchanges")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(exchange: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("seed_exchanges")
      .insert(exchange)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async claim(exchangeId: string, userId: string) {
    const { data, error } = await supabase
      .from("seed_exchanges")
      .update({ status: "claimed", claimed_by: userId })
      .eq("id", exchangeId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
