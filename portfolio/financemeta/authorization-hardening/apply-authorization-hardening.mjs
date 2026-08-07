#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const target = path.resolve(process.argv[2] || '');
if (!target || !fs.existsSync(path.join(target, 'supabase/migrations/001_initial_schema.sql'))) {
  throw new Error('usage: apply-authorization-hardening.mjs TARGET_FINANCEMETA_CHECKOUT');
}

const migrationPath = path.join(target, 'supabase/migrations/002_authorization_hardening.sql');
const testPath = path.join(target, 'src/test/authorization-contract.test.ts');
if (fs.existsSync(migrationPath) || fs.existsSync(testPath)) {
  throw new Error('authorization hardening target files already exist; refusing ambiguous overwrite');
}

const migration = `-- FinanceMeta authorization hardening
-- Prevent members from escalating profiles.role through direct PostgREST/client writes.
-- This migration is additive and must be reviewed/applied through the normal Supabase migration flow.

BEGIN;

-- Preserve row ownership on self-service profile updates and make the post-update
-- row satisfy the same ownership condition.
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id AND role = 'member'::public.user_role);

-- RLS is row-level, not column-level. Revoke broad writes and grant only the
-- fields a member is allowed to maintain. Authorization role and profile email
-- cannot be directly changed through an authenticated browser client.
REVOKE INSERT, UPDATE ON TABLE public.profiles FROM anon, authenticated;
GRANT INSERT (id, email, display_name, avatar_url, bio, interests, open_to_collaborate, chapter_id)
  ON TABLE public.profiles TO authenticated;
GRANT UPDATE (display_name, avatar_url, bio, interests, open_to_collaborate, chapter_id)
  ON TABLE public.profiles TO authenticated;

-- Security-definer authorization helpers must not inherit caller-controlled
-- search paths. Policies may call them as authenticated users, but anon/public
-- execution is not required.
ALTER FUNCTION public.get_user_role() SET search_path = public;
ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.is_lead_or_admin() SET search_path = public;

REVOKE ALL ON FUNCTION public.get_user_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_lead_or_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_lead_or_admin() TO authenticated;

COMMIT;
`;

const test = `import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const migration = fs.readFileSync(
  path.resolve(process.cwd(), 'supabase/migrations/002_authorization_hardening.sql'),
  'utf8',
);
const authContext = fs.readFileSync(
  path.resolve(process.cwd(), 'src/contexts/AuthContext.tsx'),
  'utf8',
);

describe('FinanceMeta authorization boundary', () => {
  it('removes role from authenticated table-level writes', () => {
    expect(migration).toContain('REVOKE INSERT, UPDATE ON TABLE public.profiles FROM anon, authenticated');
    expect(migration).toContain('GRANT INSERT (id, email, display_name, avatar_url, bio, interests, open_to_collaborate, chapter_id)');
    expect(migration).toContain('GRANT UPDATE (display_name, avatar_url, bio, interests, open_to_collaborate, chapter_id)');
    expect(migration).not.toMatch(/GRANT UPDATE \([^)]*role/i);
    expect(migration).not.toMatch(/GRANT INSERT \([^)]*role/i);
  });

  it('requires owned rows to remain owned after self-service updates', () => {
    expect(migration).toContain('USING (auth.uid() = id)');
    expect(migration).toContain('WITH CHECK (auth.uid() = id)');
    expect(migration).toContain("WITH CHECK (auth.uid() = id AND role = 'member'::public.user_role)");
  });

  it('pins security-definer helper search paths', () => {
    for (const fn of ['get_user_role', 'is_admin', 'is_lead_or_admin']) {
      expect(migration).toContain(\`ALTER FUNCTION public.\${fn}() SET search_path = public\`);
      expect(migration).toContain(\`REVOKE ALL ON FUNCTION public.\${fn}() FROM PUBLIC\`);
      expect(migration).toContain(\`GRANT EXECUTE ON FUNCTION public.\${fn}() TO authenticated\`);
    }
  });

  it('keeps the current member profile UI within the safe-column grant', () => {
    expect(authContext).toContain('display_name?: string');
    expect(authContext).toContain('bio?: string');
    expect(authContext).toContain('interests?: string[]');
    expect(authContext).toContain('open_to_collaborate?: boolean');
    expect(authContext).toContain('chapter_id?: string');
    expect(authContext).not.toMatch(/updateProfile[\\s\\S]{0,300}role\\??:/);
  });
});
`;

fs.mkdirSync(path.dirname(migrationPath), { recursive: true });
fs.mkdirSync(path.dirname(testPath), { recursive: true });
fs.writeFileSync(migrationPath, migration, 'utf8');
fs.writeFileSync(testPath, test, 'utf8');
console.log(JSON.stringify({ migrationPath, testPath }, null, 2));
