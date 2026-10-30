import type { Handle } from '@sveltejs/kit/hooks';
import { DEV as dev } from 'esm-env';
import { env as cfEnv } from 'cloudflare:workers';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { eq } from 'drizzle-orm';

let platformProxyPromise: Promise<any> | null = null;

if (dev) {
	platformProxyPromise = (async () => {
		try {
			const { getPlatformProxy } = await import('wrangler');
			const proxy = await getPlatformProxy({ configPath: './wrangler.jsonc' });
			if (proxy?.env?.DB) {
				(globalThis as any).__DEV_D1__ = proxy.env.DB;
			}
			return proxy;
		} catch (e) {
			console.error('Failed to initialize local wrangler platform proxy:', e);
			return null;
		}
	})();
}

// Known bot and crawler signatures
const SEARCH_BOTS = /googlebot|bingbot|yandex|duckduckbot|baiduspider|slurp|sogou|yahoo/i;
const AI_CRAWLERS = /gptbot|chatgpt-user|claudebot|anthropic-ai|perplexitybot|bytespider|ccbot|applebot-extended|meta-externalagent|cohere-ai/i;
const HEADLESS_OR_SCRAPERS = /headlesschrome|puppeteer|playwright|python-requests|aiohttp|curl\/|wget\/|scrapy|postman|httpie|go-http-client/i;

export const handle: Handle = async ({ event, resolve }) => {
	if (dev && platformProxyPromise) {
		const localPlatform = await platformProxyPromise;
		if (localPlatform) {
			if (localPlatform.env?.DB) {
				(globalThis as any).__DEV_D1__ = localPlatform.env.DB;
			}
			(event as any).platform = {
				...event.platform,
				...localPlatform,
				env: {
					...event.platform?.env,
					...localPlatform.env
				}
			};
		}
	}

	const platform: any = event.platform;
	const userAgent = event.request.headers.get('user-agent') || '';
	const clientIp =
		event.request.headers.get('cf-connecting-ip') ||
		event.request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
		'127.0.0.1';

	// 1. Sentinel IP Block Check (Ignore static asset requests to keep speed fast)
	if (!event.url.pathname.startsWith('/_app/') && !event.url.pathname.startsWith('/favicon')) {
		try {
			const db = getDb(cfEnv.DB);
			const blocked = await db
				.select({ ip: schema.ipBlocks.ipAddress, reason: schema.ipBlocks.reason })
				.from(schema.ipBlocks)
				.where(eq(schema.ipBlocks.ipAddress, clientIp))
				.get();

			if (blocked) {
				return new Response(
					JSON.stringify({
						error: 'Access Denied',
						message: 'Your IP address has been blocked by AURA Security Sentinel.',
						reason: blocked.reason || 'Restricted Activity'
					}),
					{
						status: 403,
						headers: { 'content-type': 'application/json' }
					}
				);
			}
		} catch (err) {
			console.error('IP block check failed:', err);
		}
	}

	// 2. Real-Time Bot & Crawler Telemetry Classification
	let botCategory: 'search' | 'ai' | 'headless' | null = null;
	let threatLevel: 'low' | 'moderate' | 'critical' = 'low';

	if (SEARCH_BOTS.test(userAgent)) {
		botCategory = 'search';
		threatLevel = 'low';
	} else if (AI_CRAWLERS.test(userAgent)) {
		botCategory = 'ai';
		threatLevel = 'moderate';
	} else if (HEADLESS_OR_SCRAPERS.test(userAgent)) {
		botCategory = 'headless';
		threatLevel = 'critical';
	}

	// 3. Asynchronously Record Real Bot Telemetry to D1 (Exclude localhost to prevent dev test noise)
	const isLocalDev =
		dev ||
		clientIp === '127.0.0.1' ||
		clientIp === '::1' ||
		event.url.hostname === 'localhost' ||
		event.url.hostname === '127.0.0.1';

	if (botCategory && !isLocalDev) {
		try {
			const db = getDb(cfEnv.DB);
			const logPromise = db
				.insert(schema.botLogs)
				.values({
					id: crypto.randomUUID(),
					ipAddress: clientIp,
					userAgent: userAgent.slice(0, 300),
					botCategory,
					threatLevel,
					pathVisited: event.url.pathname,
					actionTaken: 'allowed'
				})
				.catch((err) => console.error('Failed to log bot telemetry:', err));

			if (platform?.ctx?.waitUntil) {
				platform.ctx.waitUntil(logPromise);
			} else if ((cfEnv as any)?.ctx?.waitUntil) {
				(cfEnv as any).ctx.waitUntil(logPromise);
			}
		} catch (err) {
			console.error('Failed to init db for bot telemetry:', err);
		}
	}

	return resolve(event);
};

export const handleError = ({ error, event }: any) => {
	console.error('SERVER ERROR AT', event.url.pathname, ':', error);
	return {
		message: error?.message || 'Server error',
		stack: error?.stack || null
	};
};
