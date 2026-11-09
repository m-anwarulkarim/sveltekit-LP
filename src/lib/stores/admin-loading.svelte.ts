let pendingCount = $state(0);
let active = $state(false);

export const adminLoading = {
	get active() { return active; },

	start() {
		pendingCount++;
		active = true;
	},

	stop() {
		pendingCount = Math.max(0, pendingCount - 1);
		if (pendingCount === 0) active = false;
	},

	forceStop() {
		pendingCount = 0;
		active = false;
	}
};

const IGNORED_PATTERNS = [
	'/api/admin/notifications/poll',
	'/api/admin/notifications/count'
];

function shouldTrack(url: string, method: string): boolean {
	if (IGNORED_PATTERNS.some((p) => url.includes(p))) return false;
	if (method === 'GET' || method === 'HEAD') return false;
	return true;
}

export function installFetchInterceptor() {
	const originalFetch = window.fetch;

	window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
		const method = (init?.method || 'GET').toUpperCase();
		const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

		if (!shouldTrack(url, method)) {
			return originalFetch.call(this, input, init);
		}

		adminLoading.start();
		try {
			return await originalFetch.call(this, input, init);
		} finally {
			adminLoading.stop();
		}
	};

	return () => { window.fetch = originalFetch; };
}
