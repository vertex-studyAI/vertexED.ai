import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PUBLIC_INTAKE_ROUTES } from "../src/lib/intakeRoutes.mjs";

const layout = await readFile(new URL("../src/components/layout/SiteLayout.tsx", import.meta.url), "utf8");
const securityTxt = await readFile(new URL("../public/.well-known/security.txt", import.meta.url), "utf8");

test("public launch intake routes stay bound to the published forms", () => {
  assert.equal(PUBLIC_INTAKE_ROUTES.support, "https://tally.so/r/XxXBpj?utm_source=footer");
  assert.equal(PUBLIC_INTAKE_ROUTES.privacyRequest, "https://tally.so/r/b5P4E1?utm_source=footer");
  assert.equal(PUBLIC_INTAKE_ROUTES.security, "https://tally.so/r/A7ZbOe?utm_source=footer");
  assert.equal(PUBLIC_INTAKE_ROUTES.schoolPilot, "https://tally.so/r/WOypkk?utm_source=footer");
});

test("footer exposes trust and support intakes without replacing the privacy policy", () => {
  assert.match(layout, /to="\/privacy"[^>]*>Privacy<\/Link>/);
  assert.match(layout, /PUBLIC_INTAKE_ROUTES\.support[^>]*>Support<\/a>/);
  assert.match(layout, /PUBLIC_INTAKE_ROUTES\.privacyRequest[^>]*>Privacy request<\/a>/);
  assert.match(layout, /PUBLIC_INTAKE_ROUTES\.security[^>]*>Security<\/a>/);
  assert.match(layout, /PUBLIC_INTAKE_ROUTES\.schoolPilot[^>]*>School pilot<\/a>/);
});

test("security.txt publishes only the dedicated disclosure route and bounded metadata", () => {
  assert.match(securityTxt, /^Contact: https:\/\/tally\.so\/r\/A7ZbOe\?utm_source=security_txt$/m);
  assert.match(securityTxt, /^Canonical: https:\/\/www\.vertexed\.app\/\.well-known\/security\.txt$/m);
  assert.match(securityTxt, /^Preferred-Languages: en$/m);
  assert.match(securityTxt, /^Expires: 2027-09-26T00:00:00\.000Z$/m);
  assert.doesNotMatch(securityTxt, /mailto:|password|token|secret/i);
});
