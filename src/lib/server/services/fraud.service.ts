import { eq } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import { normalizeBdPhone } from '../utils/phone';
import { CourierService } from './courier.service';
import { SettingsService } from './settings.service';

export interface CourierStatsBreakdown {
	total: number;
	delivered: number;
	cancelled: number;
	successRate: number;
	returned?: number;
	partialDelivered?: number;
	fraudReported?: number;
	codAmount?: number;
}

export type FraudApiStatus = 'ok' | 'rate_limited' | 'auth_failed' | 'unavailable' | 'not_configured';

export interface FraudRiskAssessment {
	phone: string;
	totalParcels: number;
	deliveredParcels: number;
	cancelledParcels: number;
	successRate: number;
	successRateFormatted: string;
	riskTag: 'Safe' | 'Moderate' | 'High Risk';
	isCached: boolean;
	requiresAdvancePayment: boolean;
	courierName?: string;
	badgeLabel?: string;
	isConfigured?: boolean;
	apiStatus?: FraudApiStatus;
	apiMessage?: string;
	hasData?: boolean;
	byCourier?: {
		steadfast?: CourierStatsBreakdown;
		pathao?: CourierStatsBreakdown;
	};
}

type SteadfastFetchResult =
	| { ok: true; stats: CourierStatsBreakdown }
	| { ok: false; status: Exclude<FraudApiStatus, 'ok'>; message: string };

/**
 * Enterprise Fraud & Courier Delivery Telemetry Service
 * Dynamically queries configured courier services (Steadfast, Pathao, or both)
 */
export class FraudService {
	private static readonly CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 Hours
	// An empty result is often a transient courier-API failure rather than a real
	// zero-history customer, so it is retried far sooner than a populated one.
	private static readonly EMPTY_CACHE_TTL_MS = 10 * 60 * 1000; // 10 Minutes

