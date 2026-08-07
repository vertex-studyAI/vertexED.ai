#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || '');
if (!root || !fs.existsSync(path.join(root, 'src/lib/supabase.ts'))) {
  throw new Error('usage: apply-env-recovery.mjs TARGET_FINANCEMETA_CHECKOUT');
}

const envModule = `export interface FinanceMetaPublicEnv {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}

export interface ResolvedSupabasePublicEnv {
  url: string;
  key: string;
}

export function resolveSupabasePublicEnv(env: FinanceMetaPublicEnv): ResolvedSupabasePublicEnv {
  const url = env.VITE_SUPABASE_URL?.trim();
  const key = (env.VITE_SUPABASE_ANON_KEY ?? env.VITE_SUPABASE_PUBLISHABLE_KEY)?.trim();

  if (!url) {
    throw new Error('Missing VITE_SUPABASE_URL');
  }
  if (!key) {
    throw new Error('Missing VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY');
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('VITE_SUPABASE_URL must be a valid URL');
  }
  const localhost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  if (parsed.protocol !== 'https:' && !localhost) {
    throw new Error('VITE_SUPABASE_URL must use HTTPS outside localhost');
  }
  if (url === 'http://localhost:0' || key === 'missing-key') {
    throw new Error('Placeholder Supabase configuration is not allowed');
  }

  return { url: parsed.toString().replace(/\/$/, ''), key };
}
`;

const supabase = `import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { resolveSupabasePublicEnv } from "@/lib/supabase-env";

const resolved = resolveSupabasePublicEnv(import.meta.env);

export const isSupabaseConfigured = true;

export const supabase = createClient<Database>(resolved.url, resolved.key, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export function getAuthRedirectUrl() {
  return \`${'${window.location.origin}'}/auth/callback\`;
}
`;

const test = `import { describe, expect, it } from 'vitest';
import { resolveSupabasePublicEnv } from '@/lib/supabase-env';

describe('FinanceMeta public environment contract', () => {
  it('accepts a valid HTTPS Supabase URL and public key', () => {
    expect(resolveSupabasePublicEnv({
      VITE_SUPABASE_URL: 'https://example.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'public-anon-key',
    })).toEqual({ url: 'https://example.supabase.co', key: 'public-anon-key' });
  });

  it('supports the publishable-key fallback', () => {
    expect(resolveSupabasePublicEnv({
      VITE_SUPABASE_URL: 'https://example.supabase.co/',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'public-publishable-key',
    })).toEqual({ url: 'https://example.supabase.co', key: 'public-publishable-key' });
  });

  it('fails closed when the URL or key is missing', () => {
    expect(() => resolveSupabasePublicEnv({ VITE_SUPABASE_ANON_KEY: 'key' })).toThrow('Missing VITE_SUPABASE_URL');
    expect(() => resolveSupabasePublicEnv({ VITE_SUPABASE_URL: 'https://example.supabase.co' })).toThrow('Missing VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY');
  });

  it('rejects malformed, insecure, and placeholder endpoints', () => {
    expect(() => resolveSupabasePublicEnv({ VITE_SUPABASE_URL: 'not-a-url', VITE_SUPABASE_ANON_KEY: 'key' })).toThrow('valid URL');
    expect(() => resolveSupabasePublicEnv({ VITE_SUPABASE_URL: 'http://example.supabase.co', VITE_SUPABASE_ANON_KEY: 'key' })).toThrow('must use HTTPS');
    expect(() => resolveSupabasePublicEnv({ VITE_SUPABASE_URL: 'http://localhost:0', VITE_SUPABASE_ANON_KEY: 'missing-key' })).toThrow('Placeholder');
  });

  it('allows explicit localhost development endpoints without accepting placeholders', () => {
    expect(resolveSupabasePublicEnv({
      VITE_SUPABASE_URL: 'http://127.0.0.1:54321',
      VITE_SUPABASE_ANON_KEY: 'local-public-key',
    })).toEqual({ url: 'http://127.0.0.1:54321', key: 'local-public-key' });
  });
});
`;

const envPath = path.join(root, 'src/lib/supabase-env.ts');
const supabasePath = path.join(root, 'src/lib/supabase.ts');
const testPath = path.join(root, 'src/test/supabase-env.test.ts');
if (fs.existsSync(envPath) || fs.existsSync(testPath)) {
  throw new Error('environment recovery files already exist; refusing ambiguous overwrite');
}
fs.mkdirSync(path.dirname(envPath), { recursive: true });
fs.mkdirSync(path.dirname(testPath), { recursive: true });
fs.writeFileSync(envPath, envModule, 'utf8');
fs.writeFileSync(supabasePath, supabase, 'utf8');
fs.writeFileSync(testPath, test, 'utf8');
console.log('FinanceMeta fail-closed environment recovery applied');
