import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "node_modules", ".tmp", "test-results", "playwright-report"] },
  {
    files: ["api/**/*.js", "tests/**/*.mjs", "scripts/**/*.mjs", "evals/**/*.mjs", "contracts/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
      sourceType: "module",
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
  {
    files: ["src/**/*.{js,mjs}"],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser, sourceType: "module" },
    rules: { ...js.configs.recommended.rules },
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "error",
        {
          allowConstantExport: true,
          allowExportNames: [
            "badgeVariants",
            "buttonVariants",
            "CURRICULA",
            "FEATURES",
            "getHeadingsForPath",
            "navigationMenuTriggerStyle",
            "outputKindLabel",
            "routeHeadingsMap",
            "toast",
            "toggleVariants",
            "useAccessibility",
            "useAppPreferences",
            "useAuth",
            "useFormField",
            "useSidebar",
          ],
        },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    files: ["tailwind.config.ts", "utils/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  }
);
