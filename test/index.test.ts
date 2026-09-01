import { describe, expect, it, vi } from "vitest";
import extension from "../index.ts";

const REGISTERED_METHOD_NAMES = ["on", "registerCommand", "registerTool"] as const;

describe("reference extension", () => {
	it("exports an inert factory", () => {
		const pi = Object.fromEntries(REGISTERED_METHOD_NAMES.map((name) => [name, vi.fn()]));

		expect(extension(pi as never)).toBeUndefined();
		for (const methodName of REGISTERED_METHOD_NAMES) {
			expect(pi[methodName]).not.toHaveBeenCalled();
		}
	});
});
