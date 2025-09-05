import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Non-null assertions to avoid type errors in build; ensure env vars are set at runtime.
export const supabase = createClient(supabaseUrl!, supabaseKey!);
