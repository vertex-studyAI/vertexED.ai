/** Evidence-only local diagnosis. No AI call, private profile, or predicted paper. */
export function diagnoseExamEvidence(entries, subject, board) {
  const groups = new Map();
  const boardKey = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const entry of entries) {
    if (board && boardKey(entry.board) !== boardKey(board)) continue;
    if (entry.subject !== subject || !Number.isFinite(entry.score) || !Number.isFinite(entry.maxScore)
      || entry.maxScore <= 0 || entry.score < 0 || entry.score > entry.maxScore) continue;
    const group = groups.get(entry.topic) || { topic: entry.topic, score: 0, total: 0, attempts: 0 };
    group.score += entry.score; group.total += entry.maxScore; group.attempts += 1;
    groups.set(entry.topic, group);
  }
  return [...groups.values()].map(group => ({ ...group, percent: Math.round(group.score / group.total * 100),
    next: /partial fraction/i.test(group.topic) ? 'Repair coefficient matching, then retry integration with rational functions.'
      : /essay|history|argument/i.test(group.topic) ? 'Connect one precise piece of evidence to your claim, explain its significance and qualify the conclusion.'
      : 'Locate the first missed step, practise it alone, then retry in a new context.',
  })).sort((a, b) => a.percent - b.percent);
}
