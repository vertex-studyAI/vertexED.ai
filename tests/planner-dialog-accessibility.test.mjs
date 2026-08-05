import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const planner = fs.readFileSync('src/features/study-calendar/PlannerView.tsx', 'utf8');
const modal = fs.readFileSync('src/components/AccessibleModal.tsx', 'utf8');

test('planner AI and edit surfaces use the accessible modal primitive', () => {
  assert.equal((planner.match(/<AccessibleModal/g) || []).length, 2);
  assert.match(planner, /titleId="planner-ai-dialog-title"/);
  assert.match(planner, /descriptionId="planner-ai-dialog-description"/);
  assert.match(planner, /initialFocusRef=\{aiInputRef\}/);
  assert.match(planner, /titleId="planner-edit-dialog-title"/);
  assert.match(planner, /descriptionId="planner-edit-dialog-description"/);
  assert.match(planner, /initialFocusRef=\{editNameRef\}/);
  assert.match(planner, /aria-label="Close add task dialog"/);
  assert.match(planner, /aria-label="Close edit task dialog"/);
});

test('accessible modal exposes required semantics and keyboard handling', () => {
  assert.match(modal, /role="dialog"/);
  assert.match(modal, /aria-modal="true"/);
  assert.match(modal, /aria-labelledby=\{titleId\}/);
  assert.match(modal, /aria-describedby=\{descriptionId\}/);
  assert.match(modal, /event\.key === "Escape"/);
  assert.match(modal, /trapModalFocus\(event, dialogRef\.current\)/);
  assert.match(modal, /restoreModalFocus\(returnTarget\)/);
});
