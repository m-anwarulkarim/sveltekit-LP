let pendingCount = $state(0);
let active = $state(false);

/**
 * Global reactive loading store for public storefront actions
 * Automatically hooked into StoreLoadingBar.svelte
 */
export const storeLoading = {
	get active() {
		return active;
	},

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
