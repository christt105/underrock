// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { waitForSettled } from "./waitForSettled";

describe("waitForSettled", () => {
	it("waits until late renderers stop changing the DOM", async () => {
		const root = document.createElement("div");
		document.body.append(root);
		window.setTimeout(() => root.append(document.createElement("svg")), 30);
		window.setTimeout(() => root.append(document.createElement("p")), 60);
		await waitForSettled(root, { quietMs: 50, timeoutMs: 2000 });
		expect(root.children).toHaveLength(2);
	});

	it("gives up after the timeout if the DOM keeps changing", async () => {
		const root = document.createElement("div");
		const interval = window.setInterval(() => root.append(document.createElement("span")), 10);
		const start = Date.now();
		await waitForSettled(root, { quietMs: 50, timeoutMs: 200 });
		window.clearInterval(interval);
		expect(Date.now() - start).toBeLessThan(1000);
	});
});
