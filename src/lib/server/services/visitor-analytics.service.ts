import { eq, desc, sql, and, gte } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export interface RecordVisitParams {
	sessionId: string;
	ipAddress?: string;
	city?: string;
	country?: string;
	userAgent?: string;
	path: string;
	pageTitle?: string;
	referrer?: string;
	utmSource?: string;
	utmMedium?: string;
	utmCampaign?: string;
	fbclid?: string;
	ttclid?: string;
	gclid?: string;
	isAdmin?: boolean;
}

export interface LiveTrafficSummary {
	activeNow: number;
	todaySessions: number;
	todayPageviews: number;
	conversionRate: number;
	topSource: string;
	sourcesBreakdown: { source: string; count: number; percentage: number }[];
	deviceBreakdown: { device: string; count: number; percentage: number }[];
	topPages: { path: string; title: string; views: number }[];
	topCities: { city: string; count: number }[];
	adminVisitsCount: number;
	recentVisitors: {
		id: string;
		sessionId: string;
		path: string;
		pageTitle: string;
		trafficSource: string;
		deviceType: string;
		city: string;
		ipAddress: string;
		isAdmin: boolean;
		createdAt: number;
	}[];
}

export class VisitorAnalyticsService {
	/**
	 * Classifies user-agent string into device type, OS, and browser
	 */
	static parseUserAgent(ua: string): { deviceType: 'mobile' | 'desktop' | 'tablet'; os: string; browser: string } {
		const lower = (ua || '').toLowerCase();

		let deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop';
		if (/ipad|tablet|(android(?!.*mobile))/i.test(lower)) {
			deviceType = 'tablet';
		} else if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|silk/i.test(lower)) {
			deviceType = 'mobile';
		}

		let os = 'Other';
		if (/android/i.test(lower)) os = 'Android';
		else if (/iphone|ipad|ipod/i.test(lower)) os = 'iOS';
		else if (/windows/i.test(lower)) os = 'Windows';
		else if (/macintosh|mac os/i.test(lower)) os = 'macOS';
		else if (/linux/i.test(lower)) os = 'Linux';

		let browser = 'Other';
		if (/edg/i.test(lower)) browser = 'Edge';
		else if (/samsungbrowser/i.test(lower)) browser = 'Samsung Internet';
		else if (/opr|opera/i.test(lower)) browser = 'Opera';
		else if (/chrome|crios/i.test(lower)) browser = 'Chrome';
		else if (/safari/i.test(lower) && !/chrome|crios/i.test(lower)) browser = 'Safari';
		else if (/firefox|fxios/i.test(lower)) browser = 'Firefox';