	/**
	 * Inspects phone number delivery history across configured couriers
	 */
	static async checkPhoneRisk(
		db: DrizzleD1Database<typeof schema>,
		rawPhone: string,
		forceRefresh = false
	): Promise<FraudRiskAssessment> {
		const phone = normalizeBdPhone(rawPhone);
		const now = Date.now();

		// 1. Fetch store's active courier settings & dedicated fraud check settings
		let courierSettings = { methods: [] as any[] };
		try {
			courierSettings = await CourierService.getCourierSettings(db);
		} catch (err) {
			console.error('Failed to get courier settings for fraud check:', err);
		}

		let fraudSettings: any = {};
		try {
			fraudSettings = (await SettingsService.getSettingsGroup(db, 'fraud_check')) || {};
			if (!fraudSettings || Object.keys(fraudSettings).length === 0) {
				const singleRow = await db
					.select()
					.from(schema.storeSettings)
					.where(eq(schema.storeSettings.key, 'fraud_check'))
					.get();
				if (singleRow && singleRow.value) {
					try {
						fraudSettings = JSON.parse(singleRow.value);
					} catch {}
				}
			}
		} catch (err) {
			console.error('Failed to get fraud settings:', err);
		}

		const steadfastMethod = courierSettings.methods.find((m) => m.id === 'steadfast');
		const pathaoMethod = courierSettings.methods.find((m) => m.id === 'pathao');

		const stApiKey = (fraudSettings.steadFastApiKey || steadfastMethod?.credentials?.apiKey || '').trim();
		const stSecretKey = (fraudSettings.steadFastSecretKey || steadfastMethod?.credentials?.secretKey || '').trim();
		const hasSteadfast = !!(stApiKey && stSecretKey);

		console.log(`[FraudCheck] Phone: ${phone}, Steadfast configured: ${hasSteadfast}, API Key present: ${!!stApiKey}, Secret present: ${!!stSecretKey}`);

		const paApiKey = (fraudSettings.pathaoApiKey || pathaoMethod?.credentials?.apiKey || '').trim();
		const paSecret = (fraudSettings.pathaoSecret || pathaoMethod?.credentials?.secretKey || '').trim();
		const paUser = (fraudSettings.pathaoUsername || pathaoMethod?.credentials?.username || '').trim();
		const paPass = (fraudSettings.pathaoPassword || pathaoMethod?.credentials?.password || '').trim();
		const hasPathao = !!(paApiKey && paSecret && paUser && paPass);

		const isConfigured = hasSteadfast || hasPathao;

		// 2. Check in-database courier fraud cache if not force refreshing (Only if courier IS configured)
		if (!forceRefresh && isConfigured) {
			try {
				const cached = await db
					.select()
					.from(schema.courierFraudCache)
					.where(eq(schema.courierFraudCache.phone, phone))
					.get();

				const cachedTotal = cached?.totalParcels ?? 0;
				const ttl = cachedTotal > 0 ? this.CACHE_TTL_MS : this.EMPTY_CACHE_TTL_MS;

				if (cached && now - new Date(cached.lastCheckedAt).getTime() < ttl) {
					const total = cachedTotal;
					const delivered = cached.deliveredParcels ?? 0;
					const cancelled = cached.cancelledParcels ?? 0;
					const isNewCustomer = total === 0 || (delivered === 0 && cancelled === 0);
					const successRate = total > 0 ? Math.round(((delivered / total) * 100) * 100) / 100 : 0;
					const successRateFormatted = total > 0
						? `${((delivered / total) * 100).toFixed(2).replace(/\.00$/, '')}%`
						: 'N/A';

					let byCourier: { steadfast?: CourierStatsBreakdown; pathao?: CourierStatsBreakdown } | undefined = undefined;
					let displayName = cached.courierName || 'Steadfast & Pathao';

					if (cached.courierName && cached.courierName.startsWith('{')) {
						try {
							const parsedMeta = JSON.parse(cached.courierName);
							byCourier = parsedMeta.byCourier;
							displayName = parsedMeta.name || displayName;
						} catch {}
					}

					const riskTag: 'Safe' | 'Moderate' | 'High Risk' = isNewCustomer
						? 'Safe'
						: successRate >= 70
							? 'Safe'
							: successRate >= 50
								? 'Moderate'
								: 'High Risk';

					return {
						phone,
						totalParcels: total,
						deliveredParcels: delivered,
						cancelledParcels: cancelled,
						successRate,
						successRateFormatted,
						riskTag,
						isCached: true,
						requiresAdvancePayment: !isNewCustomer && successRate < 50 && total >= 3,
						courierName: displayName,
						badgeLabel: this.getBadgeLabel(displayName),
						isConfigured: true,
						byCourier
					};
				}
			} catch (cacheErr) {
				console.warn('Courier fraud cache read error:', cacheErr);
			}
		}

		let totalParcels = 0;
		let deliveredParcels = 0;
		let cancelledParcels = 0;
		let courierName = 'কুরিয়ার এপিআই কনফিগার করা নেই';
		let badgeLabel = 'API আনকনফিগার্ড';
		const byCourier: { steadfast?: CourierStatsBreakdown; pathao?: CourierStatsBreakdown } = {};

		// 3. Query couriers based on what is added/configured
		if (hasSteadfast && hasPathao) {
			// BOTH STEADFAST & PATHAO CONFIGURED: Query both concurrently
			const [stResult, paResult] = await Promise.allSettled([
				this.fetchSteadfastFraud(phone, { apiKey: stApiKey, secretKey: stSecretKey }),
				this.fetchPathaoFraud(phone, { apiKey: paApiKey, secretKey: paSecret, username: paUser, password: paPass })
			]);

			const stData = stResult.status === 'fulfilled' ? stResult.value : null;
			const paData = paResult.status === 'fulfilled' ? paResult.value : null;

			if (stData) {
				byCourier.steadfast = stData;
				totalParcels += stData.total;
				deliveredParcels += stData.delivered;
				cancelledParcels += stData.cancelled;
			}

			if (paData) {
				byCourier.pathao = paData;
				totalParcels += paData.total;
				deliveredParcels += paData.delivered;
				cancelledParcels += paData.cancelled;
			}

			if (stData && paData) {
				courierName = 'Steadfast + Pathao (সমন্বিত)';
				badgeLabel = 'STEADFAST + PATHAO';
			} else if (stData) {
				courierName = 'Steadfast Courier';
				badgeLabel = 'STEADFAST LIVE';
			} else if (paData) {
				courierName = 'Pathao Courier';
				badgeLabel = 'PATHAO LIVE';
			}
		} else if (hasSteadfast) {
			// ONLY STEADFAST CONFIGURED
			courierName = 'Steadfast Courier';
			badgeLabel = 'STEADFAST LIVE';

			const stData = await this.fetchSteadfastFraud(phone, { apiKey: stApiKey, secretKey: stSecretKey });
			if (stData) {
				byCourier.steadfast = stData;
				totalParcels = stData.total;
				deliveredParcels = stData.delivered;
				cancelledParcels = stData.cancelled;
			}
		} else if (hasPathao) {
			// ONLY PATHAO CONFIGURED
			courierName = 'Pathao Courier';
			badgeLabel = 'PATHAO LIVE';

			const paData = await this.fetchPathaoFraud(phone, { apiKey: paApiKey, secretKey: paSecret, username: paUser, password: paPass });
			if (paData) {
				byCourier.pathao = paData;
				totalParcels = paData.total;
				deliveredParcels = paData.delivered;
				cancelledParcels = paData.cancelled;
			}
		}

		// 4. Fallback to local store records if no courier API is configured or remote calls returned 0
		if (!isConfigured) {
			try {
				const customerOrders = await db
					.select({
						id: schema.orders.id,
						status: schema.orders.status
					})
					.from(schema.orders)
					.where(eq(schema.orders.customerPhone, phone));

				const delivered = customerOrders.filter((o) => o.status === 'delivered').length;
				const cancelled = customerOrders.filter(
					(o) => o.status === 'cancelled' || o.status === 'returned'
				).length;
				const localTotal = delivered + cancelled;

				if (localTotal > 0) {
					totalParcels = localTotal;
					deliveredParcels = delivered;
					cancelledParcels = cancelled;
					courierName = 'লোকাল স্টোর রেকর্ড';
					badgeLabel = 'LOCAL STORE';
				} else {
					totalParcels = 0;
					deliveredParcels = 0;
					cancelledParcels = 0;
					courierName = 'লোকাল রেকর্ড (নতুন কাস্টমার)';
					badgeLabel = 'নতুন কাস্টমার';
				}
			} catch (e) {
				console.error('Local customer orders lookup failed:', e);
			}
		}

		const successRate = totalParcels > 0
			? Math.round(((deliveredParcels / totalParcels) * 100) * 100) / 100
			: 0;
		const successRateFormatted = totalParcels > 0
			? `${((deliveredParcels / totalParcels) * 100).toFixed(2).replace(/\.00$/, '')}%`
			: 'N/A';

		const isNew = totalParcels === 0 || (deliveredParcels === 0 && cancelledParcels === 0);
		const riskTag: 'Safe' | 'Moderate' | 'High Risk' = isNew
			? 'Safe'
			: successRate >= 70
				? 'Safe'
				: successRate >= 50
					? 'Moderate'
					: 'High Risk';

		// 5. Update or insert into cache if courier is configured
		if (isConfigured) {
			try {
				const cacheJson = JSON.stringify({
					name: courierName,
					byCourier: Object.keys(byCourier).length > 0 ? byCourier : undefined
				});

				await db
					.insert(schema.courierFraudCache)
					.values({
						phone,
						totalParcels,
						deliveredParcels,
						cancelledParcels,
						successRate: Math.round(successRate),
						courierName: cacheJson,
						riskTag,
						lastCheckedAt: new Date()
					})
					.onConflictDoUpdate({
						target: schema.courierFraudCache.phone,
						set: {
							totalParcels,
							deliveredParcels,
							cancelledParcels,
							successRate: Math.round(successRate),
							courierName: cacheJson,
							riskTag,
							lastCheckedAt: new Date()
						}
					});
			} catch (cacheWriteErr) {
				console.warn('Courier fraud cache write error:', cacheWriteErr);
			}
		}

		return {
			phone,
			totalParcels,
			deliveredParcels,
			cancelledParcels,
			successRate,
			successRateFormatted,
			riskTag,
			isCached: false,
			requiresAdvancePayment: !isNew && riskTag === 'High Risk',
			courierName,
			badgeLabel,
			isConfigured,
			byCourier: Object.keys(byCourier).length > 0 ? byCourier : undefined
		};
	}

