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
  '  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;',
  '  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null; requiresEmailConfirmation: boolean }>;',
  "signUp result type",
);
auth = replaceOnce(
  auth,
  `  const signUp = useCallback(async (email: string, password: string, fullName: string) => {\n    const supabase = getSupabase();\n    if (!supabase) return { error: "Account access is temporarily unavailable." };\n    if (!isValidEmail(email)) return { error: "Enter a valid email address." };\n    const pw = validatePassword(password);\n    if (!pw.ok) return { error: pw.reason };\n\n    const { error } = await supabase.auth.signUp({\n      email,\n      password,\n      options: { data: { full_name: fullName.trim() } },\n    });\n    return { error: error?.message ?? null };\n  }, []);`,
  `  const signUp = useCallback(async (email: string, password: string, fullName: string) => {\n    const supabase = getSupabase();\n    if (!supabase) {\n      return {\n        error: "Account access is temporarily unavailable.",\n        requiresEmailConfirmation: false,\n      };\n    }\n    if (!isValidEmail(email)) {\n      return { error: "Enter a valid email address.", requiresEmailConfirmation: false };\n    }\n    const pw = validatePassword(password);\n    if (!pw.ok) return { error: pw.reason, requiresEmailConfirmation: false };\n\n    const emailRedirectTo =\n      typeof window !== "undefined" ? \`${"${window.location.origin}"}/auth/callback\` : undefined;\n    const { data, error } = await supabase.auth.signUp({\n      email,\n      password,\n      options: {\n        data: { full_name: fullName.trim() },\n        emailRedirectTo,\n      },\n    });\n    return {\n      error: error?.message ?? null,\n      requiresEmailConfirmation: !error && !data.session,\n    };\n  }, []);`,
  "signUp implementation",
);
await write(authPath, auth);

const signupPath = "src/routes/signup.tsx";
let signup = await read(signupPath);
signup = replaceOnce(
  signup,
  '  const [submitting, setSubmitting] = useState(false);',
  '  const [submitting, setSubmitting] = useState(false);\n  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);',
  "signup confirmation state",
);
signup = replaceOnce(
  signup,
  `    const { error } = await signUp(email, password, fullName);\n    setSubmitting(false);\n    if (error) {\n      toast.error(error);\n      return;\n    }\n    rememberPostAuthRedirect(redirect);\n    toast.success("Account created — let's set up your profile.");\n    void navigate({ to: "/onboarding" });`,
  `    const { error, requiresEmailConfirmation } = await signUp(email, password, fullName);\n    setSubmitting(false);\n    if (error) {\n      toast.error(error);\n      return;\n    }\n    rememberPostAuthRedirect(redirect);\n    if (requiresEmailConfirmation) {\n      setConfirmationEmail(email.trim());\n      toast.success("Check your email to confirm your account.");\n      return;\n    }\n    toast.success("Account created — let's set up your profile.");\n    void navigate({ to: "/onboarding" });`,
  "signup submit behavior",
);
signup = replaceOnce(
  signup,
  `      {!configured ? (\n        <p className="rounded-sm border border-accent-red/30 bg-accent-red/5 px-4 py-3 text-sm text-accent-red">\n          Account creation is temporarily unavailable. Please try again later.\n        </p>\n      ) : null}\n      <form onSubmit={onSubmit} className="space-y-5">`,
  `      {!configured ? (\n        <p className="rounded-sm border border-accent-red/30 bg-accent-red/5 px-4 py-3 text-sm text-accent-red">\n          Account creation is temporarily unavailable. Please try again later.\n        </p>\n      ) : null}\n      {confirmationEmail ? (\n        <div\n          role="status"\n          className="rounded-sm border border-accent-green/30 bg-accent-green/5 px-4 py-4 text-sm text-foreground/90"\n        >\n          <p className="font-medium text-bone">Confirm your email to continue</p>\n          <p className="mt-2 leading-relaxed text-muted-foreground">\n            We sent a confirmation link to {confirmationEmail}. Open it to verify your account;\n            you&apos;ll return here authenticated and continue to profile setup.\n          </p>\n          <div className="mt-4 flex flex-wrap gap-3">\n            <Link\n              to="/login"\n              search={loginSearch}\n              className="inline-flex items-center justify-center rounded-sm bg-bone px-4 py-2 font-mono text-[10px] tracking-[0.18em] uppercase text-background hover:bg-accent-blue transition"\n            >\n              Go to login\n            </Link>\n            <button\n              type="button"\n              onClick={() => setConfirmationEmail(null)}\n              className="rounded-sm border border-border/70 px-4 py-2 font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground hover:text-bone transition"\n            >\n              Use another email\n            </button>\n          </div>\n        </div>\n      ) : (\n      <form onSubmit={onSubmit} className="space-y-5">`,
  "signup confirmation panel start",
);
signup = replaceOnce(
  signup,
  `      </form>\n      <OAuthButtons />`,
  `      </form>\n      )}\n      <OAuthButtons />`,
  "signup confirmation panel end",
);
await write(signupPath, signup);

await write(
  "src/lib/auth-signup-contract.test.ts",
  `import { describe, expect, test } from "bun:test";\nimport { readFileSync } from "node:fs";\n\nconst authSource = readFileSync(new URL("./auth.tsx", import.meta.url), "utf8");\nconst signupSource = readFileSync(new URL("../routes/signup.tsx", import.meta.url), "utf8");\n\ndescribe("email signup activation contract", () => {\n  test("handles confirmation-required signups without pretending a session exists", () => {\n    expect(authSource).toContain("requiresEmailConfirmation: !error && !data.session");\n    expect(authSource).toContain("emailRedirectTo");\n    expect(authSource).toContain("/auth/callback");\n    expect(signupSource).toContain("if (requiresEmailConfirmation)");\n    expect(signupSource).toContain("Confirm your email to continue");\n  });\n\n  test("only enters onboarding immediately when a session was created", () => {\n    const confirmationBranch = signupSource.indexOf("if (requiresEmailConfirmation)");\n    const onboardingNavigation = signupSource.indexOf('navigate({ to: "/onboarding" })');\n    expect(confirmationBranch).toBeGreaterThan(-1);\n    expect(onboardingNavigation).toBeGreaterThan(confirmationBranch);\n  });\n});\n`,
);

console.log(`Applied confirmation-aware signup recovery to ${targetRoot}`);
