import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { VERTEX_AGENTS } from '../api/_lib/vertexAgents.js';

const expectedAgents = [
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

test('VertexED exposes one immutable, safety-bounded profile for every AI workflow', () => {
  assert.deepEqual(Object.keys(VERTEX_AGENTS), expectedAgents);
  assert.ok(Object.isFrozen(VERTEX_AGENTS));

  for (const profile of Object.values(VERTEX_AGENTS)) {
    assert.ok(Object.isFrozen(profile));
    assert.ok(profile.name.length >= 4);
    assert.ok(profile.capability.length >= 4);
    assert.match(profile.instructions, /Never claim an official grade, exam prediction, diagnosis/);
    assert.match(profile.instructions, /Do not invent sources/);
  }
});

test('every AI feature handler consumes its named VertexED agent profile', async () => {
  const expectedReferences = {
    '../api/_lib/askPrompt.js': ['apexTutor'],
    '../api/_handlers/planner.js': ['plannerCoach'],
    '../api/_handlers/note.js': ['notesArchitect', 'quizBuilder'],
    '../api/_handlers/quiz.js': ['quizBuilder'],
    '../api/_handlers/review-safe.ts': ['answerReviewer'],
    '../api/_handlers/paper-generator.js': ['paperDesigner'],
    '../api/_handlers/notebook.js': ['notebookResearcher'],
    '../api/_handlers/study-guide-chat.js': ['guideTutor'],
    '../api/_handlers/board-resource.js': ['boardResourceEditor'],
    '../api/_handlers/transcribe.js': ['transcriptionAssistant', 'quizBuilder'],
  };

  for (const [relativePath, profiles] of Object.entries(expectedReferences)) {
    const source = await readFile(new URL(relativePath, import.meta.url), 'utf8');
    for (const profile of profiles) {
      assert.match(source, new RegExp(`VERTEX_AGENTS\\.${profile}\\.instructions`), `${relativePath} must use ${profile}`);
    }
  }
});
