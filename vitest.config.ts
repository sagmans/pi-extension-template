import { defineConfig } from "vitest/config";

const COVERAGE_THRESHOLD_PERCENT = 80;

export default defineConfig({
	test: {
		coverage: {
			provider: "v8",
			reporter: ["text", "json-summary"],
			include: ["index.ts", "scripts/**/*.{ts,mts,js,mjs}"],
			thresholds: {
				statements: COVERAGE_THRESHOLD_PERCENT,
				branches: COVERAGE_THRESHOLD_PERCENT,
				functions: COVERAGE_THRESHOLD_PERCENT,
				lines: COVERAGE_THRESHOLD_PERCENT,
			},
		},
	},
});
