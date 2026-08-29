import test from "node:test";
import assert from "node:assert/strict";
import { validateImages } from "../api/_handlers/paper-generator.js";

const png = Buffer.from("valid-image-bytes").toString("base64");

function image(overrides = {}) {
  return {
    name: "diagram.png",
    mime: "image/png",
    b64: png,
    ...overrides,
  };
}

test("paper image validation accepts a bounded supported upload", () => {
  const [validated] = validateImages([image()]);
  assert.equal(validated.name, "diagram.png");
  assert.equal(validated.mime, "image/png");
  assert.equal(validated.b64, png);
});

test("paper image validation rejects non-array payloads", () => {
  assert.throws(() => validateImages({ name: "diagram.png" }), /Images must be an array/);
});

test("paper image validation rejects more than ten images instead of truncating silently", () => {
  assert.throws(() => validateImages(Array.from({ length: 11 }, (_, i) => image({ name: `${i}.png` }))), /At most 10 images/);
});

test("paper image validation rejects missing identity", () => {
  assert.throws(() => validateImages([{ mime: "image/png", b64: png }]), /requires a name or URL/);
});

test("paper image validation rejects unsupported active image formats", () => {
  assert.throws(() => validateImages([image({ name: "diagram.svg", mime: "image/svg+xml" })]), /Unsupported image type/);
});

test("paper image validation rejects data URLs and malformed base64", () => {
  assert.throws(
    () => validateImages([image({ b64: `data:image/png;base64,${png}` })]),
    /malformed base64 data/,
  );
  assert.throws(() => validateImages([image({ b64: "%%%=" })]), /malformed base64 data/);
});

test("paper image validation rejects decoded uploads above 3 MiB", () => {
  const oversized = Buffer.alloc(3 * 1024 * 1024 + 1).toString("base64");
  assert.throws(() => validateImages([image({ b64: oversized })]), /exceeds size limit/);
});

test("paper image validation requires HTTPS for remote image references", () => {
  assert.throws(
    () => validateImages([{ name: "remote", url: "http://example.com/image.png", mime: "image/png" }]),
    /must use HTTPS/,
  );
});

test("paper image validation deduplicates repeated image identities", () => {
  const validated = validateImages([image(), image()]);
  assert.equal(validated.length, 1);
});
