import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const boundary = fs.readFileSync('src/components/RouteErrorBoundary.tsx', 'utf8');
const layout = fs.readFileSync('src/components/layout/SiteLayout.tsx', 'utf8');

test('route failures report only through the privacy-safe monitoring boundary', () => {
  assert.match(boundary, /reportClientError\(error,/);
  assert.doesNotMatch(boundary, /console\.error/);
  assert.match(boundary, /componentStack: info\.componentStack/);
});

test('route failures move focus to a useful recovery heading', () => {
  assert.match(boundary, /headingRef = React\.createRef<HTMLHeadingElement>/);
  assert.match(boundary, /headingRef\.current\?\.focus\(\{ preventScroll: true \}\)/);
  assert.match(boundary, /role="alert"/);
  assert.match(boundary, /aria-labelledby="route-error-title"/);
  assert.match(boundary, /aria-describedby="route-error-description"/);
  assert.match(boundary, /id="route-error-title"/);
  assert.match(boundary, /id="route-error-description"/);
  assert.match(boundary, /<h2[\s\S]*ref=\{this\.headingRef\}[\s\S]*tabIndex=\{-1\}/);
  assert.match(boundary, /Your saved work has not been changed/);
});

test('navigating away from a failed route resets the latched route boundary', () => {
  assert.match(boundary, /previousProps\.resetKey !== this\.props\.resetKey/);
  assert.match(boundary, /this\.setState\(\{ hasError: false \}\)/);
  assert.match(layout, /<RouteErrorBoundary resetKey=\{`\$\{location\.pathname\}\$\{location\.search\}\$\{location\.hash\}`\}>/);
});
