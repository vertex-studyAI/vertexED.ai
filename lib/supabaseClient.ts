import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

let client: SupabaseClient | null = null;

if (env.supabaseUrl && env.supabaseAnonKey) {
  client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
} else if (typeof window !== "undefined") {
  console.warn(
    "[VertexED] Supabase is not configured. Authentication and persistence features will stay offline until VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.",
  );
}

export const supabase = client;
