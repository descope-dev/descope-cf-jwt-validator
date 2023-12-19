import type { Config } from "jest";

const config: Config = {
	preset: "ts-jest",
	testEnvironment: "miniflare",
	verbose: true,
	collectCoverageFrom: ["src/**/worker.ts"],
	coverageThreshold: {
		global: {
			lines: 100,
		},
	},
	moduleNameMapper: {
		jose: "<rootDir>/node_modules/jose/dist/node/cjs/index.js",
	},
};

export default config;
