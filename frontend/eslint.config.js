import js from "@eslint/js";
import tseslint from "typescript-eslint";
import solid from "eslint-plugin-solid/configs/typescript";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  solid,
  prettier,
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**", "backend/**"],
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "solid/reactivity": "warn",
      "solid/no-destructure": "warn",
      "solid/prefer-for": "warn",
      "solid/components-return-once": "warn",
    },
  }
);