	/**
	 * Queries the Steadfast fraud-check API.
	 *
	 * Steadfast meters this endpoint to a small allowance of lookups per account
	 * and answers 429 once it is gone, so exactly one request is made per call.
	 * Earlier revisions probed a list of candidate URLs in sequence, which spent
	 * the entire allowance within a few page loads.
	 */
	private static async fetchSteadfastFraud(
		phone: string,
		credentials: Record<string, string>
	): Promise<SteadfastFetchResult> {
		const apiKey = (credentials.apiKey || '').trim();
		const secretKey = (credentials.secretKey || '').trim();
		if (!apiKey || !secretKey) {
			return { ok: false, status: 'not_configured', message: 'Steadfast API Key/Secret কনফিগার করা নেই।' };
		}

		const cleanPhone = normalizeBdPhone(phone);
		if (!cleanPhone) {
			return { ok: false, status: 'unavailable', message: 'ফোন নম্বরটি সঠিক নয়।' };
		}

		const url = `https://portal.packzy.com/api/v1/fraud_check/score/${cleanPhone}`;

		try {
			const res = await fetch(url, {
				method: 'GET',
				headers: {
					'Api-Key': apiKey,
					'Secret-Key': secretKey,
					'Content-Type': 'application/json',
					Accept: 'application/json'
				},
				signal: AbortSignal.timeout(8000)
			});

			const rawText = await res.text();
			let data: any = null;
			try {
				data = JSON.parse(rawText);
			} catch {
				/* non-JSON body is classified below */
			}

			if (res.status === 429) {
				const limit = Number(data?.limit ?? 0);
				const current = Number(data?.current ?? 0);
				const detail = limit > 0 ? ` (${current}/${limit})` : '';
				return {
					ok: false,
					status: 'rate_limited',
					message: `Steadfast ফ্রড চেক লিমিট শেষ${detail}। লিমিট বাড়াতে Steadfast-এর সাথে যোগাযোগ করুন।`
				};
			}

			if (res.status === 401 || res.status === 403) {
				return {
					ok: false,
					status: 'auth_failed',
					message: 'Steadfast API Key/Secret সঠিক নয় অথবা ফ্রড চেক পারমিশন নেই।'
				};
			}

			if (!res.ok) {
				console.warn(`[FraudCheck] Steadfast returned ${res.status}:`, rawText.slice(0, 200));
				return {
					ok: false,
					status: 'unavailable',
					message: `Steadfast সার্ভার সাড়া দেয়নি (HTTP ${res.status})।`
				};
			}

			if (!data) {
				return { ok: false, status: 'unavailable', message: 'Steadfast থেকে অপ্রত্যাশিত উত্তর এসেছে।' };
			}

			const parsed = this.extractSteadfastStats(data);
			if (parsed) return { ok: true, stats: parsed };

			console.warn('[FraudCheck] Unrecognized Steadfast payload:', JSON.stringify(data).slice(0, 500));
			return { ok: false, status: 'unavailable', message: 'Steadfast ডেটার ফরম্যাট চেনা যায়নি।' };
		} catch (err: any) {
			console.warn('[FraudCheck] Steadfast fetch error:', err?.message);
			return { ok: false, status: 'unavailable', message: 'Steadfast সার্ভারে সংযোগ করা যায়নি।' };
		}
	}

