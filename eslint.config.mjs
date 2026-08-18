import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      // 核心语法检查:未定义变量(可抓住拼写错误)
      "no-undef": "error",
      // 声明了但从未使用(常因拼错变量名产生)
      "no-unused-vars": "error",
      // 拦截 if (a = b) 这类笔误
      "no-constant-condition": "error",
    },
  },
  {
    ignores: ["node_modules/**"],
  },
];
