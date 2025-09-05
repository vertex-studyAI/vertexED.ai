import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Create Supabase client only when env vars are present. When missing, export null and let
 * callers handle gracefully (e.g., disable auth locally instead of crashing the whole app).
 */
let client: SupabaseClient | null = null;
if (supabaseUrl && supabaseKey) {
	client = createClient(supabaseUrl, supabaseKey);
} else {
	// eslint-disable-next-line no-console
	console.warn(
		"Supabase env vars are not set (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Auth is disabled locally."
	);
}

export const supabase = client;
