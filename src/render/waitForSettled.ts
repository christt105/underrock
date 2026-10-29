export interface SettleOptions {
	/** How long the DOM must stay unchanged to count as finished. */
	readonly quietMs: number;
	readonly timeoutMs: number;
}

/**
 * Resolves once asynchronous renderers (mermaid, embeds, other plugins) stop
 * touching `root` and its images have loaded or failed, or once the timeout passes.
 */
export async function waitForSettled(root: HTMLElement, options: SettleOptions): Promise<void> {
	const deadline = Date.now() + options.timeoutMs;
	await waitForQuiet(root, options.quietMs, deadline);
	await waitForImages(root, deadline);
}

function waitForQuiet(root: HTMLElement, quietMs: number, deadline: number): Promise<void> {
	return new Promise((resolve) => {
		let timer = 0;
		const finish = () => {
			observer.disconnect();
			window.clearTimeout(timer);
			window.clearTimeout(hardStop);
			resolve();
		};
		const restart = () => {
			window.clearTimeout(timer);
			timer = window.setTimeout(finish, quietMs);
		};
		const observer = new MutationObserver(restart);
		observer.observe(root, { childList: true, subtree: true, attributes: true, characterData: true });
		const hardStop = window.setTimeout(finish, Math.max(0, deadline - Date.now()));
		restart();
	});
}

async function waitForImages(root: HTMLElement, deadline: number): Promise<void> {
	const pending = Array.from(root.querySelectorAll("img")).filter((img) => !img.complete);
	if (pending.length === 0) return;
	const loads = pending.map(
		(img) =>
			new Promise<void>((resolve) => {
				img.addEventListener("load", () => resolve(), { once: true });
				img.addEventListener("error", () => resolve(), { once: true });
			}),
	);
	const timeout = new Promise<void>((resolve) => window.setTimeout(resolve, Math.max(0, deadline - Date.now())));
	await Promise.race([Promise.all(loads).then(() => undefined), timeout]);
}
