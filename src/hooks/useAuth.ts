import { useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  gardenId: string | null;
  communityId: string | null;
  communityRole: string | null;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [gardenId, setGardenId] = useState<string | null>(null);
  const [communityId, setCommunityId] = useState<string | null>(null);
  const [communityRole, setCommunityRole] = useState<string | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setGardenId(null);
      setCommunityId(null);
      setCommunityRole(null);
      return;
    }

    // Fetch profile data for admin status and garden/community info
    supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        setIsAdmin(data?.is_admin ?? false);
      });

    // Fetch land for gardenId
    supabase
      .from("lands")
      .select("id, community_garden_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        setGardenId(data?.id ?? null);
        setCommunityId(data?.community_garden_id ?? null);
      });

    // Fetch community role if applicable
    supabase
      .from("community_members")
      .select("role, community_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) {
          setCommunityRole(data.role);
          if (!communityId) setCommunityId(data.community_id);
        }
      });
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    session,
    loading,
    isAdmin,
    gardenId,
    communityId,
    communityRole,
    signOut,
  };
}
