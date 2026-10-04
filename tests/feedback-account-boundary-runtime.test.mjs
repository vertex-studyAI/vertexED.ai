import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { readFileSync } from "node:fs";
import test from "node:test";

const candidateRequire = createRequire(new URL("../package.json", import.meta.url));
const ts = candidateRequire("typescript");
const { JSDOM } = candidateRequire("jsdom");
const React = candidateRequire("react");
const { createAccountOperationScope } = await import(new URL("../src/lib/accountOperationScope.mjs", import.meta.url));

function moduleUrl(source) {
  return `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
}

const realReactUrl = pathToFileURL(candidateRequire.resolve("react")).href;
const reactRuntimeUrl = pathToFileURL(candidateRequire.resolve("react/jsx-runtime")).href;
const componentPath = new URL("../src/components/FeedbackLauncher.tsx", import.meta.url);
const componentSource = readFileSync(componentPath, "utf8");
const reactHookMock = moduleUrl(`
import * as React from ${JSON.stringify(realReactUrl)};
export const useState = React.useState;
export const useRef = React.useRef;
export function useEffect(effect, dependencies) {
  const previous = globalThis.__feedbackEffectDependencies;
  const changed = !previous || dependencies.some((value, index) => !Object.is(value, previous[index]));
  if (changed) {
    globalThis.__feedbackEffectDependencies = [...dependencies];
    globalThis.__feedbackEffects.push(effect);
  }
}
`);
const mocks = {
  "react": reactHookMock,
  "react/jsx-runtime": reactRuntimeUrl,
  "lucide-react": moduleUrl(`
import { createElement } from ${JSON.stringify(realReactUrl)};
export const MessageSquare = () => createElement("span", { "aria-hidden": "true" });
export const X = () => createElement("span", { "aria-hidden": "true" });
`),
  "@/contexts/AuthContext": moduleUrl(`export const useAuth = () => ({ user: globalThis.__feedbackUser });`),
  "@/hooks/use-toast": moduleUrl(`export const toast = (message) => globalThis.__feedbackToasts.push(message);`),
  "@/lib/supabaseClient": moduleUrl(`export const supabase = { from: () => ({ insert: (row) => globalThis.__feedbackInsert(row) }) };`),
  "@/lib/productAnalytics.mjs": moduleUrl(`export const trackProductEvent = (...args) => globalThis.__feedbackAnalytics.push(args);`),
  "@/components/AccessibleModal": moduleUrl(`
import { createElement } from ${JSON.stringify(realReactUrl)};
export default function AccessibleModal({ children, titleId, descriptionId, className, overlayClassName, busy }) {
  return createElement("section", {
    "data-testid": "feedback-modal",
    "aria-labelledby": titleId,
    "aria-describedby": descriptionId,
    className,
    "data-busy": String(busy),
    "data-overlay-class": overlayClassName,
  }, children);
}
`),
  "@/lib/accountOperationScope.mjs": new URL("../src/lib/accountOperationScope.mjs", import.meta.url).href,
  "@/lib/productFeedback.mjs": moduleUrl(`
export const PRODUCT_FEEDBACK_CATEGORIES = ["bug", "confusing", "idea", "praise", "other"];
export const PRODUCT_FEEDBACK_MAX_LENGTH = 2000;
export function normalizeProductFeedback(input) {
  const feedback = String(input.feedback ?? "").trim();
  return feedback ? { ok: true, data: { ...input, feedback } } : { ok: false, error: "Add a note." };
}
export function buildFeedbackAnalyticsProperties({ category, rating }) {
  return { category, rating: rating || null };
}
`),
};
let componentCode = ts.transpileModule(componentSource, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    jsx: ts.JsxEmit.ReactJSX,
  },
}).outputText;
componentCode = componentCode.replace(/from\s+(['"])([^'"]+)\1/g, (match, quote, specifier) =>
  mocks[specifier] ? `from ${JSON.stringify(mocks[specifier])}` : match,
);
const { default: FeedbackLauncher } = await import(moduleUrl(componentCode));

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

async function act(callback) {
  await React.act(callback);
}

function flushEffects() {
  const effects = globalThis.__feedbackEffects.splice(0);
  for (const effect of effects) effect();
}

async function changeTextarea(dom, textarea, value) {
  const setter = Object.getOwnPropertyDescriptor(dom.window.HTMLTextAreaElement.prototype, "value").set;
  setter.call(textarea, value);
  await act(() => {
    textarea.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    textarea.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  });
}

async function mountFeedback(user) {
  const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
    url: "https://vertexed.app/study",
  });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.Node = dom.window.Node;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  globalThis.__feedbackUser = user;
  globalThis.__feedbackEffects = [];
  globalThis.__feedbackEffectDependencies = undefined;
  globalThis.__feedbackToasts = [];
  globalThis.__feedbackAnalytics = [];
  globalThis.__feedbackInsert = () => Promise.resolve({ error: null });
  const { createRoot } = candidateRequire("react-dom/client");
  const root = createRoot(dom.window.document.getElementById("root"));
  await act(() => root.render(React.createElement(FeedbackLauncher)));
  await act(() => flushEffects());
  return {
    dom,
    root,
    cleanup: async () => {
      await act(() => root.unmount());
      dom.window.close();
      delete globalThis.window;
      delete globalThis.document;
      delete globalThis.HTMLElement;
      delete globalThis.Node;
      delete globalThis.IS_REACT_ACT_ENVIRONMENT;
      delete globalThis.__feedbackUser;
      delete globalThis.__feedbackEffects;
      delete globalThis.__feedbackEffectDependencies;
      delete globalThis.__feedbackToasts;
      delete globalThis.__feedbackAnalytics;
      delete globalThis.__feedbackInsert;
    },
  };
}

function buttonNamed(document, name) {
  const button = [...document.querySelectorAll("button")].find(item => item.textContent.trim() === name);
  assert.ok(button, `expected button: ${name}`);
  return button;
}

test("failed feedback save stays retryable; sign-out hides the draft and stale retry cannot affect the next account", async () => {
  const firstAttempt = deferred();
  const staleRetry = deferred();
  const learnerBSave = deferred();
  const submittedRows = [];
  const mounted = await mountFeedback({ id: "learner-a" });
  const { dom, root } = mounted;
  try {
    globalThis.__feedbackInsert = row => {
      submittedRows.push(row);
      if (submittedRows.length === 1) return firstAttempt.promise;
      if (submittedRows.length === 2) return staleRetry.promise;
      return learnerBSave.promise;
    };

    await act(() => buttonNamed(document, "Feedback").click());
    await changeTextarea(dom, document.querySelector("textarea"), "A private draft");
    await act(() => buttonNamed(document, "Send feedback").click());
    assert.equal(submittedRows.length, 1);
    assert.equal(submittedRows[0].user_id, "learner-a");

    await act(async () => {
      firstAttempt.reject(new Error("temporary network failure"));
      await Promise.resolve();
    });
    assert.equal(document.querySelector("textarea").value, "A private draft", "a failed save keeps the draft available for retry");
    assert.equal(globalThis.__feedbackToasts.at(-1).title, "Feedback was not saved");

    await act(() => buttonNamed(document, "Send feedback").click());
    assert.equal(submittedRows.length, 2, "the retry creates one new request");
    assert.equal(submittedRows[1].feedback, "A private draft");
    assert.equal(submittedRows[1].user_id, "learner-a");
    await act(() => buttonNamed(document, "Sending…").click());
    assert.equal(submittedRows.length, 2, "the in-flight submit button blocks duplicate requests");

    await act(() => {
      globalThis.__feedbackUser = null;
      root.render(React.createElement(FeedbackLauncher));
    });
    assert.equal(document.body.textContent.includes("A private draft"), false, "signed-out UI never paints the previous account draft");
    await act(() => flushEffects());

    await act(() => {
      globalThis.__feedbackUser = { id: "learner-b" };
      root.render(React.createElement(FeedbackLauncher));
    });
    assert.equal(document.body.textContent.includes("A private draft"), false, "new account render stays suppressed until reset effect");
    await act(() => flushEffects());
    await act(() => buttonNamed(document, "Feedback").click());
    assert.equal(document.querySelector("textarea").value, "", "reopening starts with a blank account-bound form");
    assert.equal(document.querySelector("select").value, "idea");
    assert.equal(document.querySelector("button[aria-pressed='true']"), null);

    const toastCount = globalThis.__feedbackToasts.length;
    await act(async () => {
      staleRetry.resolve({ error: null });
      await Promise.resolve();
    });
    assert.equal(globalThis.__feedbackToasts.length, toastCount, "stale success does not toast in the new account");
    assert.ok(document.querySelector('[data-testid="feedback-modal"]'), "stale success does not close the new account form");

    await changeTextarea(dom, document.querySelector("textarea"), "B's note");
    await act(() => buttonNamed(document, "Send feedback").click());
    assert.equal(submittedRows.length, 3);
    assert.equal(submittedRows[2].user_id, "learner-b");
    assert.equal(submittedRows[2].feedback, "B's note");
    await act(async () => {
      learnerBSave.resolve({ error: null });
      await Promise.resolve();
    });
    assert.equal(document.querySelector('[data-testid="feedback-modal"]'), null, "current-account success closes its own form");
    assert.equal(globalThis.__feedbackToasts.at(-1).title, "Thanks - feedback saved");
  } finally {
    await mounted.cleanup();
  }
});
