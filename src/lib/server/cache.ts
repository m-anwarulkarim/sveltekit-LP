/**
 * Small per-isolate TTL cache for public, read-mostly data.
 * Each Worker isolate has its own copy, so a value can stay stale for up to its TTL
 * on other isolates after an admin change.
 */
interface Entry {
	expires: number;
	value: Promise<unknown>;
}

const MAX_ENTRIES = 5000;
const store = new Map<string, Entry>();

export function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
	const now = Date.now();
	const hit = store.get(key);
	if (hit && hit.expires > now) return hit.value as Promise<T>;

	if (store.size >= MAX_ENTRIES) store.clear();

	const value = load();
	store.set(key, { expires: now + ttlMs, value });
	// Never keep a failure: the next request should retry.
	value.catch(() => store.delete(key));
	return value;
}

export function clearCache(): void {
	store.clear();
}
