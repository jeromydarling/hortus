import { supabase } from "@/integrations/supabase/client";

export const nriService = {
  async getChatHistory(userId: string, landId: string, limit = 50) {
    const { data, error } = await supabase
      .from("nri_chat_messages")
      .select("*")
      .eq("user_id", userId)
      .eq("land_id", landId)
      .order("created_at", { ascending: true })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async sendMessage(message: string, context: Record<string, unknown>) {
    const { data, error } = await supabase.functions.invoke("nri-chat", {
      body: { message, context },
    });
    if (error) throw error;
    return data;
  },
};
