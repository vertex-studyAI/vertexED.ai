import { readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const MIGRATIONS_DIR = path.resolve('supabase/migrations');
const VERSION_RE = /^(\d{8}|\d{14})_([^/]+)\.sql$/;

function validTimestamp(version) {
  const year = Number(version.slice(0, 4));
  const month = Number(version.slice(4, 6));
  const day = Number(version.slice(6, 8));
  const hour = version.length === 14 ? Number(version.slice(8, 10)) : 0;
  const minute = version.length === 14 ? Number(version.slice(10, 12)) : 0;
  const second = version.length === 14 ? Number(version.slice(12, 14)) : 0;

  if (month < 1 || month > 12 || hour > 23 || minute > 59 || second > 59) return false;

  const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    date.getUTCHours() === hour &&
    date.getUTCMinutes() === minute &&
    date.getUTCSeconds() === second
  );
}

const files = (await readdir(MIGRATIONS_DIR)).filter((name) => name.endsWith('.sql')).sort();
const modernVersions = new Map();
const errors = [];

for (const file of files) {
  const match = file.match(VERSION_RE);
  if (!match) {
    errors.push(`${file}: migration filename must start with an 8-digit legacy date or 14-digit Supabase timestamp followed by '_'`);
    continue;
  }

  const [, version] = match;
  if (!validTimestamp(version)) {
    errors.push(`${file}: migration version '${version}' is not a valid UTC calendar date/timestamp`);
    continue;
  }

  // Legacy 8-digit migrations predate Supabase's timestamped convention and may
  // legitimately share a date. Enforce uniqueness only for modern 14-digit
  // versions, where a duplicate would collide in Supabase migration history.
  if (version.length === 14) {
    const prior = modernVersions.get(version);
    if (prior) {
      errors.push(`${file}: duplicate 14-digit Supabase migration version '${version}' already used by ${prior}`);
    } else {
      modernVersions.set(version, file);
    }
  }
}

if (errors.length > 0) {
  console.error('Supabase migration filename validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${files.length} Supabase migration filenames (${modernVersions.size} unique timestamped versions).`);
