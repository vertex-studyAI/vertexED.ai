#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const target = path.resolve(process.argv[2] || '');
const migrationsDir = path.join(target, 'supabase/migrations');
if (!target || !fs.existsSync(migrationsDir)) {
  throw new Error('usage: apply-registration-immutability.mjs TARGET_FINANCEMETA_CHECKOUT');
}

const requiredHistory = [
  '009_event_registration_validation.sql',
  '019_event_registration_validation_hardening.sql',
];
for (const filename of requiredHistory) {
  if (!fs.existsSync(path.join(migrationsDir, filename))) {
    throw new Error(`expected FinanceMeta migration history missing: ${filename}`);
  }
}

const existing = fs.readdirSync(migrationsDir).filter((name) => /^\d+_/.test(name));
const maxVersion = existing.reduce((max, name) => Math.max(max, Number(name.match(/^(\d+)_/)[1])), 0);
if (maxVersion < 21) {
  throw new Error(`expected FinanceMeta migrations through at least 021; found max ${maxVersion}`);
}

const migrationName = `${String(maxVersion + 1).padStart(3, '0')}_event_registration_immutability.sql`;
const migrationPath = path.join(migrationsDir, migrationName);
const testPath = path.join(target, 'src/test/event-registration-immutability-contract.test.ts');
if (fs.existsSync(migrationPath) || fs.existsSync(testPath)) {
  throw new Error('registration immutability target files already exist; refusing ambiguous overwrite');
}

const migration = `-- FinanceMeta event-registration integrity hardening
-- Existing registration rows are immutable with respect to UPDATE.
-- Registrations may be read, inserted, or deleted by their owning user only.
-- Capacity/window/status validation remains enforced by the existing BEFORE INSERT validator.

BEGIN;

-- Remove every UPDATE-capable policy currently attached to event_registrations.
DO $$
DECLARE
  policy_name text;
BEGIN
  FOR policy_name IN
    SELECT polname
    FROM pg_policy
    WHERE polrelid = 'public.event_registrations'::regclass
      AND polcmd IN ('*', 'w')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.event_registrations', policy_name);
  END LOOP;
END
$$;

-- Recreate explicit owner-scoped policies without UPDATE permission.
DROP POLICY IF EXISTS "Users can view own event registrations" ON public.event_registrations;
CREATE POLICY "Users can view own event registrations"
  ON public.event_registrations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own event registrations" ON public.event_registrations;
CREATE POLICY "Users can create own event registrations"
  ON public.event_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own event registrations" ON public.event_registrations;
CREATE POLICY "Users can delete own event registrations"
  ON public.event_registrations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

REVOKE UPDATE ON TABLE public.event_registrations FROM anon, authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.event_registrations TO authenticated;

COMMIT;
`;

const test = `import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');
const migrationFile = fs.readdirSync(migrationsDir).find((name) => name.endsWith('_event_registration_immutability.sql'));
if (!migrationFile) throw new Error('event registration immutability migration missing');
const migration = fs.readFileSync(path.join(migrationsDir, migrationFile), 'utf8');

const registrationValidation = fs.readFileSync(
  path.join(migrationsDir, '019_event_registration_validation_hardening.sql'),
  'utf8',
);

describe('FinanceMeta event registration immutability boundary', () => {
  it('preserves INSERT-time validation as the only mutation path into registrations', () => {
    expect(registrationValidation).toContain('validate_event_registration');
    expect(registrationValidation).toContain('BEFORE INSERT');
  });

  it('removes UPDATE-capable RLS policies and table privilege', () => {
    expect(migration).toContain("polcmd IN ('*', 'w')");
    expect(migration).toContain('REVOKE UPDATE ON TABLE public.event_registrations FROM anon, authenticated');
    expect(migration).not.toContain('FOR UPDATE');
  });

  it('allows only owner-scoped select, insert, and delete', () => {
    for (const operation of ['SELECT', 'INSERT', 'DELETE']) {
      expect(migration).toContain('FOR ' + operation);
    }
    expect(migration).toContain('USING (auth.uid() = user_id)');
    expect(migration).toContain('WITH CHECK (auth.uid() = user_id)');
    expect(migration).toContain('GRANT SELECT, INSERT, DELETE ON TABLE public.event_registrations TO authenticated');
  });
});
`;

fs.mkdirSync(path.dirname(testPath), { recursive: true });
fs.writeFileSync(migrationPath, migration, 'utf8');
fs.writeFileSync(testPath, test, 'utf8');
console.log(JSON.stringify({ migrationPath, testPath }, null, 2));
