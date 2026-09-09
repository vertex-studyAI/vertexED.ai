import { createContext, useCallback, useContext, useEffect, useRef, useState, PropsWithChildren } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { trackLogout } from "@/lib/accountLifecycleAnalytics.mjs";
import { setAuthAccessToken } from "@/lib/apiAuth";
import { setPlannerStorageScope } from "@/lib/plannerStorageScope.mjs";
import { buildMissingProfileInsert, buildProfileUpdate } from "@/lib/profileRecovery.mjs";
import { supabase } from "@/lib/supabaseClient";
import { setUserContentStorageScope } from "@/lib/userContentStorageScope.mjs";
import { initializeLearnerStateSync } from "@/lib/learnerStateSync";
import { syncLocalStudyArtifacts } from "@/lib/userContent";
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
  logout: (options?: { localOnly?: boolean }) => Promise<void>;
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

function initializeAccountPersistence() {
  void Promise.allSettled([initializeLearnerStateSync(), syncLocalStudyArtifacts()]);
}

export function AuthProvider({ children }: PropsWithChildren) {
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
    let sessionEventRevision = 0;
    let loadingSafetyTimer: number | undefined;
    const clearLoadingSafetyTimer = () => {
      if (loadingSafetyTimer !== undefined) {
        window.clearTimeout(loadingSafetyTimer);
        loadingSafetyTimer = undefined;
      }
    };

    // Until Supabase resolves the current identity, sensitive device fallback remains
    // in isolated "unhydrated" storage scopes.
    bindProfileIdentity(undefined);
    setSensitiveStorageScopes(undefined);
    setAuthAccessToken(null);

    const init = async () => {
      if (!supabase) {
        // Graceful fallback when env vars are missing; treat as signed-out.
        bindProfileIdentity(null);
        setSensitiveStorageScopes(null);
        setAuthAccessToken(null);
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }
      // Safety: ensure we don't stay in loading forever due to a flaky network
      loadingSafetyTimer = window.setTimeout(() => {
        if (isMounted) setLoading(false);
      }, 4000);

      const initialRevision = sessionEventRevision;
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!isMounted || initialRevision !== sessionEventRevision) return;
        clearLoadingSafetyTimer();
        if (error) throw error;
        const nextUser = data.session?.user ?? null;
        bindProfileIdentity(nextUser?.id ?? null);
        setSensitiveStorageScopes(nextUser?.id ?? null);
        setAuthAccessToken(data.session?.access_token);
        if (nextUser) initializeAccountPersistence();
        setSession(data.session ?? null);
        setUser(nextUser);
        // Don't block app on profile fetch; fire and forget with a handled failure.
        if (nextUser) void refreshProfile(nextUser.id, nextUser.email).catch(() => {
          console.warn("Profile refresh unavailable after session initialization.");
        });
        setLoading(false);
      } catch {
        if (!isMounted || initialRevision !== sessionEventRevision) return;
        clearLoadingSafetyTimer();
        bindProfileIdentity(null);
        setSensitiveStorageScopes(null);
        setAuthAccessToken(null);
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
        console.warn("Authentication session could not be restored.");
      }
    };

    init();

    if (!supabase) return () => { isMounted = false; };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!isMounted) return;
      sessionEventRevision += 1;
      clearLoadingSafetyTimer();
      const nextUser = newSession?.user ?? null;
      // Change profile/storage ownership before React descendants can act on the new session.
      bindProfileIdentity(nextUser?.id ?? null);
      setSensitiveStorageScopes(nextUser?.id ?? null);
      setAuthAccessToken(newSession?.access_token);
      if (nextUser) initializeAccountPersistence();
      setSession(newSession);
      setUser(nextUser);
      if (nextUser) {
        // Update profile in background
        void refreshProfile(nextUser.id, nextUser.email).catch(() => {
          console.warn("Profile refresh unavailable after authentication changed.");
        });
      } else {
        setProfile(null);
      }
      // Any auth event implies we can render
      setLoading(false);
    });

    return () => {
      isMounted = false;
      clearLoadingSafetyTimer();
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
    setAuthAccessToken(data.session?.access_token);
    if (data.user) initializeAccountPersistence();
    setSession(data.session);
    setUser(data.user);
    if (data.user) {
      // Authentication is already complete. Profile repair is best-effort and must
      // never hold navigation hostage to a slow or unavailable profile backend.
      void postAuthUpsertProfile(data.user).catch((profileError) => {
        console.error("post-login profile recovery error:", profileError);
      });
    }
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
    // Redirect occurs automatically by Supabase; profile creation is enforced by the auth.users trigger.
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
  const logout = async (options: { localOnly?: boolean } = {}) => {
    if (!supabase) {
      bindProfileIdentity(null);
      setSensitiveStorageScopes(null);
      setAuthAccessToken(null);
      setSession(null);
      setUser(null);
      setProfile(null);
      trackLogout({ outcome: "success", backend: "local" });
      return;
    }

    const { error } = await supabase.auth.signOut(
      options.localOnly ? { scope: "local" } : { scope: "global" },
    );
    if (error) {
      trackLogout({ outcome: "failure", backend: "supabase" });
      throw error;
    }

    bindProfileIdentity(null);
    setSensitiveStorageScopes(null);
    setAuthAccessToken(null);
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

  /** Ensure a profile row exists without overwriting learner-edited fields with empty Auth metadata. */
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
      // A concurrent auth event may have repaired the same profile first. In that
      // narrow race, the unique-key conflict is success-equivalent for recovery.
      if (insertError && insertError.code !== "23505") {
        console.error("profiles recovery insert error:", insertError);
        return;
      }
    }

    await refreshProfile(u.id, u.email);
  };

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user,
    loading,
    profile,
    login,
    loginWithGoogle,
    signUp,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
