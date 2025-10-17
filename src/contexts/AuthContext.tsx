import { createContext, useContext, useEffect, useMemo, useState, PropsWithChildren } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import type { Profile } from "@/types/profile";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  profile: Profile | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signUp: (
    email: string,
    password: string,
    metadata?: Record<string, any>
  ) => Promise<{ user: User | null; session: Session | null; needsConfirmation: boolean }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAuthenticated: false,
  loading: true,
  profile: null,
  // no-op defaults; real implementations provided in Provider
  login: async () => {},
  loginWithGoogle: async () => {},
  signUp: async () => ({ user: null, session: null, needsConfirmation: true }),
  logout: async () => {},
});

export function AuthProvider({ children }: PropsWithChildren<{}>) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Initialize auth state and subscribe to changes
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (!supabase) {
        // Graceful fallback when env vars are missing; treat as signed-out.
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.auth.getSession();
      if (!isMounted) return;
      if (error) {
        console.error("Supabase getSession error:", error);
      }
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      if (data.session?.user) await refreshProfile(data.session.user.id);
      setLoading(false);
    };

    init();

  if (!supabase) return () => { isMounted = false; };

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        await refreshProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  /**
   * Sign in with email/password via Supabase.
   * Throws on error; on success, context user/session are updated.
   */
  const login = async (email: string, password: string) => {
    if (!supabase) throw new Error("Auth is disabled: Supabase not configured.");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setSession(data.session);
    setUser(data.user);
    if (data.user) await postAuthUpsertProfile(data.user);
  };

  /** Sign in with Google (OAuth). */
  const loginWithGoogle = async () => {
    if (!supabase) throw new Error("Auth is disabled: Supabase not configured.");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/auth/callback",
        queryParams: { prompt: "consent" },
      },
    });
    if (error) throw error;
    // Redirect occurs automatically by Supabase; profile upsert will happen post-redirect via onAuthStateChange
  };

  /**
   * Sign up a new user. If email confirmation is enabled, returns needsConfirmation=true
   * and does not navigate automatically.
   */
  const signUp = async (
    email: string,
    password: string,
    metadata?: Record<string, any>
  ) => {
    if (!supabase) throw new Error("Auth is disabled: Supabase not configured.");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: metadata ? { data: metadata } : undefined,
    });
    if (error) throw error;
    // If email confirmation is ON, session may be null until confirmed.
    setSession(data.session ?? null);
    setUser(data.user ?? null);
  if (data.user) await postAuthUpsertProfile(data.user, metadata);
    return { user: data.user ?? null, session: data.session ?? null, needsConfirmation: !data.session };
  };

  /** Sign out current user and clear auth state. */
  const logout = async () => {
    if (!supabase) {
      setSession(null);
      setUser(null);
      setProfile(null);
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  /** Fetch latest profile for current user. */
  const refreshProfile = async (userId: string) => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url, created_at, updated_at")
      .eq("id", userId)
      .maybeSingle();
    if (error) {
      console.error("profiles fetch error:", error);
      return;
    }
    setProfile((data as Profile) ?? null);
  };

  /** Ensure a profile row exists (id from auth) and update columns from metadata. */
  const postAuthUpsertProfile = async (u: User, metadata?: Record<string, any>) => {
    if (!supabase) return;
    const payload = {
      id: u.id,
      email: u.email,
      full_name: metadata?.full_name ?? u.user_metadata?.full_name ?? null,
      avatar_url: metadata?.avatar_url ?? u.user_metadata?.avatar_url ?? null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
    if (error) {
      console.error("profiles upsert error:", error);
    } else {
      await refreshProfile(u.id);
    }
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      isAuthenticated: !!user,
      loading,
      profile,
      login,
      loginWithGoogle,
      signUp,
      logout,
    }),
    [user, session, loading, profile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
