const ALLOWED_STATES = new Set([
  'MERGED_TESTED',
  'REVIEW_READY',
  'EXECUTION_READY',
  'BLOCKED',
  'NEGATIVE_OR_INCONCLUSIVE',
]);

function requiredText(value, label) {
  const normalized = String(value ?? '').trim();
  if (!normalized) throw new TypeError(`${label} is required`);
  return normalized;
}

function optionalText(value) {
  return String(value ?? '').trim();
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function validateProjectRecord(record) {
  if (!record || typeof record !== 'object') throw new TypeError('record must be an object');
  const state = String(record.state ?? '').trim().toUpperCase();
  if (!ALLOWED_STATES.has(state)) {
    throw new RangeError(`state must be one of: ${[...ALLOWED_STATES].join(', ')}`);
  }
  const artifact = requiredText(record.artifact, 'artifact');
  if (!artifact.startsWith('portfolio/') && !artifact.startsWith('http://') && !artifact.startsWith('https://')) {
    throw new RangeError('artifact must be a portfolio path or explicit URL');
  }
  return {
    id: requiredText(record.id, 'id'),
    name: requiredText(record.name, 'name'),
    type: requiredText(record.type, 'type'),
    state,
    artifact,
    verdict: optionalText(record.verdict) || 'UNSPECIFIED',
    claimBoundary: requiredText(record.claimBoundary, 'claimBoundary'),
    exactHead: optionalText(record.exactHead) || null,
    ciRun: optionalText(record.ciRun) || null,
    certifiedComplete: record.certifiedComplete === true,
  };
}

export function summarizePortfolio(records) {
  if (!Array.isArray(records)) throw new TypeError('records must be an array');
  const normalized = records.map(validateProjectRecord);
  const byState = Object.fromEntries([...ALLOWED_STATES].map((state) => [state, 0]));
  let certifiedComplete = 0;
  for (const record of normalized) {
    byState[record.state] += 1;
    if (record.certifiedComplete) certifiedComplete += 1;
  }
  return {
    total: normalized.length,
    certifiedComplete,
    byState,
  };
}

export function sortProjectRecords(records) {
  const normalized = records.map(validateProjectRecord);
  const stateOrder = {
    MERGED_TESTED: 0,
    REVIEW_READY: 1,
    NEGATIVE_OR_INCONCLUSIVE: 2,
    EXECUTION_READY: 3,
    BLOCKED: 4,
  };
  return normalized.sort((left, right) =>
    stateOrder[left.state] - stateOrder[right.state] || left.id.localeCompare(right.id));
}

function artifactHref(record) {
  if (/^https?:\/\//.test(record.artifact)) return record.artifact;
  const encoded = record.artifact.split('/').map((segment) => encodeURIComponent(segment)).join('/');
  return `/${encoded}`;
}

export function renderPortfolioHtml(records, { title = 'Project 2424 — Evidence Portfolio' } = {}) {
  const sorted = sortProjectRecords(records);
  const summary = summarizePortfolio(sorted);
  const rows = sorted.map((record) => `
          <tr>
            <td><code>${escapeHtml(record.id)}</code></td>
            <td>${escapeHtml(record.name)}</td>
            <td>${escapeHtml(record.type)}</td>
            <td><span class="state">${escapeHtml(record.state)}</span></td>
            <td>${escapeHtml(record.verdict)}</td>
            <td>${escapeHtml(record.claimBoundary)}</td>
            <td><a href="${escapeHtml(artifactHref(record))}">artifact</a></td>
            <td>${record.exactHead ? `<code>${escapeHtml(record.exactHead)}</code>` : '—'}</td>
            <td>${record.ciRun ? escapeHtml(record.ciRun) : '—'}</td>
            <td>${record.certifiedComplete ? 'yes' : 'no'}</td>
          </tr>`).join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; line-height: 1.45; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #bbb; padding: .55rem; text-align: left; vertical-align: top; }
    th { background: #f4f4f4; }
    code { overflow-wrap: anywhere; }
    .summary { display: flex; flex-wrap: wrap; gap: 1rem; margin: 1rem 0 1.5rem; }
    .summary span { border: 1px solid #bbb; border-radius: .4rem; padding: .45rem .65rem; }
    .state { font-weight: 700; }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(title)}</h1>
    <p>This static view renders supplied evidence records. It does not infer completion, scientific validity, or deployment status.</p>
    <div class="summary" aria-label="Portfolio summary">
      <span>Total: <strong>${summary.total}</strong></span>
      <span>Merged/tested: <strong>${summary.byState.MERGED_TESTED}</strong></span>
      <span>Review-ready: <strong>${summary.byState.REVIEW_READY}</strong></span>
      <span>Negative/inconclusive: <strong>${summary.byState.NEGATIVE_OR_INCONCLUSIVE}</strong></span>
      <span>Certified complete: <strong>${summary.certifiedComplete}</strong></span>
    </div>
    <table>
      <caption>Evidence-backed project records</caption>
      <thead>
        <tr><th>ID</th><th>Name</th><th>Type</th><th>State</th><th>Verdict</th><th>Claim boundary</th><th>Artifact</th><th>Exact head</th><th>CI</th><th>Certified</th></tr>
      </thead>
      <tbody>${rows}
      </tbody>
    </table>
  </main>
</body>
</html>`;
}

export function renderPortfolioJson(records) {
  const sorted = sortProjectRecords(records);
  return JSON.stringify({ summary: summarizePortfolio(sorted), projects: sorted }, null, 2) + '\n';
}
