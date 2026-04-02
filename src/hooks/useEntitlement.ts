import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { profileService } from "@/services/profile";

interface Entitlement {
  tier: "free" | "solo" | "community";
  isActive: boolean;
  isTrial: boolean;
  daysRemaining: number | null;
}

export function useEntitlement(): Entitlement {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => profileService.get(user!.id),
    enabled: !!user,
  });

  const tier = (profile?.subscription_tier ?? "free") as
    | "free"
    | "solo"
    | "community";
  const status = profile?.subscription_status ?? "inactive";
  const trialEnds = profile?.trial_ends_at
    ? new Date(profile.trial_ends_at)
    : null;
  const now = new Date();

  const isTrial =
    trialEnds !== null && trialEnds > now && status !== "active";
  const isActive = status === "active" || isTrial;
  const daysRemaining =
    trialEnds !== null
      ? Math.max(
          0,
          Math.ceil(
            (trialEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
          ),
        )
      : null;

  return { tier, isActive, isTrial, daysRemaining };
}