		return { deviceType, os, browser };
	}

	/**
	 * Detects traffic source from UTM parameters, ad click IDs, and HTTP referrer
	 */
	static determineTrafficSource(params: RecordVisitParams): string {
		const utm = (params.utmSource || '').trim().toLowerCase();
		const ref = (params.referrer || '').trim().toLowerCase();
		const ua = (params.userAgent || '').toLowerCase();
		const ip = (params.ipAddress || '').toLowerCase();

		// Check for Meta / Facebook Ad Review & Compliance Crawlers
		if (
			ua.includes('facebookexternalhit') ||
			ua.includes('facebot') ||
			ua.includes('meta-externalagent') ||
			ua.includes('facebookcatalog') ||
			ip.startsWith('2a03:2880:')
		) {
			return 'Meta Ad Review Bot';
		}

		if (params.fbclid || utm === 'fb' || utm === 'facebook' || utm.includes('facebook')) return 'Facebook Ads';
		if (params.ttclid || utm === 'tiktok' || utm.includes('tiktok')) return 'TikTok Ads';
		if (params.gclid || utm === 'google' || utm.includes('google_ads')) return 'Google Ads';
		if (utm === 'whatsapp') return 'WhatsApp';

		if (ref.includes('facebook.com') || ref.includes('fb.me') || ref.includes('instagram.com')) return 'Facebook / IG';
		if (ref.includes('google.') || ref.includes('bing.') || ref.includes('yahoo.')) return 'Google Search';
		if (ref.includes('youtube.com')) return 'YouTube';
		if (ref.includes('tiktok.com')) return 'TikTok';
		if (ref.includes('wa.me') || ref.includes('whatsapp.com')) return 'WhatsApp';

		if (params.utmSource) return params.utmSource;

		if (!ref || ref === 'direct') return 'Direct';
		try {
			const refUrl = new URL(ref);
			return refUrl.hostname.replace('www.', '');
		} catch {
			return 'Direct';
		}
	}

	/**
	 * Records a visitor touchpoint asynchronously on Cloudflare Edge without blocking response
	 */
	static async recordVisit(db: DrizzleD1Database<typeof schema>, params: RecordVisitParams): Promise<void> {
		if (!params.sessionId || !params.path) return;

		const now = Date.now();
		const { deviceType, os, browser } = this.parseUserAgent(params.userAgent || '');
		const trafficSource = this.determineTrafficSource(params);
		const city = (params.city || '').trim() || 'Dhaka';
		const country = (params.country || '').trim() || 'BD';

		try {
			// 1. Check if session exists in visitor_sessions
			const existingSession = await db
				.select({ id: schema.visitorSessions.id, pageviewsCount: schema.visitorSessions.pageviewsCount })
				.from(schema.visitorSessions)
				.where(eq(schema.visitorSessions.sessionId, params.sessionId))
				.limit(1)
				.get();

			const isAdmin = params.isAdmin ?? false;

			if (existingSession) {
				await db
					.update(schema.visitorSessions)
					.set({
						lastActiveAt: new Date(now),
						lastPage: params.path,
						pageviewsCount: sql`${schema.visitorSessions.pageviewsCount} + 1`,
						...(isAdmin && { isAdmin: true })
					})
					.where(eq(schema.visitorSessions.id, existingSession.id));
			} else {
				await db.insert(schema.visitorSessions).values({
					sessionId: params.sessionId,
					ipAddress: params.ipAddress || null,
					city,
					country,
					deviceType,
					os,
					browser,
					referrer: params.referrer ? params.referrer.slice(0, 500) : null,
					trafficSource,
					utmSource: params.utmSource || null,
					utmMedium: params.utmMedium || null,
					utmCampaign: params.utmCampaign || null,
					firstPage: params.path,
					lastPage: params.path,
					pageviewsCount: 1,
					isAdmin,
					hasOrdered: false,
					lastActiveAt: new Date(now),
					createdAt: new Date(now)
				});
			}

			// 2. Insert into visitor_pageviews stream
			await db.insert(schema.visitorPageviews).values({
				sessionId: params.sessionId,
				path: params.path.slice(0, 300),
				pageTitle: (params.pageTitle || params.path).slice(0, 200),
				trafficSource,
				deviceType,
				city,
				isAdmin,
				createdAt: new Date(now)
			});
		} catch (err) {
			console.warn('[VisitorAnalytics] Failed to record visit:', err);
		}
	}

	/**
	 * Flags a visitor session as converted when they successfully place an order
	 */
	static async markConversion(db: DrizzleD1Database<typeof schema>, sessionId: string): Promise<void> {
		if (!sessionId) return;
		try {
			await db
				.update(schema.visitorSessions)
				.set({ hasOrdered: true })
				.where(eq(schema.visitorSessions.sessionId, sessionId));
		} catch (err) {
			console.warn('[VisitorAnalytics] Failed to mark conversion:', err);
		}
	}

	/**
	 * Computes Real-Time & Historical Traffic Summary for the Admin Dashboard
	 */
	static async getTrafficSummary(
		db: DrizzleD1Database<typeof schema>,
		timeRange: 'today' | '7days' | '30days' = 'today'
	): Promise<LiveTrafficSummary> {
		const now = Date.now();
		const fiveMinAgo = now - 5 * 60 * 1000;

		const DHAKA_UTC_OFFSET_MS = 6 * 60 * 60 * 1000;
		const DAY_MS = 24 * 60 * 60 * 1000;
		const startOfToday = Math.floor((now + DHAKA_UTC_OFFSET_MS) / DAY_MS) * DAY_MS - DHAKA_UTC_OFFSET_MS;

		let rangeStart = startOfToday;
		if (timeRange === '7days') rangeStart = now - 7 * DAY_MS;
		if (timeRange === '30days') rangeStart = now - 30 * DAY_MS;

		// 1. Live Active Visitors (last 5 min)
		const liveRow = await db
			.select({ count: sql<number>`count(*)` })
			.from(schema.visitorSessions)
			.where(gte(schema.visitorSessions.lastActiveAt, new Date(fiveMinAgo)))
			.get();
		const activeNow = Number(liveRow?.count) || 0;

		// 2. Period Session Count & Conversions
		const sessionStats = await db
			.select({
				total: sql<number>`count(*)`,
				converted: sql<number>`sum(case when ${schema.visitorSessions.hasOrdered} = 1 then 1 else 0 end)`,
				adminCount: sql<number>`sum(case when ${schema.visitorSessions.isAdmin} = 1 then 1 else 0 end)`
			})
			.from(schema.visitorSessions)
			.where(gte(schema.visitorSessions.createdAt, new Date(rangeStart)))
			.get();

		const todaySessions = Number(sessionStats?.total) || 0;
		const convertedCount = Number(sessionStats?.converted) || 0;
		const conversionRate = todaySessions > 0 ? Number(((convertedCount / todaySessions) * 100).toFixed(1)) : 0;
		const adminVisitsCount = Number(sessionStats?.adminCount) || 0;

		// 3. Period Pageviews Count
		const pvStats = await db
			.select({ count: sql<number>`count(*)` })
			.from(schema.visitorPageviews)
			.where(gte(schema.visitorPageviews.createdAt, new Date(rangeStart)))
			.get();
		const todayPageviews = Number(pvStats?.count) || 0;

		// 4. Traffic Sources Breakdown
		const sourceRows = await db
			.select({
				source: schema.visitorSessions.trafficSource,
				count: sql<number>`count(*)`
			})
			.from(schema.visitorSessions)
			.where(gte(schema.visitorSessions.createdAt, new Date(rangeStart)))
			.groupBy(schema.visitorSessions.trafficSource)
			.orderBy(desc(sql`count(*)`))
			.limit(6)
			.all();

		const totalSrc = sourceRows.reduce((acc, r) => acc + (Number(r.count) || 0), 0) || 1;
		const sourcesBreakdown = sourceRows.map((r) => ({
			source: r.source || 'Direct',
			count: Number(r.count) || 0,
			percentage: Math.round(((Number(r.count) || 0) / totalSrc) * 100)
		}));

		const topSource = sourcesBreakdown[0]?.source || 'Direct';

		// 5. Device Breakdown
		const deviceRows = await db
			.select({
				device: schema.visitorSessions.deviceType,
				count: sql<number>`count(*)`
			})
			.from(schema.visitorSessions)
			.where(gte(schema.visitorSessions.createdAt, new Date(rangeStart)))
			.groupBy(schema.visitorSessions.deviceType)
			.orderBy(desc(sql`count(*)`))
			.all();

		const totalDev = deviceRows.reduce((acc, r) => acc + (Number(r.count) || 0), 0) || 1;
		const deviceBreakdown = deviceRows.map((r) => ({
			device: r.device || 'mobile',
			count: Number(r.count) || 0,
			percentage: Math.round(((Number(r.count) || 0) / totalDev) * 100)
		}));

		// 6. Top Visited Pages
		const pageRows = await db
			.select({
				path: schema.visitorPageviews.path,
				title: schema.visitorPageviews.pageTitle,
				views: sql<number>`count(*)`
			})
			.from(schema.visitorPageviews)
			.where(gte(schema.visitorPageviews.createdAt, new Date(rangeStart)))
			.groupBy(schema.visitorPageviews.path)
			.orderBy(desc(sql`count(*)`))
			.limit(8)
			.all();

		const topPages = pageRows.map((r) => ({
			path: r.path,
			title: r.title || r.path,
			views: Number(r.views) || 0
		}));

		// 7. Top Cities
		const cityRows = await db
			.select({
				city: schema.visitorSessions.city,
				count: sql<number>`count(*)`
			})
			.from(schema.visitorSessions)
			.where(gte(schema.visitorSessions.createdAt, new Date(rangeStart)))
			.groupBy(schema.visitorSessions.city)
			.orderBy(desc(sql`count(*)`))
			.limit(6)
			.all();

		const topCities = cityRows.map((r) => ({
			city: r.city || 'ঢাকা',
			count: Number(r.count) || 0
		}));

		// 8. Recent Live Visitors / Pageviews Stream
		const recentRows = await db
			.select({
				id: schema.visitorPageviews.id,
				sessionId: schema.visitorPageviews.sessionId,
				path: schema.visitorPageviews.path,
				pageTitle: schema.visitorPageviews.pageTitle,
				trafficSource: schema.visitorPageviews.trafficSource,
				deviceType: schema.visitorPageviews.deviceType,
				city: schema.visitorPageviews.city,
				isAdmin: schema.visitorPageviews.isAdmin,
				createdAt: schema.visitorPageviews.createdAt
			})
			.from(schema.visitorPageviews)
			.orderBy(desc(schema.visitorPageviews.createdAt))
			.limit(30)
			.all();

		const recentVisitors = recentRows.map((r) => ({
			id: r.id,
			sessionId: r.sessionId,
			path: r.path,
			pageTitle: r.pageTitle || r.path,
			trafficSource: r.trafficSource || 'Direct',
			deviceType: r.deviceType || 'mobile',
			city: r.city || 'ঢাকা',
			ipAddress: '103.***.***',
			isAdmin: Boolean(r.isAdmin),
			createdAt: r.createdAt ? new Date(r.createdAt).getTime() : Date.now()
		}));

		return {
			activeNow,
			todaySessions,
			todayPageviews,
			conversionRate,
			topSource,
			sourcesBreakdown,
			deviceBreakdown,
			topPages,
			topCities,
			adminVisitsCount,
			recentVisitors
		};
	}
}
