/**
 * Reactive Network Status & Offline Recovery Store (Svelte 5 Runes)
 */

let isOnline = $state(typeof navigator !== 'undefined' ? navigator.onLine : true);
let isReconnecting = $state(false);
let wasOffline = $state(false);
let isOfflineOrderModalOpen = $state(false);
let offlineActionData = $state<{
	customerName?: string;
	customerPhone?: string;
	shippingAddress?: string;
	total?: number | string;
	retryAction?: () => Promise<void> | void;
} | null>(null);

let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let isInitialized = false;

/**
 * Pings the server with a lightweight, cache-busted HEAD request
 * to verify true internet reachability (handles router captive portals/zero data).
 */
async function pingServer(): Promise<boolean> {
	if (typeof window === 'undefined') return true;
	if (typeof navigator !== 'undefined' && !navigator.onLine) {
		return false;
	}

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 3000);

	try {
		const res = await fetch(`/favicon.svg?ping=${Date.now()}`, {
			method: 'HEAD',
			cache: 'no-store',
			signal: controller.signal
		});
		clearTimeout(timeoutId);
		return res.ok || res.status < 500;
	} catch {
		clearTimeout(timeoutId);
		return false;
	}
}

export const network = {
	get isOnline() {
		return isOnline;
	},

	get isOffline() {
		return !isOnline;
	},

	get isReconnecting() {
		return isReconnecting;
	},

	get wasOffline() {
		return wasOffline;
	},

	get isOfflineOrderModalOpen() {
		return isOfflineOrderModalOpen;
	},

	get offlineActionData() {
		return offlineActionData;
	},

	openOfflineOrderModal(data?: typeof offlineActionData) {
		if (data) offlineActionData = data;
		isOfflineOrderModalOpen = true;
	},

	closeOfflineOrderModal() {
		isOfflineOrderModalOpen = false;
	},

	clearOfflineActionData() {
		offlineActionData = null;
	},

	/**
	 * Manually triggers a real network health-check.
	 */
	async checkConnection(): Promise<boolean> {
		isReconnecting = true;
		try {
			const active = await pingServer();
			if (active) {
				if (!isOnline) {
					wasOffline = true;
					if (reconnectTimer) clearTimeout(reconnectTimer);
					reconnectTimer = setTimeout(() => {
						wasOffline = false;
					}, 2800);
				}
				isOnline = true;
				return true;
			} else {
				isOnline = false;
				return false;
			}
		} finally {
			isReconnecting = false;
		}
	},

	/**
	 * Binds window 'online' and 'offline' events once in client layout.
	 */
	init() {
		if (typeof window === 'undefined' || isInitialized) return;
		isInitialized = true;

		isOnline = navigator.onLine;

		const handleOnline = async () => {
			const realOnline = await pingServer();
			if (realOnline) {
				wasOffline = true;
				isOnline = true;
				if (reconnectTimer) clearTimeout(reconnectTimer);
				reconnectTimer = setTimeout(() => {
					wasOffline = false;
				}, 2800);
			}
		};

		const handleOffline = () => {
			isOnline = false;
			wasOffline = false;
		};

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
			isInitialized = false;
		};
	}
};
