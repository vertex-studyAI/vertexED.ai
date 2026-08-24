import fs from 'node:fs';

function usage() {
  console.error('Usage: node report.mjs <result.json> [--out report.md]');
  process.exit(2);
}

const args = process.argv.slice(2);
if (args.length < 1) usage();
const inputPath = args[0];
let outPath = null;
for (let i = 1; i < args.length; i += 1) {
  if (args[i] === '--out' && i + 1 < args.length) {
    outPath = args[++i];
  } else {
    usage();
  }
}

const payload = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
if (typeof payload.experiment !== 'string' || !payload.experiment.includes('T2424-0053')) {
  throw new Error('input is not a T2424-0053 minimum-experiment result');
}
if (!payload.result || !Array.isArray(payload.result.motifs)) throw new Error('missing motif result');

const motifs = payload.result.motifs;
const motifRows = motifs.length
  ? motifs.map((motif, index) =>
      `| ${index + 1} | ${motif.signature} | ${motif.support} | ${motif.coverage} | ${JSON.stringify(motif.positions)} |`
    ).join('\n')
  : '| — | — | — | — | — |';

const top = payload.result.topMotif;
const md = `# T2424-0053 — Machine-Generated Minimum-Experiment Report

> Generated from \`${inputPath}\`. Scientific values should be regenerated from machine output rather than hand-edited.

## Claim boundary

${payload.claimBoundary ?? 'No claim boundary recorded.'}

## Protocol/options

\`\`\`json
${JSON.stringify(payload.options ?? {}, null, 2)}
\`\`\`

## Dictionary summary

| Metric | Value |
|---|---:|
| observations | ${payload.result.observations} |
| motif count | ${payload.result.motifCount} |
| top motif signature | ${top?.signature ?? 'none'} |
| top motif support | ${top?.support ?? 0} |
| top motif coverage | ${top?.coverage ?? 0} |

## Motifs

| Rank | Signature | Support | Coverage | Positions |
|---:|---|---:|---:|---|
${motifRows}

## Interpretation boundary

This report demonstrates only the deterministic normalized-shape indexing mechanics exercised by the minimum synthetic series. Repeated signatures are not evidence of scientific meaning, causality, domain validity, novelty, or state-of-the-art motif discovery.

The next evidence gate remains a separately frozen public scientific time-series evaluation with predeclared targets or external protocol, simple Euclidean/SAX-style baselines, sensitivity analysis, and independent reproduction.
`;

if (outPath) {
  fs.writeFileSync(outPath, md, 'utf8');
} else {
  process.stdout.write(md);
}
