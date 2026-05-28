import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated artifacts:
    ".open-next/**",
    "cloudflare-env.d.ts",
  ]),
  // The shared UI primitives in src/shared/ui are a vendored design-system
  // scaffold. Application code remains under strict rules; only the scaffold
  // gets these relaxations so we don't hand-edit upstream components.
  {
    files: ["src/shared/ui/**/*.{ts,tsx}"],
    linterOptions: { reportUnusedDisableDirectives: "off" },
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@next/next/no-img-element": "off",
      "react-hooks/refs": "off",
      "react-hooks/use-memo": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
