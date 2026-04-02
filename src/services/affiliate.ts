import { supabase } from "@/integrations/supabase/client";

export const affiliateService = {
  async logClick(
    seedsNowUrl: string,
    cropName: string | null,
    userId: string,
  ) {
    const { error } = await supabase.from("affiliate_events").insert({
      type: "click",
      seeds_now_url: seedsNowUrl,
      crop_name: cropName,
      user_id: userId,
    });
    if (error) throw error;
  },
};
