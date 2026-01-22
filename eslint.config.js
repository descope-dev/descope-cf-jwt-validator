import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";
import security from "eslint-plugin-security";

export default [
	js.configs.recommended,
	{
		files: ["**/*.ts", "**/*.js"],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module",
			},
			globals: {
				console: "readonly",
				process: "readonly",
				Buffer: "readonly",
				__dirname: "readonly",
				__filename: "readonly",
				module: "readonly",
				require: "readonly",
				exports: "readonly",
				global: "readonly",
				fetch: "readonly",
				Request: "readonly",
				Response: "readonly",
				Headers: "readonly",
				URL: "readonly",
				URLSearchParams: "readonly",
				Env: "readonly",
				describe: "readonly",
				it: "readonly",
				expect: "readonly",
				beforeAll: "readonly",
				afterAll: "readonly",
			},
		},
		plugins: {
			"@typescript-eslint": tseslint,
			prettier,
			security,
		},
		rules: {
			...tseslint.configs.recommended.rules,
			...security.configs.recommended.rules,
			"prettier/prettier": "error",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{ argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
			],
		},
	},
];
