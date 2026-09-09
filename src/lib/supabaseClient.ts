import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createRecoveryEventLatch } from "./authReturn.mjs";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

/**
 * Create Supabase client only when env vars are present. When missing, export null and let
 * callers handle gracefully (e.g., disable auth locally instead of crashing the whole app).
 */
let client: SupabaseClient | null = null;
export const authRecoveryEvent = createRecoveryEventLatch();
if (supabaseUrl && supabaseKey) {
	client = createClient(supabaseUrl, supabaseKey, {
		auth: {
			// AuthCallback owns the one-time code exchange. Implicit token and
			// recovery returns remain SDK-owned so its verified auth events survive.
			detectSessionInUrl: !new URLSearchParams(window.location.search).has('code'),
		},
	});
	// Subscribe before React/lazy routes mount. This listener never calls the SDK
	// from inside its auth lock and retains no session credentials.
	client.auth.onAuthStateChange((event, session) => authRecoveryEvent.observe(event, session));
} else {
	console.warn(
		"Supabase env vars are not set (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY). Auth is disabled locally."
	);
}

export const supabase = client;
