import { buildPilotAggregateExport, normalizePilotSession, removePilotParticipant } from '../../../src/lib/pilotAnalyticsCore.mjs';
import { makeExampleRecords, metadata } from './fixture.mjs';

let records = makeExampleRecords();
let missing = false;
let withdrawn = false;
let aggregate;
const byId = (id) => document.getElementById(id);

function reviewAction(record, accepted) {
  if (!record.consent_opt_in) return 'Exclude: no opt-in.';
  if (record.pre_assessment?.score === '' || record.pre_assessment?.score === null) return 'Repair the source: no measured score.';
  if (!accepted) return 'Repair the source: invalid calendar date.';
  if (!record.completion_flag) return 'Keep the retry incomplete. No post-score was observed.';
  return 'Read as a descriptive paired attempt.';
}

function render(message) {
  aggregate = buildPilotAggregateExport(records, metadata);
  const tbody = byId('record-rows');
  tbody.replaceChildren();
  for (const record of records) {
    const accepted = normalizePilotSession(record) !== null;
    const row = document.createElement('tr');
    const score = record.pre_assessment.score;
    const values = [
      `${record.participant_id.replace('example_', '')} / ${record.session_id}`,
      score === '' || score === null ? 'Missing' : `${score} / ${record.pre_assessment.max}`,
      accepted ? (record.completion_flag ? 'Accepted' : 'Incomplete') : 'Rejected',
      reviewAction(record, accepted),
    ];
    for (const value of values) {
      const td = document.createElement('td');
      td.textContent = value;
      row.append(td);
    }
    tbody.append(row);
  }
  byId('accepted').textContent = String(aggregate.metadata.accepted_session_count);
  byId('rejected').textContent = String(aggregate.metadata.rejected_record_count);
  byId('incomplete').textContent = String(aggregate.aggregate.missing_or_incomplete_session_count);
  byId('decision').textContent = withdrawn
    ? 'Example A was removed before recomputing the summary. Its incomplete retry is no longer in this dataset.'
    : 'Example A has an incomplete retry. A reviewer can identify the missing observation without treating it as a zero or a completed attempt.';
  byId('missing').textContent = missing ? 'Restore measured zero' : 'Replace measured zero with missing';
  byId('missing').disabled = withdrawn;
  byId('withdraw').disabled = withdrawn;
  byId('json').textContent = JSON.stringify(aggregate, null, 2);
  byId('status').textContent = message;
}

byId('missing').addEventListener('click', () => {
  missing = !missing;
  records.find((record) => record.session_id === 'attempt-01').pre_assessment.score = missing ? null : 0;
  render(missing ? 'Example A: the missing pre-score rejects this record.' : 'Example A: the measured zero is accepted again.');
});
byId('withdraw').addEventListener('click', () => {
  const result = removePilotParticipant(records, 'example_A');
  records = result.records;
  withdrawn = true;
  render(`Removed ${result.removed_record_count} example A records and recomputed the aggregate.`);
});
byId('reset').addEventListener('click', () => {
  records = makeExampleRecords();
  missing = false;
  withdrawn = false;
  render('Six constructed records restored. Three are accepted and three rejected.');
});
byId('download').addEventListener('click', () => {
  const blob = new Blob([`${JSON.stringify(aggregate, null, 2)}\n`], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'vertexed-constructed-aggregate.json';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  byId('status').textContent = 'Downloaded the constructed aggregate. Participant and session rows are excluded.';
});
render('Six constructed records. Three are accepted and three rejected.');
