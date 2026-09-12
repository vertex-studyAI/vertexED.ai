import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const siteUrl = "https://www.vertexed.app";
const projectRoot = resolve(import.meta.dirname, "..");
const sitemapPath = resolve(projectRoot, "public/sitemap.xml");
const provenancePath = resolve(projectRoot, "public/study-guides/myp/provenance-ledger.json");
// Keep the sitemap limited to pages a search visitor can actually read. Account-only
// tools are promoted by their public resource pages rather than dead-ending crawlers
// at the login screen. Omit lastmod until each URL has an authoritative content
// revision date; stamping every URL during every build would be false freshness data.
const publicPages = [
  ["/", "weekly", "1.0"],
  ["/features", "weekly", "0.9"],
  ["/study-guides", "weekly", "0.9"],
  ["/curricula", "weekly", "0.8"],
  ["/myp", "weekly", "0.9"],
  ["/myp/eassessment", "weekly", "0.9"],
  ["/study-tools", "weekly", "0.8"],
  ["/resources", "weekly", "0.8"],
  ["/archives", "monthly", "0.7"],
  ["/archives-lnl", "monthly", "0.7"],
  ["/archives-history", "monthly", "0.7"],
  ["/archives-geography", "monthly", "0.7"],
  ["/about", "monthly", "0.5"],
  ["/vertex-ed", "monthly", "0.4"],
  ["/privacy", "yearly", "0.2"],
  ["/terms", "yearly", "0.2"],
  ["/resources/ai-study-planner", "monthly", "0.8"],
  ["/resources/ib-igcse-paper-maker", "monthly", "0.8"],
  ["/resources/notes-to-flashcards", "monthly", "0.7"],
  ["/resources/ai-answer-reviewer", "monthly", "0.7"],
  ["/resources/active-recall-spaced-repetition", "monthly", "0.7"],
  ["/resources/exam-strategy-time-management", "monthly", "0.7"],
  ["/resources/subject-guides-common-mistakes", "monthly", "0.7"],
  ["/resources/best-ai-study-tools-2025", "monthly", "0.7"],
  ["/resources/automated-note-taking-guide", "monthly", "0.7"],
  ["/resources/how-to-use-ai-for-studying", "monthly", "0.7"],
  ["/resources/ai-chatbot-tutor", "monthly", "0.7"],
  ["/resources/ib-math-aa-ai-guide", "monthly", "0.8"],
  ["/resources/igcse-science-revision", "monthly", "0.8"],
  ["/resources/essay-writing-with-ai", "monthly", "0.7"],
  ["/resources/alevel-ap-exam-prep", "monthly", "0.7"],
  ["/resources/is-using-ai-cheating", "monthly", "0.6"],
  ["/resources/how-to-cram-effectively", "monthly", "0.7"],
  ["/resources/ib-tok-guide-ai", "monthly", "0.7"],
  ["/resources/ib-myp-humanities-guide", "monthly", "0.8"],
  ["/resources/best-ai-prompts-for-students", "monthly", "0.7"],
  ["/resources/academic-burnout-guide", "monthly", "0.6"],
  ["/resources/how-to-memorize-anything-fast", "monthly", "0.7"],
  ["/resources/college-essays-with-ai", "monthly", "0.6"],
];

const curriculumSlugs = ["ib-myp", "ib-dp", "igcse", "gcse", "a-level", "ap", "cbse", "icse"];
const featureSlugs = ["study-planner", "study-zone", "paper-maker", "answer-reviewer", "ai-notes", "ai-tutor"];
const curriculumFeaturePages = curriculumSlugs.flatMap((curriculum) => featureSlugs.map((feature) => [
  `/curricula/${curriculum}/${feature}`,
  "monthly",
  "0.75",
]));

const provenance = JSON.parse(await readFile(provenancePath, "utf8"));
const approvedGuidePages = provenance.entries
  .filter((entry) => (
    entry.editorialStatus === "approved"
    && entry.publicationStatus === "published"
    && entry.license !== "unknown"
    && entry.source
    && entry.factualReviewer
    && entry.reviewedAt
  ))
  .map((entry) => [entry.path.replace(/\.md$/i, ""), "monthly", "0.65"]);

// Detailed guide pages remain readable, but enter discovery only when their
// deterministic provenance record contains approval, source, licensing and
// reviewer evidence. The public library index remains discoverable.
const urls = [...publicPages, ...curriculumFeaturePages, ...approvedGuidePages];
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map(([path, changefreq, priority]) => [
    "  <url>",
    `    <loc>${siteUrl}${path}</loc>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].join("\n")),
  "</urlset>",
  "",
].join("\n");

await writeFile(sitemapPath, xml, "utf8");
console.log(`Generated ${urls.length} public sitemap URLs, including ${curriculumFeaturePages.length} curriculum-tool URLs and ${approvedGuidePages.length} editorially approved guide URLs.`);
