import { createHash } from 'node:crypto';

const ALLOWED_STATES = new Set(['PENDING', 'RUNNING', 'DONE', 'FAILED', 'BLOCKED']);
const GENESIS_HASH = '0'.repeat(64);

function requiredText(value, label) {
  const normalized = String(value ?? '').trim();
  if (!normalized) throw new TypeError(`${label} is required`);
  return normalized;
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}

export function canonicalJson(value) {
  return JSON.stringify(stableValue(value));
}

export function sha256(value) {
  return createHash('sha256').update(String(value)).digest('hex');
}

export function appendEvidenceRecord(journalInput, recordInput) {
  const journal = Array.isArray(journalInput) ? journalInput.map((entry) => ({ ...entry })) : [];
  if (!recordInput || typeof recordInput !== 'object') throw new TypeError('record must be an object');
  const state = requiredText(recordInput.state, 'state').toUpperCase();
  if (!ALLOWED_STATES.has(state)) throw new RangeError('state must be PENDING, RUNNING, DONE, FAILED, or BLOCKED');
  const sequence = journal.length + 1;
  const previousHash = journal.length === 0 ? GENESIS_HASH : requiredText(journal.at(-1).hash, 'previous journal hash');
  const payload = {
    sequence,
    taskId: requiredText(recordInput.taskId, 'taskId'),
    owner: requiredText(recordInput.owner, 'owner'),
    state,
    evidenceDigest: requiredText(recordInput.evidenceDigest, 'evidenceDigest'),
  };
  const hash = sha256(`${previousHash}\n${canonicalJson(payload)}`);
  return [...journal, { ...payload, previousHash, hash }];
}

export function verifyEvidenceJournal(journalInput) {
  if (!Array.isArray(journalInput)) throw new TypeError('journal must be an array');
  let previousHash = GENESIS_HASH;
  for (let index = 0; index < journalInput.length; index += 1) {
    const entry = journalInput[index];
    if (!entry || typeof entry !== 'object') return { valid: false, index, reason: 'MALFORMED_ENTRY' };
    const payload = {
      sequence: entry.sequence,
      taskId: entry.taskId,
      owner: entry.owner,
      state: entry.state,
      evidenceDigest: entry.evidenceDigest,
    };
    if (entry.sequence !== index + 1) return { valid: false, index, reason: 'SEQUENCE_MISMATCH' };
    if (entry.previousHash !== previousHash) return { valid: false, index, reason: 'PREVIOUS_HASH_MISMATCH' };
    const expectedHash = sha256(`${previousHash}\n${canonicalJson(payload)}`);
    if (entry.hash !== expectedHash) return { valid: false, index, reason: 'HASH_MISMATCH' };
    previousHash = entry.hash;
  }
  return { valid: true, entries: journalInput.length, headHash: previousHash };
}

export function acquireTaskOwnership(ownershipInput, taskIdInput, ownerInput, tokenInput) {
  const ownership = { ...(ownershipInput ?? {}) };
  const taskId = requiredText(taskIdInput, 'taskId');
  const owner = requiredText(ownerInput, 'owner');
  const token = requiredText(tokenInput, 'token');
  const current = ownership[taskId];
  if (current && (current.owner !== owner || current.token !== token)) {
    return { acquired: false, reason: 'OWNED_BY_OTHER', ownership };
  }
  ownership[taskId] = { owner, token };
  return { acquired: true, ownership };
}

export function releaseTaskOwnership(ownershipInput, taskIdInput, ownerInput, tokenInput) {
  const ownership = { ...(ownershipInput ?? {}) };
  const taskId = requiredText(taskIdInput, 'taskId');
  const owner = requiredText(ownerInput, 'owner');
  const token = requiredText(tokenInput, 'token');
  const current = ownership[taskId];
  if (!current) return { released: false, reason: 'NOT_OWNED', ownership };
  if (current.owner !== owner || current.token !== token) {
    return { released: false, reason: 'OWNERSHIP_MISMATCH', ownership };
  }
  delete ownership[taskId];
  return { released: true, ownership };
}

export function recoverTaskStates(journalInput) {
  const verification = verifyEvidenceJournal(journalInput);
  if (!verification.valid) throw new Error(`invalid evidence journal at index ${verification.index}: ${verification.reason}`);
  const states = {};
  for (const entry of journalInput) {
    states[entry.taskId] = {
      state: entry.state,
      owner: entry.owner,
      evidenceDigest: entry.evidenceDigest,
      sequence: entry.sequence,
      hash: entry.hash,
    };
  }
  return states;
}

export function snapshotFoundryState({ journal = [], ownership = {} } = {}) {
  const verification = verifyEvidenceJournal(journal);
  if (!verification.valid) throw new Error(`cannot snapshot invalid journal: ${verification.reason}`);
  return canonicalJson({ version: 1, journal, ownership });
}

export function restoreFoundryState(snapshotText) {
  const parsed = JSON.parse(requiredText(snapshotText, 'snapshot'));
  if (parsed.version !== 1) throw new Error('unsupported snapshot version');
  const journal = Array.isArray(parsed.journal) ? parsed.journal : [];
  const ownership = parsed.ownership && typeof parsed.ownership === 'object' && !Array.isArray(parsed.ownership)
    ? parsed.ownership
    : {};
  const verification = verifyEvidenceJournal(journal);
  if (!verification.valid) throw new Error(`invalid evidence journal at index ${verification.index}: ${verification.reason}`);
  return { journal, ownership, recoveredStates: recoverTaskStates(journal) };
}
