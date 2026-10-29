"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isRole, type Role } from "@/lib/auth/roles";

export type Profile = { display_name: string | null; avatar_url: string | null; role: Role };

type Auth = {
  /** False when Supabase keys aren't set: the site then works without accounts. */
  configured: boolean;
  /** True until we know whether someone is signed in. */
  loading: boolean;
  user: User | null;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<Auth | null>(null);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, role")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return { ...data, role: isRole(data.role) ? data.role : "user" };
}

/** Keeps track of who is signed in (in the browser), for the header, /account and progress. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ loading: boolean; user: User | null }>({
    loading: isSupabaseConfigured,
    user: null,
  });
  const [profile, setProfile] = useState<{ userId: string; value: Profile } | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    // Fires once straight away with the current session, then on every sign-in/out.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ loading: false, user: session?.user ?? null });
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = state.user?.id;

  // Loaded outside the auth callback, as Supabase recommends.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    fetchProfile(userId).then(
      (value) => !cancelled && value && setProfile({ userId, value }),
      (error) => console.error("Couldn't load your profile:", error),
    );
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const refreshProfile = useCallback(async () => {
    if (!userId) return;
    const value = await fetchProfile(userId);
    if (value) setProfile({ userId, value });
  }, [userId]);

  const signOut = useCallback(async () => {
    await getSupabaseBrowser()?.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        configured: isSupabaseConfigured,
        loading: state.loading,
        user: state.user,
        // Only the signed-in user's profile, never a previous user's.
        profile: profile && profile.userId === userId ? profile.value : null,
        refreshProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): Auth {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("useAuth must be used inside <AuthProvider>.");
  return auth;
}

/** The name to show for a user: their profile name, provider name, or email. */
export function displayName(user: User, profile: Profile | null) {
  return (
    profile?.display_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email ||
    "You"
  );
}

/** The avatar picture, if the user has one. */
export function avatarUrl(user: User, profile: Profile | null) {
  return (
    profile?.avatar_url ||
    (user.user_metadata?.avatar_url as string | undefined) ||
    (user.user_metadata?.picture as string | undefined) ||
    null
  );
}
