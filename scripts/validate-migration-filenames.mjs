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
const versions = new Map();
const errors = [];

for (const file of files) {
  const match = file.match(VERSION_RE);
  if (!match) {
    errors.push(`${file}: migration filename must start with an 8-digit legacy date or 14-digit Supabase timestamp followed by '_'`);
    continue;
  }

  const [, version, description] = match;
  if (!validTimestamp(version)) {
    errors.push(`${file}: migration version '${version}' is not a valid UTC calendar date/timestamp`);
  }
  if (!/^[a-z0-9][a-z0-9_]*$/.test(description)) {
    errors.push(`${file}: migration description must use lowercase snake_case`);
  }

  const prior = versions.get(version);
  if (prior) {
    errors.push(`${file}: duplicate migration version '${version}' already used by ${prior}`);
  } else {
    versions.set(version, file);
  }
}

if (errors.length > 0) {
  console.error('Supabase migration filename validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${files.length} Supabase migration filenames (${versions.size} unique versions).`);
