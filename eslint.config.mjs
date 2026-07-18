import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        Module: "readonly",
        config: "readonly",
        Log: "readonly"
      },
      ecmaVersion: 2021,
      sourceType: "module"
    }
  },
  pluginJs.configs.recommended,
  {
    rules: {
      "no-unused-vars": ["warn", { "args": "none" }]
    }
  }
];
