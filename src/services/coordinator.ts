import { supabase } from "@/integrations/supabase/client";

export const coordinatorService = {
  async getAssignedGardens(coordinatorId: string) {
    const { data, error } = await supabase
      .from("coordinator_assignments")
      .select("*, communities(*)")
      .eq("coordinator_id", coordinatorId)
      .eq("is_active", true);
    if (error) throw error;
    return data;
  },

  async getVisits(coordinatorId: string, limit = 50) {
    const { data, error } = await supabase
      .from("field_visits")
      .select("*")
      .eq("visitor_id", coordinatorId)
      .order("started_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async logVisit(visit: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("field_visits")
      .insert(visit)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async completeVisit(visitId: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("field_visits")
      .update({ ...updates, status: "completed" })
      .eq("id", visitId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getMorningBriefing(userId: string) {
    const { data, error } = await supabase
      .from("morning_briefings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  async getPhotoAnalyses(userId: string, limit = 20) {
    const { data, error } = await supabase
      .from("photo_analyses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },
};
