"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { isSupabaseConfigured, pingSupabase } from "@/lib/supabase/config";
import { isRole, type Role } from "@/lib/auth/roles";
import { useHydrated } from "@/lib/useHydrated";

export type Profile = { display_name: string | null; avatar_url: string | null; role: Role };

type Auth = {
  /** False when Supabase keys aren't set: the site then works without accounts. */
  configured: boolean;
  /** True until we know whether someone is signed in. */
  loading: boolean;
  /**
   * Supabase is set up but not answering (paused, network error, too slow). Everyone
   * then counts as signed out: no Sign in button, progress stays in the browser.
   */
  unavailable: boolean;
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
  // null while checking whether Supabase answers.
  const [reachable, setReachable] = useState<boolean | null>(isSupabaseConfigured ? null : false);

  // Is Supabase answering? Checked on load, and again when the visitor comes back to
  // the tab or reconnects while it was down.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    const check = () => pingSupabase().then((ok) => !cancelled && setReachable(ok));
    void check();
    const recheck = () => {
      if (document.visibilityState === "visible") void check();
    };
    window.addEventListener("online", recheck);
    document.addEventListener("visibilitychange", recheck);
    return () => {
      cancelled = true;
      window.removeEventListener("online", recheck);
      document.removeEventListener("visibilitychange", recheck);
    };
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    // Fires once straight away with the current session, then on every sign-in/out.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ loading: false, user: session?.user ?? null });
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const unavailable = reachable === false && isSupabaseConfigured;
  // While Supabase is down, act as signed out (its data can't be read or saved).
  const user = unavailable ? null : state.user;
  const userId = user?.id;

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
        loading: isSupabaseConfigured && (reachable === null || (!unavailable && state.loading)),
        unavailable,
        user,
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
  const hydrated = useHydrated();
  if (!auth) throw new Error("useAuth must be used inside <AuthProvider>.");
  // Until this component has hydrated, report what the server rendered: "still checking".
  return hydrated ? auth : { ...auth, loading: auth.configured, unavailable: false, user: null, profile: null };
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
