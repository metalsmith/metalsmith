import pluginNode from 'eslint-plugin-n'
import pluginImport from 'eslint-plugin-import'
import globals from "globals";
import js from "@eslint/js";

export default [
  pluginNode.configs['flat/recommended'],
  pluginImport.flatConfigs.recommended,
{
  files: ["test/**/*.js"],
  languageOptions: {
    globals: {
      ...globals.node,
      ...globals.mocha
    }
  }
},
 {
  files: ['bin/metalsmith', '**/*.js'],
  languageOptions: {
    globals: {
      ...globals.node,
    },

    ecmaVersion: 2020,
    sourceType: "commonjs",
  },

  plugins: { n: pluginNode },

  rules: {
    ...js.configs.recommended.rules,
    "no-console": "error",
    "prefer-const": "error",
    "no-unused-vars": ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    }],
    "no-var": "error",
    "n/exports-style": [0, "error"],
  }
}];