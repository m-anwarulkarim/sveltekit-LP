import { env as cfEnv } from 'cloudflare:workers';

export type RateLimitTier = 'strict' | 'default';

interface RateLimitBinding {
	limit(options: { key: string }): Promise<{ success: boolean }>;
}

const FALLBACK_LIMITS: Record<RateLimitTier, number> = { strict: 10, default: 60 };
const WINDOW_MS = 60_000;
const MAX_TRACKED_KEYS = 10_000;

const BINDINGS: Record<RateLimitTier, string> = {
	strict: 'RATE_LIMIT_STRICT',
	default: 'RATE_LIMIT_DEFAULT'
};

const windows = new Map<string, { resetAt: number; count: number }>();

function allowInMemory(key: string, tier: RateLimitTier): boolean {
	const now = Date.now();
	const current = windows.get(key);
	if (!current || current.resetAt <= now) {
		if (windows.size >= MAX_TRACKED_KEYS) windows.clear();
		windows.set(key, { resetAt: now + WINDOW_MS, count: 1 });
		return true;
	}
	current.count += 1;
	return current.count <= FALLBACK_LIMITS[tier];
}

/** Which limit applies to a request, or null when the request is not rate limited. */
export function getRateLimitTier(method: string, pathname: string): RateLimitTier | null {
	if (method !== 'POST') return null;
	if (
		pathname.startsWith('/auth/') ||
		pathname === '/track-order' ||
		pathname === '/api/coupon/validate'
	) {
		return 'strict';
	}
	if (
		pathname === '/checkout' ||
		pathname.startsWith('/lp/') ||
		pathname === '/api/checkout/incomplete' ||
		pathname === '/api/payment/bkash/create'
	) {
		return 'default';
	}
	return null;
}

/**
 * Uses the Cloudflare rate limiting binding when deployed. The in-memory fallback is
 * per-isolate and only covers local development or a missing binding.
 */
export async function isRateLimitAllowed(
	tier: RateLimitTier,
	ip: string,
	pathname: string
): Promise<boolean> {
	const key = `${ip}:${pathname}`;
	const binding = (cfEnv as unknown as Record<string, RateLimitBinding | undefined>)?.[BINDINGS[tier]];
	if (binding && typeof binding.limit === 'function') {
		try {
			const { success } = await binding.limit({ key });
			return success;
		} catch (err) {
			console.error('Rate limit binding failed:', err);
		}
	}
	return allowInMemory(key, tier);
}
