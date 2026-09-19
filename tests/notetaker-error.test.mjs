import test from 'node:test';
import assert from 'node:assert/strict';
import { notetakerError } from '../src/lib/notetakerError.mjs';

test('sanitizes auth failures', () => {
  assert.match(notetakerError(new Error('401 unauthorized')), /Sign in again/);
});

test('sanitizes rate limits', () => {
  assert.match(notetakerError('429 Too Many Requests'), /Too many study requests/);
});

test('sanitizes network failures', () => {
  assert.match(notetakerError(new Error('fetch failed')), /could not reach the study service/i);
});

test('uses action-specific fallbacks', () => {
  assert.match(notetakerError(new Error('boom'), 'save'), /Could not save/);
  assert.match(notetakerError(new Error('boom'), 'quiz'), /Could not generate the quiz/);
  assert.match(notetakerError(new Error('boom'), 'grade'), /Could not grade/);
  assert.match(notetakerError(new Error('boom'), 'flashcards'), /Could not generate flashcards/);
});

test('never echoes raw server payloads', () => {
  const raw = 'ECONNREFUSED 127.0.0.1:5432 password=secret';
  const out = notetakerError(raw, 'generate');
  assert.doesNotMatch(out, /password|5432|ECONNREFUSED/);
  assert.match(out, /Could not complete this study request/);
});
