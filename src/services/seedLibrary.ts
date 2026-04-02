import { supabase } from "@/integrations/supabase/client";

export const seedLibraryService = {
  async getByLand(landId: string) {
    const { data, error } = await supabase
      .from("seed_library")
      .select("*")
      .eq("land_id", landId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(entry: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("seed_library")
      .insert(entry)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
