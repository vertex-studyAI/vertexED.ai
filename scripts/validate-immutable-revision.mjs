#!/usr/bin/env node

import { normalizeImmutableGitSha } from './immutable-revision.mjs';

const candidate = process.argv[2] ?? '';
const revision = normalizeImmutableGitSha(candidate);

if (!revision) {
  console.error('[revision] expected an exact 40-character Git SHA');
  process.exit(1);
}

process.stdout.write(revision);
