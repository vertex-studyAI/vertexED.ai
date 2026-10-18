import { readFile } from "node:fs/promises";

const sourceUrl = new URL("../src/content/founderPortfolio.ts", import.meta.url);
const source = await readFile(sourceUrl, "utf8");
const marker = 'href: "';
const urls = source.split("\n").flatMap((line) => {
  const start = line.indexOf(marker);
  if (start < 0) return [];
  const valueStart = start + marker.length;
  return [line.slice(valueStart, line.indexOf('"', valueStart))];
}).filter((url) => url.startsWith("https://"));

if (urls.length !== 20) {
  throw new Error(`Expected 20 founder project URLs, found ${urls.length}.`);
}

const results = await Promise.all(urls.map(async (url) => {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": "VertexED project-link audit" },
      signal: AbortSignal.timeout(15_000),
    });
    return { url, status: response.status, ok: response.ok };
  } catch (error) {
    return {
      url,
      status: "ERROR",
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}));

const failures = results.filter((result) => !result.ok);
console.log(JSON.stringify({
  checkedAt: new Date().toISOString(),
  checked: results.length,
  passed: results.length - failures.length,
  failures,
}, null, 2));

if (failures.length) process.exitCode = 1;
