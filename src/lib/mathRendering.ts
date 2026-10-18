import type { Options } from "rehype-katex";

// KaTeX writes error colours inline. A CSS variable keeps rejected commands and
// malformed TeX readable when the active theme changes, without trusting TeX.
export const KATEX_RENDER_OPTIONS = {
  errorColor: "var(--math-error-color)",
  trust: false,
} satisfies Options;
