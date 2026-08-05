#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const targetRoot = resolve(process.argv[2] || 'target');

async function read(path) {
  return readFile(resolve(targetRoot, path), 'utf8');
}

async function write(path, content) {
  const absolute = resolve(targetRoot, path);
  await mkdir(dirname(absolute), { recursive: true });
  await writeFile(absolute, content, 'utf8');
}

function replaceOnce(source, needle, replacement, label) {
  const first = source.indexOf(needle);
  if (first === -1) throw new Error(`${label}: expected source anchor was not found`);
  if (source.indexOf(needle, first + needle.length) !== -1) {
    throw new Error(`${label}: expected source anchor was not unique`);
  }
  return `${source.slice(0, first)}${replacement}${source.slice(first + needle.length)}`;
}

const vitePath = 'vite.config.ts';
let vite = await read(vitePath);
vite = replaceOnce(
  vite,
  'import { defineConfig } from "@lovable.dev/vite-tanstack-config";\n',
  `import { defineConfig } from "@lovable.dev/vite-tanstack-config";\nimport type { Plugin } from "vite";\n\nconst rawBuildCommit =\n  process.env.BU1LD_BUILD_COMMIT ??\n  process.env.CF_PAGES_COMMIT_SHA ??\n  process.env.GITHUB_SHA ??\n  "unknown";\nconst buildCommit = /^[0-9a-f]{7,40}$/i.test(rawBuildCommit)\n  ? rawBuildCommit.toLowerCase()\n  : "unknown";\n\nfunction buildIdentityPlugin(): Plugin {\n  return {\n    name: "bu1ld-build-identity",\n    generateBundle() {\n      this.emitFile({\n        type: "asset",\n        fileName: "build.json",\n        source: \`${'${JSON.stringify({ service: "bu1ld", commit: buildCommit })}'}\\n\`,\n      });\n    },\n  };\n}\n`,
  'vite imports',
);
vite = replaceOnce(
  vite,
  '  vite: {\n    build: {',
  `  vite: {\n    define: {\n      __BU1LD_BUILD_COMMIT__: JSON.stringify(buildCommit),\n    },\n    plugins: [buildIdentityPlugin()],\n    build: {`,
  'vite build configuration',
);
await write(vitePath, vite);

await write('src/build.d.ts', 'declare const __BU1LD_BUILD_COMMIT__: string;\n');

await write(
  'src/lib/build-identity.ts',
  `export function normalizeBuildCommit(value: unknown): string {\n  if (typeof value !== "string") return "unknown";\n  const normalized = value.trim().toLowerCase();\n  return /^[0-9a-f]{7,40}$/.test(normalized) ? normalized : "unknown";\n}\n\nexport const BUILD_COMMIT = normalizeBuildCommit(\n  typeof __BU1LD_BUILD_COMMIT__ === "undefined"\n    ? "unknown"\n    : __BU1LD_BUILD_COMMIT__,\n);\n\nexport const BUILD_IDENTITY = Object.freeze({\n  service: "bu1ld",\n  commit: BUILD_COMMIT,\n});\n`,
);

await write(
  'src/lib/build-identity.test.ts',
  `import { describe, expect, test } from "bun:test";\nimport { BUILD_COMMIT, BUILD_IDENTITY, normalizeBuildCommit } from "./build-identity";\n\ndescribe("build identity", () => {\n  test("normalizes Git commit identifiers", () => {\n    expect(normalizeBuildCommit("ABCDEF1234567")).toBe("abcdef1234567");\n    expect(normalizeBuildCommit(" 0123456789abcdef0123456789abcdef01234567 ")).toBe(\n      "0123456789abcdef0123456789abcdef01234567",\n    );\n  });\n\n  test("rejects untrusted or missing values", () => {\n    expect(normalizeBuildCommit(undefined)).toBe("unknown");\n    expect(normalizeBuildCommit("branch/main")).toBe("unknown");\n    expect(normalizeBuildCommit("abc123")).toBe("unknown");\n  });\n\n  test("exports a stable public identity without secrets", () => {\n    expect(BUILD_COMMIT).toBe("unknown");\n    expect(BUILD_IDENTITY).toEqual({ service: "bu1ld", commit: "unknown" });\n  });\n});\n`,
);

const rootPath = 'src/routes/__root.tsx';
let root = await read(rootPath);
root = replaceOnce(
  root,
  'import { trackPageView } from "@/lib/analytics";\n',
  'import { trackPageView } from "@/lib/analytics";\nimport { BUILD_COMMIT, BUILD_IDENTITY } from "@/lib/build-identity";\n',
  'root build identity import',
);
root = replaceOnce(
  root,
  '      { name: "theme-color", content: "#0a0a0b" },\n',
  '      { name: "theme-color", content: "#0a0a0b" },\n      { name: "bu1ld-build", content: BUILD_COMMIT },\n',
  'root build meta',
);
root = replaceOnce(
  root,
  'function RootShell({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang="en">',
  'function RootShell({ children }: { children: React.ReactNode }) {\n  const buildIdentityJson = JSON.stringify(BUILD_IDENTITY);\n\n  return (\n    <html lang="en" data-bu1ld-build={BUILD_COMMIT}>',
  'root html marker',
);
root = replaceOnce(
  root,
  '        <HeadContent />\n',
  '        <script\n          type="application/json"\n          id="bu1ld-build-identity"\n          dangerouslySetInnerHTML={{ __html: buildIdentityJson }}\n        />\n        <HeadContent />\n',
  'root inline build identity',
);
await write(rootPath, root);

console.log(`Applied Bu1LD build identity recovery to ${targetRoot}`);
