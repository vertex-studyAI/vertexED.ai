import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, PropsWithChildren } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { trackLogout } from "@/lib/accountLifecycleAnalytics.mjs";
import { setPlannerStorageScope } from "@/lib/plannerStorageScope.mjs";
import { buildMissingProfileInsert, buildProfileUpdate } from "@/lib/profileRecovery.mjs";
import { supabase } from "@/lib/supabaseClient";
import { setUserContentStorageScope } from "@/lib/userContentStorageScope.mjs";
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

function setSensitiveStorageScopes(scope?: string | null) {
  setUserContentStorageScope(scope);
  setPlannerStorageScope(scope);
}

export function AuthProvider({ children }: PropsWithChildren<{}>) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const activeProfileUserIdRef = useRef<string | null | undefined>(undefined);
  const profileRequestRef = useRef(0);

  const bindProfileIdentity = useCallback((userId?: string | null) => {
    const changed = activeProfileUserIdRef.current !== userId;
    activeProfileUserIdRef.current = userId;
    // Invalidate every profile request started under an older auth event, including
    // a request for the same user that predates a newer session/profile refresh.
    profileRequestRef.current += 1;
    if (changed) setProfile(null);
  }, []);

  // Initialize auth state and subscribe to changes
  useEffect(() => {
    let isMounted = true;
    let loadingSafetyTimer: number | undefined;

    // Until Supabase resolves the current identity, sensitive device fallback remains
    // in isolated "unhydrated" storage scopes.
    bindProfileIdentity(undefined);
    setSensitiveStorageScopes(undefined);

    const init = async () => {
      if (!supabase) {
        // Graceful fallback when env vars are missing; treat as signed-out.
        bindProfileIdentity(null);
        setSensitiveStorageScopes(null);
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }
      // Safety: ensure we don't stay in loading forever due to a flaky network
      // @ts-ignore - window.setTimeout typing differences
      loadingSafetyTimer = window.setTimeout(() => {
        if (isMounted) setLoading(false);
      }, 4000);

      const { data, error } = await supabase.auth.getSession();
      if (!isMounted) return;
      if (error) {
        console.error("Supabase getSession error:", error);
      }
      const nextUser = data.session?.user ?? null;
      bindProfileIdentity(nextUser?.id ?? null);
      setSensitiveStorageScopes(nextUser?.id ?? null);
      setSession(data.session ?? null);
      setUser(nextUser);
      // Don't block app on profile fetch; fire and forget
      if (nextUser) refreshProfile(nextUser.id, nextUser.email);
      setLoading(false);
    };

    init();

    if (!supabase) return () => { isMounted = false; };

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return;
      const nextUser = newSession?.user ?? null;
      // Change profile/storage ownership before React descendants can act on the new session.
      bindProfileIdentity(nextUser?.id ?? null);
      setSensitiveStorageScopes(nextUser?.id ?? null);
      setSession(newSession);
      setUser(nextUser);
      if (nextUser) {
        // Update profile in background
        refreshProfile(nextUser.id, nextUser.email);
      } else {
        setProfile(null);
      }
      // Any auth event implies we can render
      setLoading(false);
    });

    return () => {
      isMounted = false;
      if (loadingSafetyTimer) clearTimeout(loadingSafetyTimer);
      sub.subscription.unsubscribe();
    };
  }, [bindProfileIdentity]);

  /**
   * Sign in with email/password via Supabase.
   * Throws on error; on success, context user/session are updated.
   */
  const login = async (email: string, password: string) => {
    if (!supabase) throw new Error("Auth is disabled: Supabase not configured.");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    bindProfileIdentity(data.user?.id ?? null);
    setSensitiveStorageScopes(data.user?.id ?? null);
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
    // Redirect occurs automatically; the auth.users trigger enforces profile creation.
  };

  /**
   * Sign up a new user. If email confirmation is enabled, returns needsConfirmation=true
   * and does not navigate automatically.
   */
  const signUp = async (
    _email: string,
    _password: string,
    _metadata?: Record<string, any>
  ) => {
    throw new Error(
      "Direct signup is disabled. Use /signup with a waitlist approval or team invite code.",
    );
  };

  /** Sign out current user and clear auth state. */
  const logout = async () => {
    if (!supabase) {
      bindProfileIdentity(null);
      setSensitiveStorageScopes(null);
      setSession(null);
      setUser(null);
      setProfile(null);
      trackLogout({ outcome: "success", backend: "local" });
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      trackLogout({ outcome: "failure", backend: "supabase" });
      throw error;
    }

    bindProfileIdentity(null);
    setSensitiveStorageScopes(null);
    setSession(null);
    setUser(null);
    setProfile(null);
    trackLogout({ outcome: "success", backend: "supabase" });
  };

  /** Fetch latest profile for current user. */
  const refreshProfile = async (userId: string, fallbackEmail?: string | null) => {
    if (!supabase) return;
    const requestId = profileRequestRef.current + 1;
    profileRequestRef.current = requestId;
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url, board, grade, subjects, exam_date, created_at, updated_at")
      .eq("id", userId)
      .maybeSingle();
    // A profile response belongs only to the auth identity and request epoch that
    // started it. Never let a delayed response cross an account/session boundary.
    if (activeProfileUserIdRef.current !== userId || profileRequestRef.current !== requestId) return;
    if (error) {
      console.error("profiles fetch error:", error);
      return;
    }
    setProfile(
      data
        ? ({
            ...(data as Profile),
            email: (data as Profile).email ?? fallbackEmail ?? null,
          } as Profile)
        : null,
    );
  };

  /** Ensure a profile exists without clobbering learner-edited fields with empty Auth metadata. */
  const postAuthUpsertProfile = async (u: User, metadata?: Record<string, any>) => {
    if (!supabase) return;

    const updatedAt = new Date().toISOString();
    const updatePayload = buildProfileUpdate(u, metadata, updatedAt);
    const { data: updated, error: updateError } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", u.id)
      .select("id")
      .maybeSingle();

    if (updateError) {
      console.error("profiles update error:", updateError);
      return;
    }

    if (!updated) {
      const insertPayload = buildMissingProfileInsert(u, metadata, updatedAt);
      const { error: insertError } = await supabase.from("profiles").insert(insertPayload);
      // A concurrent auth event may have inserted the same profile first.
      if (insertError && insertError.code !== "23505") {
        console.error("profiles recovery insert error:", insertError);
        return;
      }
    }

    await refreshProfile(u.id, u.email);
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
