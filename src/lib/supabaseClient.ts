import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, hasSupabaseConfig } from "@/lib/env";

/**
 * Create Supabase client only when env vars are present. When missing, export null and let
 * callers handle gracefully (e.g., disable auth locally instead of crashing the whole app).
 */
let client: SupabaseClient | null = null;
if (hasSupabaseConfig) {
  client = createClient(env.supabaseUrl!, env.supabaseAnonKey!);
} else {
  console.warn(
    "Supabase env vars are not set (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Auth is disabled locally.",
  );
}

export const supabase = client;
