import { supabase } from "@/integrations/supabase/client";

export const communityService = {
  async getById(communityId: string) {
    const { data, error } = await supabase
      .from("communities")
      .select("*")
      .eq("id", communityId)
      .single();
    if (error) throw error;
    return data;
  },

  async getMembers(communityId: string) {
    const { data, error } = await supabase
      .from("persons")
      .select("*")
      .eq("community_id", communityId)
      .order("display_name");
    if (error) throw error;
    return data;
  },

  async getWorkdays(communityId: string) {
    const { data, error } = await supabase
      .from("workdays")
      .select("*")
      .eq("community_id", communityId)
      .order("scheduled_date", { ascending: true });
    if (error) throw error;
    return data;
  },

  async getSharingPosts(communityId: string) {
    const { data, error } = await supabase
      .from("sharing_posts")
      .select("*")
      .eq("community_id", communityId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getMessages(communityId: string, threadId?: string) {
    let query = supabase
      .from("messages")
      .select("*")
      .eq("community_id", communityId)
      .order("created_at", { ascending: true });

    if (threadId) {
      query = query.eq("thread_id", threadId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getNriSignals(communityId: string) {
    const { data, error } = await supabase
      .from("nri_signals")
      .select("*")
      .eq("community_id", communityId)
      .is("resolved_at", null)
      .order("detected_at", { ascending: false });
    if (error) throw error;
    return data;
  },
};
