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
