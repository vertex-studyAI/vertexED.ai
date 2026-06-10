import { z } from "zod";

const rawEnvSchema = z
  .object({
    VITE_SUPABASE_URL: z.string().trim().optional(),
    VITE_SUPABASE_ANON_KEY: z.string().trim().optional(),
    VITE_CHATBOT_API_URL: z.string().trim().optional(),
    VITE_SITE_URL: z.string().trim().optional(),
    VITE_APP_NAME: z.string().trim().optional(),
    VITE_DEFAULT_THEME: z.enum(["light", "dark", "amoled", "system"]).optional(),
    VITE_ENABLE_PARTICLES: z.enum(["true", "false"]).optional(),
    VITE_ENABLE_FOCUS_MODE: z.enum(["true", "false"]).optional(),
  })
  .passthrough();

const rawEnv = rawEnvSchema.parse(import.meta.env);

function normalizeUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  try {
    return new URL(trimmed).toString().replace(/\/$/, "");
  } catch {
    return trimmed;
  }
}

function normalizeTheme(value: string | undefined) {
  if (!value) return "system" as const;
  const normalized = value.trim().toLowerCase();
  if (normalized === "light" || normalized === "dark" || normalized === "amoled" || normalized === "system") {
    return normalized;
  }
  return "system" as const;
}

function normalizeFlag(value: string | undefined, defaultValue = true) {
  if (value === undefined) return defaultValue;
  return value.trim().toLowerCase() !== "false";
}

export const env = {
  supabaseUrl: normalizeUrl(rawEnv.VITE_SUPABASE_URL),
  supabaseAnonKey: rawEnv.VITE_SUPABASE_ANON_KEY?.trim() || undefined,
  chatbotApiUrl: normalizeUrl(rawEnv.VITE_CHATBOT_API_URL),
  siteUrl: normalizeUrl(rawEnv.VITE_SITE_URL) || "https://www.vertexed.app",
  appName: rawEnv.VITE_APP_NAME?.trim() || "VertexED AI",
  defaultTheme: normalizeTheme(rawEnv.VITE_DEFAULT_THEME),
  enableParticles: normalizeFlag(rawEnv.VITE_ENABLE_PARTICLES, true),
  enableFocusMode: normalizeFlag(rawEnv.VITE_ENABLE_FOCUS_MODE, true),
} as const;

export const hasSupabaseConfig = Boolean(env.supabaseUrl && env.supabaseAnonKey);

export function isFeatureEnabled(name: "particles" | "focusMode") {
  return name === "particles" ? env.enableParticles : env.enableFocusMode;
}
