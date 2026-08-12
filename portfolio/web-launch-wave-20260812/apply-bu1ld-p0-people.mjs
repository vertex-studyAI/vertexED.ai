#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const rootArg = process.argv[2];
if (!rootArg) {
  console.error("Usage: node apply-bu1ld-p0-people.mjs <bu1ld-landing checkout>");
  process.exit(2);
}

const root = path.resolve(rootArg);
const EXPECTED_HEAD = "daa80c1124b2a6d7d09b7669e04d29e50cffcbbe";
const actualHead = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
if (actualHead !== EXPECTED_HEAD) {
  throw new Error(`Bu1LD checkout drifted: expected ${EXPECTED_HEAD}, got ${actualHead}. Re-audit before applying.`);
}

const rel = "src/data/institution.ts";
const file = path.join(root, rel);
const before = fs.readFileSync(file, "utf8");
const placeholder = `  {
    name: "Lab contributors",
    role: "Researchers, engineers, mentors",
    bio: "Named contributors appear on project pages and the member directory once profiles are public. Roles are earned through verified contributions, not titles.",
    initials: "Φ",
  },
`;
if (!before.includes(placeholder)) {
  throw new Error("Expected generic Lab contributors card is missing; re-audit before applying.");
}
fs.writeFileSync(file, before.replace(placeholder, ""), "utf8");
console.log("Removed generic Lab contributors card from PEOPLE_PUBLIC. The people page will now show only named public people; opt-in member profiles remain in the authenticated directory.");
