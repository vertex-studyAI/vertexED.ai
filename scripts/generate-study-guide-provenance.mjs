import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(import.meta.dirname, '..');
const corpusRoot = resolve(projectRoot, 'public/study-guides/myp');
const outputPath = resolve(corpusRoot, 'provenance-ledger.json');

const RISK_PATTERNS = [
  ['reconstructed-material', /\breconstruct(?:ed|ion)?\b/i],
  ['verbatim-claim', /\bverbatim\b/i],
  ['exact-mark-scheme-claim', /\bexact mark scheme\b/i],
  ['placeholder-content', /\bplaceholder\b|\bTBD\b|\bTODO\b/i],
  ['missing-paper-claim', /\bno (?:publicly available )?paper\b|\bpaper (?:is )?(?:not available|unavailable)\b/i],
  ['examiner-authority-claim', /\bwhat examiners (?:expect|want)\b|\bexaminer-approved\b/i],
  ['official-material-claim', /\bofficial (?:IB|MYP|exam|paper|mark scheme)\b/i],
];

async function markdownFiles(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...await markdownFiles(resolve(directory, entry.name), relativePath));
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(relativePath);
  }
  return files;
}

function contentType(relativePath) {
  if (relativePath.includes('/sessions/')) return 'session-analysis';
  if (relativePath.includes('/topics/')) return 'topic-guide';
  if (relativePath.endsWith('/question-bank.md')) return 'question-bank';
  if (relativePath.endsWith('/revision-plan.md')) return 'revision-plan';
  if (relativePath.endsWith('/command-terms.md')) return 'command-terms';
  if (relativePath.endsWith('/overview.md')) return 'overview';
  if (relativePath.endsWith('/index.md')) return 'index';
  return 'supporting-material';
}

function stableContentId(relativePath) {
  return `myp:${relativePath.replace(/\.md$/i, '').replaceAll('/', ':')}`;
}

export async function buildProvenanceLedger() {
  const files = await markdownFiles(corpusRoot);
  const entries = [];
  for (const relativePath of files) {
    const source = await readFile(resolve(corpusRoot, relativePath), 'utf8');
    const flags = RISK_PATTERNS.filter(([, pattern]) => pattern.test(source)).map(([name]) => name);
    entries.push({
      contentId: stableContentId(relativePath),
      path: `/study-guides/myp/${relativePath}`,
      contentType: contentType(relativePath),
      curriculum: {
        programme: 'IB_MYP',
        version: null,
        subject: relativePath.split('/')[0],
      },
      author: null,
      source: null,
      license: 'unknown',
      permittedUse: 'not-yet-determined',
      factualReviewer: null,
      reviewedAt: null,
      reviewDueAt: null,
      editorialStatus: flags.length ? 'quarantined' : 'unreviewed',
      publicationStatus: 'held-from-index',
      knownLimitations: [
        'Source and licensing have not been verified.',
        'Curriculum alignment and factual accuracy require qualified review.',
      ],
      riskFlags: flags,
      contentHash: `sha256:${createHash('sha256').update(source).digest('hex')}`,
    });
  }

  return {
    schemaVersion: 1,
    programme: 'IB_MYP',
    evidenceBoundary: 'Repository inventory only. Null fields remain unknown and are not inferred.',
    summary: {
      files: entries.length,
      approved: entries.filter((entry) => entry.editorialStatus === 'approved').length,
      unreviewed: entries.filter((entry) => entry.editorialStatus === 'unreviewed').length,
      quarantined: entries.filter((entry) => entry.editorialStatus === 'quarantined').length,
      heldFromIndex: entries.filter((entry) => entry.publicationStatus === 'held-from-index').length,
    },
    entries,
  };
}

async function run() {
  const ledger = await buildProvenanceLedger();
  const serialized = `${JSON.stringify(ledger, null, 2)}\n`;
  if (process.argv.includes('--check')) {
    const current = await readFile(outputPath, 'utf8').catch(() => '');
    if (current !== serialized) {
      console.error('Study-guide provenance ledger is missing or stale. Run npm run prebuild.');
      process.exitCode = 1;
    } else {
      console.log(`[content] PASS: ${ledger.summary.files} files inventoried; ${ledger.summary.approved} approved; ${ledger.summary.quarantined} flagged for review.`);
    }
  } else {
    await writeFile(outputPath, serialized, 'utf8');
    console.log(`[content] Wrote provenance ledger for ${ledger.summary.files} files; ${ledger.summary.approved} approved; ${ledger.summary.quarantined} flagged for review.`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await run();
