import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const studyGallery = fs.readFileSync('src/components/landing/StudyGallery.tsx', 'utf8');
const home = fs.readFileSync('src/pages/Home.tsx', 'utf8');
const toolGallery = fs.readFileSync('src/components/landing/ToolGallery.tsx', 'utf8');

test('landing study example dialog exposes description and initial focus', () => {
  assert.match(studyGallery, /descriptionId="study-example-description"/);
  assert.match(studyGallery, /initialFocusRef=\{workingRef\}/);
  assert.match(studyGallery, /id="study-example-description"/);
  assert.match(studyGallery, /ref=\{workingRef\}/);
});

test('vertex home concept lens dialog exposes an accessible description', () => {
  assert.match(home, /descriptionId="concept-lens-dialog-description"/);
  assert.match(home, /id="concept-lens-dialog-description"/);
});

test('landing tool detail dialog keeps description wiring for parity', () => {
  assert.match(toolGallery, /descriptionId="tool-detail-description"/);
  assert.match(toolGallery, /id="tool-detail-description"/);
});
