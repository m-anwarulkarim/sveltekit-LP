import type { Handle, HandleServerError } from '@sveltejs/kit/hooks';
import type { RequestEvent } from '@sveltejs/kit';
import { json, redirect } from '@sveltejs/kit';
import { DEV as dev } from 'esm-env';
import { env as cfEnv } from 'cloudflare:workers';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { createAuth, resolveAuthOptions } from '#lib/server/auth';
import { getAuthSecret } from '#lib/server/secrets';
import { cached, clearCache } from '#lib/server/cache';
import { getRateLimitTier, isRateLimitAllowed } from '#lib/server/rate-limit';
import { SecurityService } from '#lib/server/services/security.service';
import { VisitorAnalyticsService } from '#lib/server/services/visitor-analytics.service';
import { ADMIN_SESSION_COOKIE, AdminAuthService } from '#lib/server/services/admin-auth.service';
import {
	ADMIN_MENU_LIST,
	canAccessAdminApi,
	getMenuIdFromPath,
	hasMenuAccess
} from '#lib/constants/admin-permissions';

let platformProxyPromise: Promise<any> | null = null;

if (dev) {
	platformProxyPromise = (async () => {
		try {
			const { getPlatformProxy } = await import('wrangler');
			const proxy = await getPlatformProxy({ configPath: './wrangler.jsonc' });
			if (proxy?.env?.DB) {
				(globalThis as any).__DEV_D1__ = proxy.env.DB;
			}
			if (proxy?.env?.R2) {
				(globalThis as any).__DEV_R2__ = proxy.env.R2;
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

const IP_BLOCK_CACHE_TTL_MS = 60_000;
const BOT_LOG_INTERVAL_MS = 5 * 60_000;
const botLastLogged = new Map<string, number>();

/** A crawler can send thousands of requests, but one row per interval says the same thing. */
function shouldLogBot(ip: string, category: string): boolean {
	const now = Date.now();
	const key = `${ip}|${category}`;
	const last = botLastLogged.get(key);
	if (last && now - last < BOT_LOG_INTERVAL_MS) return false;
	if (botLastLogged.size > 5000) botLastLogged.clear();
	botLastLogged.set(key, now);
	return true;
}
const CUSTOMER_SESSION_COOKIES = ['better-auth.session_token', '__Secure-better-auth.session_token'];

function isAssetPath(pathname: string): boolean {
	return pathname.startsWith('/_app/') || pathname.startsWith('/favicon');
}

function decodedPathname(event: RequestEvent): string {
	try {
		return decodeURIComponent(event.url.pathname);
	} catch {
		// Malformed encoding: fall back to the raw pathname.
		return event.url.pathname;
	}
}

/**
 * Route IDs are used first because SvelteKit decodes the URL before matching a route,
 * so a pathname check alone could be bypassed with an encoded path like /%61dmin.
 */
function getProtectedArea(event: RequestEvent): 'page' | 'api' | null {
	const routeId = event.route.id ?? '';
	const pathname = decodedPathname(event);

	const matches = (root: string) =>
		routeId === root ||
		routeId.startsWith(`${root}/`) ||
		pathname === root ||
		pathname.startsWith(`${root}/`);

	if (matches('/api/admin')) return 'api';
	if (matches('/admin')) return 'page';
	return null;
}

function canAccessAdminPath(permissions: string[], role: string, pathname: string): boolean {
	const menuId = getMenuIdFromPath(pathname);
	if (!menuId) return true;
	const menu = ADMIN_MENU_LIST.find((m) => m.id === menuId);
	if (menu?.isOwnerOnly && role !== 'Owner') return false;
	return hasMenuAccess(permissions, menuId);
}

async function guardAdminArea(event: RequestEvent, area: 'page' | 'api'): Promise<Response | null> {
	let admin = null;
	try {
		admin = await AdminAuthService.resolveSession(
			getDb(event.platform),
			event.cookies.get(ADMIN_SESSION_COOKIE),
			getAuthSecret()
		);
	} catch (err) {
		// Fail closed: a database problem must never open the admin panel.
		console.error('Admin session check failed:', err);
		return area === 'api'
			? json({ success: false, message: 'Service unavailable' }, { status: 503 })
			: new Response('Service unavailable', { status: 503 });
	}

	if (!admin) {
		if (area === 'api') {
			return json({ success: false, message: 'Unauthorized' }, { status: 401 });
		}
		const target = `${event.url.pathname}${event.url.search}`;
		throw redirect(303, `/auth/admin-login?redirectTo=${encodeURIComponent(target)}`);
	}

	event.locals.admin = admin;

	// Route IDs are already decoded, so an encoded path cannot slip past these checks.
	const accessPath = event.route.id || decodedPathname(event);

	if (area === 'api') {
		return canAccessAdminApi(admin.permissions, admin.role, accessPath)
			? null
			: json({ success: false, message: 'Forbidden' }, { status: 403 });
	}

	if (!canAccessAdminPath(admin.permissions, admin.role, accessPath)) {
		// Form actions skip the layout load, and a data request can skip it too,
		// so a layout-only check would not be enough.
		if (event.request.method !== 'GET') {
			return new Response('Forbidden', { status: 403 });
		}
		const allowed = ADMIN_MENU_LIST.find((m) => canAccessAdminPath(admin.permissions, admin.role, m.path));
		throw redirect(303, allowed?.path || '/admin/profile');
	}

	return null;
}

async function attachCustomerSession(event: RequestEvent) {
	const hasSessionCookie = CUSTOMER_SESSION_COOKIES.some((name) => event.cookies.get(name));
	const needsAuth = hasSessionCookie || event.url.pathname.startsWith('/auth/');
	if (!needsAuth) return;

	const secret = getAuthSecret();
	const d1 = (event.platform as any)?.env?.DB || (cfEnv as any)?.DB;
	if (!secret || !d1) return;

	try {
		const baseURL = event.url.origin;
		const authOptions = await resolveAuthOptions(d1);
		const auth = createAuth(d1, secret, baseURL, authOptions);
		event.locals.auth = auth;
		if (auth && hasSessionCookie) {
			const session = await auth.api.getSession({ headers: event.request.headers });
			if (session) {
				event.locals.user = session.user;
				event.locals.session = session.session;
			}
		}
	} catch (err) {
		console.error('Customer session check failed:', err);
	}
}

const handleRequest: Handle = async ({ event, resolve }) => {
	if (dev && platformProxyPromise) {
		const localPlatform = await platformProxyPromise;
		if (localPlatform) {
			if (localPlatform.env?.DB) {
				(globalThis as any).__DEV_D1__ = localPlatform.env.DB;
			}
			if (localPlatform.env?.R2) {
				(globalThis as any).__DEV_R2__ = localPlatform.env.R2;
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
	const { pathname } = event.url;
	const userAgent = event.request.headers.get('user-agent') || '';
	const clientIp =
		event.request.headers.get('cf-connecting-ip') ||
		event.request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
		'127.0.0.1';

	// 1. Sentinel IP Block Check, cached so a page view does not always cost a D1 read
	if (!isAssetPath(pathname)) {
		try {
			const block = await cached(`ip-block:${clientIp}`, IP_BLOCK_CACHE_TTL_MS, () =>
				SecurityService.isBlocked(getDb(platform), clientIp)
			);

			if (block.blocked) {
				return new Response(
					JSON.stringify({
						error: 'Access Denied',
						message: 'Your IP address has been blocked by seedbd Security Sentinel.',
						reason: block.reason || 'Restricted Activity'
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

	// 2. Rate limit sensitive public endpoints
	const rateLimitTier = getRateLimitTier(event.request.method, pathname);
	if (rateLimitTier && !(await isRateLimitAllowed(rateLimitTier, clientIp, pathname))) {
		return json(
			{ success: false, message: 'অনেকবার চেষ্টা করা হয়েছে। এক মিনিট পরে আবার চেষ্টা করুন।' },
			{ status: 429, headers: { 'retry-after': '60' } }
		);
	}

	// 3. Authentication
	await attachCustomerSession(event);

	const protectedArea = getProtectedArea(event);
	if (protectedArea) {
		const denied = await guardAdminArea(event, protectedArea);
		if (denied) return denied;
	}

	// 4. Real-Time Bot & Crawler Telemetry Classification
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

	// 5. Asynchronously Record Real Bot Telemetry to D1 (Exclude localhost to prevent dev test noise)
	const isLocalDev =
		dev ||
		clientIp === '127.0.0.1' ||
		clientIp === '::1' ||
		event.url.hostname === 'localhost' ||
		event.url.hostname === '127.0.0.1';

	if (botCategory && !isLocalDev && shouldLogBot(clientIp, botCategory)) {
		try {
			const logPromise = getDb(platform)
				.insert(schema.botLogs)
				.values({
					id: crypto.randomUUID(),
					ipAddress: clientIp,
					userAgent: userAgent.slice(0, 300),
					botCategory,
					threatLevel,
					pathVisited: pathname,
					actionTaken: 'allowed'
				})
				.catch((err) => console.error('Failed to log bot telemetry:', err));

			if (platform?.ctx?.waitUntil) {
				platform.ctx.waitUntil(logPromise);
			}
		} catch (err) {
			console.error('Failed to init db for bot telemetry:', err);
		}
	}

	// 6. Real-Time Storefront Visitor & Traffic Telemetry (Non-admin, non-bot GET requests)
	const isStorefrontVisit =
		event.request.method === 'GET' &&
		!botCategory &&
		!pathname.startsWith('/admin') &&
		!pathname.startsWith('/api') &&
		!pathname.startsWith('/_app') &&
		!pathname.startsWith('/images') &&
		!pathname.includes('.');

	if (isStorefrontVisit) {
		let vSid = event.cookies.get('v_sid');
		if (!vSid) {
			vSid = crypto.randomUUID();
			try {
				event.cookies.set('v_sid', vSid, {
					path: '/',
					httpOnly: true,
					maxAge: 60 * 60 * 24 * 30, // 30 days
					sameSite: 'lax'
				});
			} catch {
				// Cookie setting might fail on certain internal calls
			}
		}

		try {
			const cf = (event.request as any).cf;
			const city = cf?.city || event.request.headers.get('cf-ipcity') || 'Dhaka';
			const country = cf?.country || event.request.headers.get('cf-ipcountry') || 'BD';
			const referrer = event.request.headers.get('referer') || '';
			const searchParams = event.url.searchParams;

			const visitTask = VisitorAnalyticsService.recordVisit(getDb(platform), {
				sessionId: vSid,
				ipAddress: clientIp,
				city,
				country,
				userAgent,
				path: pathname,
				pageTitle: pathname === '/' ? 'হোমপেজ' : pathname,
				referrer,
				utmSource: searchParams.get('utm_source') || undefined,
				utmMedium: searchParams.get('utm_medium') || undefined,
				utmCampaign: searchParams.get('utm_campaign') || undefined,
				fbclid: searchParams.get('fbclid') || undefined,
				ttclid: searchParams.get('ttclid') || undefined,
				gclid: searchParams.get('gclid') || undefined
			}).catch((err) => console.warn('Visitor telemetry recording error:', err));

			if (platform?.ctx?.waitUntil) {
				platform.ctx.waitUntil(visitTask);
			}
		} catch (err) {
			console.warn('Failed to dispatch visitor telemetry:', err);
		}
	}

	const response = await resolve(event);

	// Show admin changes on the storefront immediately, at least on this isolate.
	if (protectedArea && event.request.method !== 'GET') {
		clearCache();
	}

	return response;
};

export const handle: Handle = async (input) => {
	const response = await handleRequest(input);
	try {
		response.headers.set('X-Content-Type-Options', 'nosniff');
		response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
		// SAMEORIGIN, not DENY: the admin landing page preview may use an iframe.
		response.headers.set('X-Frame-Options', 'SAMEORIGIN');
		response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
		if (input.event.url.protocol === 'https:') {
			response.headers.set('Strict-Transport-Security', 'max-age=31536000');
		}
	} catch {
		// Responses such as Response.redirect() have immutable headers.
	}
	return response;
};

export const handleError: HandleServerError = (input) => {
	// Errors raised on purpose, such as a 404 or error(404, '...'), already have a safe message.
	if (input.kind !== 'unknown') {
		return { message: input.error.message };
	}

	// Anything else is unexpected: log the details and show the visitor only a reference.
	const errorId = crypto.randomUUID();
	console.error(`SERVER ERROR ${errorId} AT`, input.event.url.pathname, ':', input.error);
	return {
		message: 'সার্ভারে একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
		errorId
	};
};