	/**
	 * Steadfast nests this payload inconsistently, so values are located by key
	 * name at any depth rather than by a fixed path. Returns null when nothing
	 * recognizable is present, so the caller reports an API fault rather than
	 * describing a real customer as having no delivery history.
	 */
	private static extractSteadfastStats(data: any): CourierStatsBreakdown | null {
		const found = new Map<string, number>();

		const walk = (node: any, depth: number) => {
			if (!node || typeof node !== 'object' || depth > 6) return;
			for (const [key, value] of Object.entries(node)) {
				if (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '' && !isNaN(Number(value)))) {
					const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, '');
					if (!found.has(normalizedKey)) found.set(normalizedKey, Number(value));
				} else if (typeof value === 'object') {
					walk(value, depth + 1);
				}
			}
		};
		walk(data, 0);

		const pick = (...keys: string[]): number | undefined => {
			for (const k of keys) {
				const v = found.get(k);
				if (v !== undefined) return v;
			}
			return undefined;
		};

		const total = pick('totalparcels', 'parcelvolume', 'totalparcel', 'consignmentcount', 'totalorder', 'totalorders', 'total');
		const delivered = pick('totaldelivered', 'deliveredparcel', 'deliveredparcels', 'delivered', 'successparcel', 'deliverycount', 'success');
		const cancelled = pick('totalcancelled', 'cancelledparcel', 'cancelledparcels', 'cancelled', 'canceledparcel', 'canceled', 'cancelcount', 'cancel');
		const deliveryPct = pick('deliverypercentage', 'deliveredpercentage', 'successrate', 'deliveryratio', 'score');
		const cancelPct = pick('cancelpercentage', 'cancelledpercentage', 'canceledpercentage');

		const returned = pick('totalreturned', 'returnedparcel', 'returned', 'returncount') ?? 0;
		const partialDelivered = pick('totalpartialdelivered', 'partialdelivered', 'partialdeliverycount') ?? 0;
		const fraudReported = pick('fraudreported', 'merchantreports', 'merchantreport', 'reported', 'reportcount', 'flagged', 'totalreports') ?? 0;
		const codAmount = pick('totalcod', 'codamount') ?? 0;

		// Counts present: authoritative.
		if (delivered !== undefined || cancelled !== undefined) {
			const d = delivered ?? 0;
			const c = cancelled ?? 0;
			const t = total ?? d + c;
			return {
				total: t,
				delivered: d,
				cancelled: c,
				successRate: t > 0 ? Math.round((d / t) * 100) : 0,
				returned,
				partialDelivered,
				fraudReported,
				codAmount
			};
		}

		// Only a volume + percentages came back: reconstruct the counts.
		if (total !== undefined && total > 0 && (deliveryPct !== undefined || cancelPct !== undefined)) {
			const d = Math.round(((deliveryPct ?? 0) / 100) * total);
			const c = cancelPct !== undefined ? Math.round((cancelPct / 100) * total) : Math.max(total - d, 0);
			return {
				total,
				delivered: d,
				cancelled: c,
				successRate: Math.round((d / total) * 100),
				returned,
				partialDelivered,
				fraudReported,
				codAmount
			};
		}

		// A genuine zero-history customer still reports a volume of 0.
		if (total === 0) {
			return {
				total: 0,
				delivered: 0,
				cancelled: 0,
				successRate: 0,
				returned,
				partialDelivered,
				fraudReported,
				codAmount
			};
		}

		return null;
	}

	/**
	 * Queries Pathao Live Success Rate API
	 */
	private static async fetchPathaoFraud(
		phone: string,
		credentials: Record<string, string>
	): Promise<CourierStatsBreakdown | null> {
		const { apiKey, secretKey, username, password } = credentials;
		if (!apiKey || !secretKey || !username || !password) return null;

		try {
			// 1. Issue Token
			const tokenRes = await fetch('https://api-hermes.pathao.com/aladdin/api/v1/issue-token', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json'
				},
				body: JSON.stringify({
					client_id: apiKey,
					client_secret: secretKey,
					username,
					password,
					grant_type: 'password'
				}),
				signal: AbortSignal.timeout(6000)
			});

			if (!tokenRes.ok) {
				console.warn('Pathao token issue failed:', tokenRes.status);
				return null;
			}

			const tokenData = (await tokenRes.json()) as any;
			const accessToken = tokenData?.access_token;
			if (!accessToken) return null;

			// 2. Fetch success rate
			const successRes = await fetch('https://api-hermes.pathao.com/aladdin/api/v1/user/success-rate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
					Authorization: `Bearer ${accessToken}`
				},
				body: JSON.stringify({ phone }),
				signal: AbortSignal.timeout(6000)
			});

			if (!successRes.ok) {
				console.warn('Pathao success-rate request failed:', successRes.status);
				return null;
			}

			const result = (await successRes.json()) as any;
			const pData = result?.data || {};
			const total = Number(pData.total ?? 0);
			const delivered = Number(pData.success ?? 0);
			const cancelled = Number(pData.cancel ?? 0);
			const successRate = Number(
				pData.success_rate ?? (total > 0 ? Math.round((delivered / total) * 100) : 0)
			);

			return {
				total,
				delivered,
				cancelled,
				successRate
			};
		} catch (err) {
			console.error('Pathao fraud check fetch error:', err);
			return null;
		}
	}

	private static getBadgeLabel(name: string): string {
		const lower = name.toLowerCase();
		if (lower.includes('steadfast') && lower.includes('pathao')) return 'STEADFAST + PATHAO';
		if (lower.includes('steadfast')) return 'STEADFAST LIVE';
		if (lower.includes('pathao')) return 'PATHAO LIVE';
		return 'COURIER';
	}

	/**
	 * Automatically checks and flags risky orders with an alert note
	 */
	static async evaluateAndFlagOrder(
		db: DrizzleD1Database<typeof schema>,
		orderId: string,
		phone: string
	) {
		try {
			const assessment = await this.checkPhoneRisk(db, phone);

			if (assessment.riskTag === 'High Risk' && assessment.totalParcels >= 2) {
				await db.insert(schema.orderNotes).values({
					id: crypto.randomUUID(),
					orderId,
					adminName: 'Fraud Sentinel AI',
					note: `⚠️ সতর্কতা: কাস্টমারের ডেলিভারি সাকসেস রেট মাত্র ${assessment.successRate}% (${assessment.courierName})। পার্সেল পাঠানোর পূর্বে কুরিয়ার চার্জ অগ্রিম নেওয়ার পরামর্শ দেওয়া হলো।`,
					callStatus: 'customer_note'
				});
			}
		} catch (e) {
			console.error('Fraud evaluation failed:', e);
		}
	}
}
