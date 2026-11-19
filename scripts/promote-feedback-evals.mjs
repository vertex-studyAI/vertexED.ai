import fs from 'node:fs';
import path from 'node:path';
import { promoteFeedbackReview } from './lib/feedback-eval-promotion.mjs';

const reviewDir = 'evals/feedback-reviews';
const outputPath = 'evals/regressions/from-feedback.json';
const reviews = fs.readdirSync(reviewDir)
  .filter(name => name.endsWith('.review.json'))
  .sort()
  .map(name => JSON.parse(fs.readFileSync(path.join(reviewDir, name), 'utf8')));
const output = `${JSON.stringify({ contractVersion: 'vertexed.feedback-regression-catalog.v1', fixtures: reviews.map(promoteFeedbackReview) }, null, 2)}\n`;

if (process.argv.includes('--check')) {
  if (!fs.existsSync(outputPath) || fs.readFileSync(outputPath, 'utf8') !== output) {
    throw new Error(`Feedback regression catalogue is stale. Run: npm run eval:feedback:write`);
  }
  console.log(`Verified ${reviews.length} privacy-reviewed feedback regression fixture(s).`);
} else {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);
  console.log(`Wrote ${reviews.length} privacy-reviewed feedback regression fixture(s).`);
}
