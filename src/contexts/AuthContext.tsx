import { createContext, useContext, useEffect, useMemo, useState, PropsWithChildren } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
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
  // no-op defaults; real implementations provided in Provider
  login: async () => {},
  signUp: async () => ({ user: null, session: null, needsConfirmation: true }),
  logout: async () => {},
});

export function AuthProvider({ children }: PropsWithChildren<{}>) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state and subscribe to changes
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (!supabase) {
        // Graceful fallback when env vars are missing; treat as signed-out.
        setSession(null);
        setUser(null);
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
      setLoading(false);
    };

    init();

    if (!supabase) return () => { isMounted = false; };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
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
    return { user: data.user ?? null, session: data.session ?? null, needsConfirmation: !data.session };
  };

  /** Sign out current user and clear auth state. */
  const logout = async () => {
    if (!supabase) {
      setSession(null);
      setUser(null);
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null);
    setUser(null);
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      isAuthenticated: !!user,
      loading,
      login,
      signUp,
      logout,
    }),
    [user, session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
