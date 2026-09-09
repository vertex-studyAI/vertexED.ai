import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = fs.readFileSync('src/pages/StudyGuides.tsx', 'utf8');
const styles = fs.readFileSync('src/index.css', 'utf8');

test('public study guides do not pretend browser-side access control is secure', () => {
  assert.match(source, /isAccessibleForFree: true/);
  assert.doesNotMatch(source, /GUIDE_PASSWORD|GUIDE_ACCESS_KEY|sessionStorage/);
  assert.doesNotMatch(source, /type="password"|access password|GuideAccessPrompt/i);
  assert.doesNotMatch(styles, /study-guides-(?:paywall|preview-blur|access-form)/);
});

test('the complete guide reader and navigation remain available', () => {
  assert.match(source, /fetch\("\/study-guides\/myp\/manifest\.json"/);
  assert.match(source, /fetch\("\/study-guides\/myp\/provenance-ledger\.json"/);
  assert.match(source, /<RichMarkdown className="study-guides-markdown">\{content\}<\/RichMarkdown>/);
  assert.match(source, /className="study-guides-search"/);
  assert.match(source, /className="study-guides-page-list"/);
});

test('study guides do not present the imported corpus as official or verified marking evidence', () => {
  assert.match(source, /not an official IB publication or verified mark scheme/i);
  assert.match(source, /Verify exact questions, marks, syllabus details/i);
  assert.doesNotMatch(source, /Complete MYP study guides/);
  assert.match(source, /Held for editorial review/);
});

test('unverified detailed guides are noindex and invalid paths fail explicitly', () => {
  assert.match(source, /routeParts\.length === 0 \? "index, follow" : "noindex, follow"/);
  assert.match(source, /Guide page not found/);
  assert.match(source, /requestedPage && !requestedPageEntry/);
});
