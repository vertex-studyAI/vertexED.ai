#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const targetRoot = resolve(process.argv[2] || "target");

async function read(path) {
  return readFile(resolve(targetRoot, path), "utf8");
}

async function write(path, content) {
  const absolute = resolve(targetRoot, path);
  await mkdir(dirname(absolute), { recursive: true });
  await writeFile(absolute, content, "utf8");
}

function replaceOnce(source, needle, replacement, label) {
  const index = source.indexOf(needle);
  if (index === -1) throw new Error(`${label}: expected source anchor was not found`);
  if (source.indexOf(needle, index + needle.length) !== -1) {
    throw new Error(`${label}: expected source anchor was not unique`);
  }
  return `${source.slice(0, index)}${replacement}${source.slice(index + needle.length)}`;
}

const authPath = "src/lib/auth.tsx";
let auth = await read(authPath);
auth = replaceOnce(
  auth,
  `      if (event === "SIGNED_IN" && nextSession?.user) {\n        void logSecurityEvent(nextSession.user.id, "sign_in", {\n          device: currentDeviceLabel(),\n          user_agent:\n            typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 200) : undefined,\n        });\n      }`,
  `      if (event === "SIGNED_IN" && nextSession?.user) {\n        const signedInUserId = nextSession.user.id;\n        const userAgent =\n          typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 200) : undefined;\n        // Supabase warns against making async client calls from inside onAuthStateChange.\n        // Defer the audit write until the auth callback has fully returned.\n        window.setTimeout(() => {\n          void logSecurityEvent(signedInUserId, "sign_in", {\n            device: currentDeviceLabel(),\n            user_agent: userAgent,\n          });\n        }, 0);\n      }`,
  "deferred auth audit write",
);
await write(authPath, auth);

const resetPath = "src/routes/reset-password.tsx";
let reset = await read(resetPath);
reset = replaceOnce(
  reset,
  `    const { error } = await supabase.auth.updateUser({ password });\n    setSubmitting(false);\n    if (error) {\n      toast.error(error.message);\n      return;\n    }\n    toast.success("Password updated.");\n    void navigate({ to: "/dashboard" });`,
  `    const { error } = await supabase.auth.updateUser({ password });\n    if (error) {\n      setSubmitting(false);\n      toast.error(error.message);\n      return;\n    }\n\n    const { error: signOutError } = await supabase.auth.signOut({ scope: "others" });\n    setSubmitting(false);\n    if (signOutError) {\n      toast.error(\n        "Password updated, but other sessions could not be closed. Use account security to sign out globally.",\n      );\n      return;\n    }\n\n    toast.success("Password updated and other sessions signed out.");\n    void navigate({ to: "/dashboard" });`,
  "password recovery session revocation",
);
await write(resetPath, reset);

await write(
  "src/lib/auth-lifecycle-contract.test.ts",
  `import { describe, expect, test } from "bun:test";\nimport { readFileSync } from "node:fs";\n\nconst authSource = readFileSync(new URL("./auth.tsx", import.meta.url), "utf8");\nconst resetSource = readFileSync(new URL("../routes/reset-password.tsx", import.meta.url), "utf8");\n\ndescribe("auth lifecycle safety", () => {\n  test("defers database audit writes until onAuthStateChange returns", () => {\n    const callbackStart = authSource.indexOf("supabase.auth.onAuthStateChange");\n    const callbackEnd = authSource.indexOf("return () =>", callbackStart);\n    const callback = authSource.slice(callbackStart, callbackEnd);\n    expect(callback).toContain("window.setTimeout");\n    expect(callback).toContain("void logSecurityEvent");\n    expect(callback.indexOf("window.setTimeout")).toBeLessThan(callback.indexOf("void logSecurityEvent"));\n  });\n\n  test("password recovery explicitly closes other sessions", () => {\n    expect(resetSource).toContain('supabase.auth.signOut({ scope: "others" })');\n    expect(resetSource).toContain("Password updated and other sessions signed out.");\n    expect(resetSource).toContain("other sessions could not be closed");\n  });\n});\n`,
);

console.log(`Applied Bu1LD auth lifecycle hardening to ${targetRoot}`);
