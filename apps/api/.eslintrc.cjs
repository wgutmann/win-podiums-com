/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  env: {
    es2022: true,
    node: true,
  },
  ignorePatterns: ["node_modules/", "test/"],
  overrides: [
    {
      files: ["src/**/*.ts"],
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
  ],
};
