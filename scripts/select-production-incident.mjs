import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function selectProductionIncident(pages, title) {
  if (!title || !Array.isArray(pages) || !pages.every(Array.isArray)) {
    throw new Error('expected an incident title and complete paginated issue arrays');
  }

  let oldest = null;
  for (const issue of pages.flat()) {
    if (!issue || !Number.isSafeInteger(issue.number) || issue.number < 1 ||
        typeof issue.title !== 'string' || typeof issue.state !== 'string') {
      throw new Error('invalid issue in paginated response');
    }
    if (issue.title === title && issue.state === 'open' && !issue.pull_request) {
      oldest = oldest === null ? issue.number : Math.min(oldest, issue.number);
    }
  }
  return oldest;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    const number = selectProductionIncident(JSON.parse(readFileSync(0, 'utf8')), process.argv[2]);
    if (number !== null) process.stdout.write(`${number}\n`);
  } catch {
    process.stderr.write('[production-incident] Could not read complete paginated issue data.\n');
    process.exitCode = 1;
  }
}
