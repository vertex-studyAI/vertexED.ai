#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const viteCli = resolve('node_modules/vite/bin/vite.js');
const result = spawnSync(process.execPath, [viteCli, 'build'], {
  env: { ...process.env, ROLLUP_SKIP_NODEJS_NATIVE: 'true' },
  stdio: 'inherit',
});

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
