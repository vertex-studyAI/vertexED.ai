import { readFile } from "node:fs/promises";
import process from "node:process";

const files = [
  "src/pages/Home.tsx",
  "src/content/landing.ts",
  "src/components/landing/VertexLearningField.tsx",
];

const bannedPhrases = [
  "unlock",
  "unleash",
  "reimagine",
  "revolutionize",
  "supercharge",
  "empower",
  "elevate",
  "seamless",
  "cutting-edge",
  "next-generation",
  "game-changing",
  "future of",
  "built for the future",
  "transform the way",
  "where x meets y",
  "limitless possibilities",
  "everything you need to",
  "designed to help you",
  "not just x, but y",
  "whether you're x, y, or z",
];

const genericHeadingPatterns = [
  /^powerful tools$/i,
  /^study smarter$/i,
  /^built for students$/i,
  /^a better way to learn$/i,
  /^get started$/i,
  /^why choose us$/i,
  /^our features$/i,
  /^the future of learning$/i,
];

const placeholderPatterns = [
  { label: "lorem ipsum", regex: /lorem\s+ipsum/i },
  { label: "placeholder testimonial", regex: /(?:john|jane)\s+doe|student\s+name|customer\s+name|testimonial\s+text/i },
  {
    label: "suspicious placeholder metric",
    regex: /\b(?:99|100)%\b|\b\d{2,}\+\s+(?:users|students|schools|customers|institutions)\b/i,
  },
];

const problems = [];
const headings = new Map();

function lineNumber(source, index) {
  return source.slice(0, index).split("\n").length;
}

function report(file, source, index, rule, excerpt) {
  problems.push({
    file,
    line: lineNumber(source, index),
    rule,
    excerpt: excerpt.trim().replace(/\s+/g, " ").slice(0, 140),
  });
}

for (const file of files) {
  const source = await readFile(new URL(`../${file}`, import.meta.url), "utf8");
  const lower = source.toLowerCase();

  let cursor = source.indexOf("—");
  while (cursor !== -1) {
    report(file, source, cursor, "no-em-dash", source.slice(Math.max(0, cursor - 45), cursor + 46));
    cursor = source.indexOf("—", cursor + 1);
  }

  for (const phrase of bannedPhrases) {
    let index = lower.indexOf(phrase);
    while (index !== -1) {
      report(file, source, index, "banned-marketing-phrase", phrase);
      index = lower.indexOf(phrase, index + phrase.length);
    }
  }

  for (const pattern of placeholderPatterns) {
    const match = pattern.regex.exec(source);
    if (match) report(file, source, match.index, pattern.label, match[0]);
  }

  const headingRegex = /<h[1-6][^>]*>\s*([^<{][^<]{2,100})\s*<\/h[1-6]>/gi;
  for (const match of source.matchAll(headingRegex)) {
    const heading = match[1].replace(/\s+/g, " ").trim();
    const normalized = heading.toLowerCase();
    const entries = headings.get(normalized) ?? [];
    entries.push({ file, source, index: match.index ?? 0, heading });
    headings.set(normalized, entries);

    if (genericHeadingPatterns.some((pattern) => pattern.test(heading))) {
      report(file, source, match.index ?? 0, "generic-heading", heading);
    }
  }
}

for (const entries of headings.values()) {
  if (entries.length < 2) continue;
  for (const entry of entries) {
    report(entry.file, entry.source, entry.index, "repeated-heading", entry.heading);
  }
}

if (problems.length === 0) {
  console.log(`Copy lint passed for ${files.length} product-facing files.`);
  process.exit(0);
}

console.error(`Copy lint found ${problems.length} problem${problems.length === 1 ? "" : "s"}:`);
for (const problem of problems) {
  console.error(`${problem.file}:${problem.line} [${problem.rule}] ${problem.excerpt}`);
}
console.error("\nReview factual copy manually. This linter never rewrites claims.");
process.exit(1);
