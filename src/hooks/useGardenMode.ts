import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { profileService } from "@/services/profile";

interface GardenMode {
  mode: "solo" | "community";
  isSolo: boolean;
  isCommunity: boolean;
}

export function useGardenMode(): GardenMode {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => profileService.get(user!.id),
    enabled: !!user,
  });

  const mode = profile?.garden_mode ?? "solo";

  return {
    mode: mode as "solo" | "community",
    isSolo: mode === "solo",
    isCommunity: mode === "community",
  };
}
