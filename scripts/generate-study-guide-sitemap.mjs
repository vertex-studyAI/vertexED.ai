import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const siteUrl = "https://www.vertexed.app";
const projectRoot = resolve(import.meta.dirname, "..");
const manifestPath = resolve(projectRoot, "public/study-guides/myp/manifest.json");
const sitemapPath = resolve(projectRoot, "public/sitemap.xml");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const lastmod = new Date().toISOString().slice(0, 10);

// Keep the sitemap limited to pages a search visitor can actually read. Account-only
// tools are promoted by their public resource pages rather than dead-ending crawlers
// at the login screen.
const publicPages = [
  ["/", "weekly", "1.0"],
  ["/features", "weekly", "0.9"],
  ["/study-guides", "weekly", "0.9"],
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
  ["/resources/best-ai-prompts-for-students", "monthly", "0.7"],
  ["/resources/academic-burnout-guide", "monthly", "0.6"],
  ["/resources/how-to-memorize-anything-fast", "monthly", "0.7"],
  ["/resources/college-essays-with-ai", "monthly", "0.6"],
];

const guidePath = (subject, page) => {
  const pathname = page.relativePath
    .replace(/\.md$/i, "")
    .split("/")
    .map((part) => encodeURIComponent(part.toLowerCase()))
    .join("/");
  return `/study-guides/myp/${subject.slug}/${pathname}`;
};

const guidePages = manifest.subjects.flatMap((subject) => [
  [`/study-guides/myp/${subject.slug}`, "monthly", "0.8"],
  ...subject.pages.map((page) => [guidePath(subject, page), "monthly", "0.7"]),
]);

const curriculumSlugs = ["ib-myp", "ib-dp", "igcse", "gcse", "a-level", "ap", "cbse", "icse"];
const featureSlugs = ["study-planner", "study-zone", "paper-maker", "answer-reviewer", "ai-notes", "ai-tutor"];
const curriculumFeaturePages = curriculumSlugs.flatMap((curriculum) => featureSlugs.map((feature) => [
  `/curricula/${curriculum}/${feature}`,
  "monthly",
  "0.75",
]));

const urls = [...publicPages, ...curriculumFeaturePages, ...guidePages];
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map(([path, changefreq, priority]) => [
    "  <url>",
    `    <loc>${siteUrl}${path}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].join("\n")),
  "</urlset>",
  "",
].join("\n");

await writeFile(sitemapPath, xml, "utf8");
console.log(`Generated ${urls.length} public sitemap URLs, including ${guidePages.length} MYP guide URLs and ${curriculumFeaturePages.length} curriculum-tool URLs.`);
