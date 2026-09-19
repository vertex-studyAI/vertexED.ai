import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { VERTEX_AGENTS } from '../api/_lib/vertexAgents.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const EXPECTED = [
  'apexTutor',
  'plannerCoach',
  'notesArchitect',
  'quizBuilder',
  'answerReviewer',
  'paperDesigner',
  'notebookResearcher',
  'guideTutor',
  'boardResourceEditor',
  'transcriptionAssistant',
];

/** Handlers that must consume VERTEX_AGENTS profiles (board-resource intentionally excluded). */
const HANDLER_WIRING = [
  ['api/_lib/askPrompt.js', 'apexTutor'],
  ['api/_handlers/planner.js', 'plannerCoach'],
  ['api/_handlers/note.js', 'notesArchitect'],
  ['api/_handlers/quiz.js', 'quizBuilder'],
  ['api/_handlers/paper-generator.js', 'paperDesigner'],
  ['api/_handlers/notebook.js', 'notebookResearcher'],
  ['api/_handlers/study-guide-chat.js', 'guideTutor'],
  ['api/_handlers/transcribe.js', 'transcriptionAssistant'],
  ['api/_handlers/review-safe.ts', 'answerReviewer'],
];

test('VERTEX_AGENTS exposes frozen built-in study agent profiles', () => {
  assert.deepEqual(Object.keys(VERTEX_AGENTS), EXPECTED);
  assert.ok(Object.isFrozen(VERTEX_AGENTS));
  for (const profile of Object.values(VERTEX_AGENTS)) {
    assert.ok(Object.isFrozen(profile));
    assert.equal(typeof profile.name, 'string');
    assert.ok(profile.name.trim());
    assert.equal(typeof profile.capability, 'string');
    assert.ok(profile.capability.trim());
    assert.equal(typeof profile.instructions, 'string');
    assert.ok(profile.instructions.length > 40);
    assert.match(
      profile.instructions,
      /Label generated material|Never claim an official grade|Do not invent sources/i,
    );
  }
});

test('agents handler catalog ids align with VERTEX_AGENTS keys', () => {
  const handler = readFileSync(join(root, 'api/_handlers/agents.js'), 'utf8');
  for (const id of EXPECTED) {
    assert.match(handler, new RegExp(`id: '${id}'`));
  }
});

test('wired study handlers reference VERTEX_AGENTS profiles', () => {
  for (const [relativePath, profile] of HANDLER_WIRING) {
    const source = readFileSync(join(root, relativePath), 'utf8');
    assert.match(source, /VERTEX_AGENTS/, `${relativePath} must import VERTEX_AGENTS`);
    assert.match(
      source,
      new RegExp(`VERTEX_AGENTS\\.${profile}\\.instructions`),
      `${relativePath} must use VERTEX_AGENTS.${profile}.instructions`,
    );
  }
});

test('board-resource stays free of VERTEX_AGENTS (exam-prep provenance contract)', () => {
  const source = readFileSync(join(root, 'api/_handlers/board-resource.js'), 'utf8');
  assert.doesNotMatch(source, /VERTEX_AGENTS/);
});
