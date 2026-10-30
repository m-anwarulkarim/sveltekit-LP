import { eq } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import { normalizeBdPhone } from '../utils/phone';
import { CourierService } from './courier.service';

export interface FraudRiskAssessment {
	phone: string;
	totalParcels: number;
	deliveredParcels: number;
	cancelledParcels: number;
	successRate: number;
	riskTag: 'Low Risk' | 'Moderate' | 'High Risk';
	isCached: boolean;
	requiresAdvancePayment: boolean;
	courierName?: string;
	badgeLabel?: string;
	isConfigured?: boolean;
}

/**
 * Enterprise Fraud & Courier Delivery Telemetry Service
 * Dynamically queries configured courier services (Steadfast, Pathao, or both)
 */
export class FraudService {
	private static readonly CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 Hours

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

		// 1. Fetch store's active courier settings FIRST to see if any real courier is configured
		let courierSettings = { methods: [] as any[] };
		try {
			courierSettings = await CourierService.getCourierSettings(db);
		} catch (err) {
			console.error('Failed to get courier settings for fraud check:', err);
		}

		const steadfastMethod = courierSettings.methods.find(
			(m) => m.id === 'steadfast' && m.isEnabled && m.credentials?.apiKey && m.credentials?.secretKey
		);
		const pathaoMethod = courierSettings.methods.find(
			(m) =>
				m.id === 'pathao' &&
				m.isEnabled &&
				m.credentials?.apiKey &&
				m.credentials?.secretKey &&
				m.credentials?.username &&
				m.credentials?.password
		);

		let isConfigured = !!(steadfastMethod || pathaoMethod);

		// If no courier API is configured, return unconfigured status immediately!
		if (!isConfigured) {
			return {
				phone,
				totalParcels: 0,
				deliveredParcels: 0,
				cancelledParcels: 0,
				successRate: 100,
				riskTag: 'Low Risk',
				isCached: false,
				requiresAdvancePayment: false,
				courierName: 'কোনো কুরিয়ার যুক্ত নেই',
				badgeLabel: 'API আনকনফিগার্ড',
				isConfigured: false
			};
		}

		// 2. Check in-database courier fraud cache if not force refreshing (Only if courier IS configured)
		if (!forceRefresh) {
			try {
				const cached = await db
					.select()
					.from(schema.courierFraudCache)
					.where(eq(schema.courierFraudCache.phone, phone))
					.get();

				if (cached && now - new Date(cached.lastCheckedAt).getTime() < this.CACHE_TTL_MS) {
					const successRate = cached.successRate ?? 100;
					const total = cached.totalParcels ?? 0;
					const isNewCustomer = total === 0 || ((cached.deliveredParcels ?? 0) === 0 && (cached.cancelledParcels ?? 0) === 0);

					return {
						phone,
						totalParcels: total,
						deliveredParcels: cached.deliveredParcels ?? 0,
						cancelledParcels: cached.cancelledParcels ?? 0,
						successRate: isNewCustomer ? 100 : successRate,
						riskTag: isNewCustomer ? 'Low Risk' : ((cached.riskTag as any) || (successRate >= 80 ? 'Low Risk' : successRate >= 50 ? 'Moderate' : 'High Risk')),
						isCached: true,
						requiresAdvancePayment: !isNewCustomer && successRate < 50 && total >= 3,
						courierName: cached.courierName || 'Steadfast & Pathao',
						badgeLabel: this.getBadgeLabel(cached.courierName || ''),
						isConfigured: true
					};
				}
			} catch (cacheErr) {
				console.warn('Courier fraud cache read error:', cacheErr);
			}
		}

		let totalParcels = 0;
		let deliveredParcels = 0;
		let cancelledParcels = 0;
		let successRate = 100;
		let courierName = 'কুরিয়ার এপিআই কনফিগার করা নেই';
		let badgeLabel = 'API আনকনফিগার্ড';

		// 3. Query couriers based on what is added/configured
		if (steadfastMethod && pathaoMethod) {
			// BOTH STEADFAST & PATHAO CONFIGURED: Query both concurrently
			isConfigured = true;
			const [stResult, paResult] = await Promise.allSettled([
				this.fetchSteadfastFraud(phone, steadfastMethod.credentials),
				this.fetchPathaoFraud(phone, pathaoMethod.credentials)
			]);

			const stData = stResult.status === 'fulfilled' ? stResult.value : null;
			const paData = paResult.status === 'fulfilled' ? paResult.value : null;

			if (stData && paData) {
				totalParcels = stData.total + paData.total;
				deliveredParcels = stData.delivered + paData.delivered;
				cancelledParcels = stData.cancelled + paData.cancelled;
				courierName = 'Steadfast + Pathao (সমন্বিত)';
				badgeLabel = 'STEADFAST + PATHAO';
			} else if (stData) {
				totalParcels = stData.total;
				deliveredParcels = stData.delivered;
				cancelledParcels = stData.cancelled;
				courierName = 'Steadfast Courier';
				badgeLabel = 'STEADFAST LIVE';
			} else if (paData) {
				totalParcels = paData.total;
				deliveredParcels = paData.delivered;
				cancelledParcels = paData.cancelled;
				courierName = 'Pathao Courier';
				badgeLabel = 'PATHAO LIVE';
			}
		} else if (steadfastMethod) {
			// ONLY STEADFAST CONFIGURED
			isConfigured = true;
			courierName = 'Steadfast Courier';
			badgeLabel = 'STEADFAST LIVE';

			const stData = await this.fetchSteadfastFraud(phone, steadfastMethod.credentials);
			if (stData) {
				totalParcels = stData.total;
				deliveredParcels = stData.delivered;
				cancelledParcels = stData.cancelled;
			}
		} else if (pathaoMethod) {
			// ONLY PATHAO CONFIGURED
			isConfigured = true;
			courierName = 'Pathao Courier';
			badgeLabel = 'PATHAO LIVE';

			const paData = await this.fetchPathaoFraud(phone, pathaoMethod.credentials);
			if (paData) {
				totalParcels = paData.total;
				deliveredParcels = paData.delivered;
				cancelledParcels = paData.cancelled;
			}
		}

		// 4. Fallback to local store records if no courier API is configured or all remote calls returned null
		if (!isConfigured) {
			try {
				const customerOrders = await db
					.select({
						id: schema.orders.id,
						status: schema.orders.status
					})
					.from(schema.orders)
					.where(eq(schema.orders.customerPhone, phone));

				// Past finalized orders (excluding pending)
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

		// Calculate realistic success rate
		if (totalParcels > 0) {
			successRate = Math.round((deliveredParcels / totalParcels) * 100);
		} else {
			// New customer with 0 history is NEVER 0% risk!
			successRate = 100;
		}

		const isNew = totalParcels === 0 || (deliveredParcels === 0 && cancelledParcels === 0);
		const riskTag = isNew
			? 'Low Risk'
			: successRate >= 80
				? 'Low Risk'
				: successRate >= 50
					? 'Moderate'
					: 'High Risk';

		// 5. Update or insert into cache if courier is configured
		if (isConfigured) {
			try {
				await db
					.insert(schema.courierFraudCache)
					.values({
						phone,
						totalParcels,
						deliveredParcels,
						cancelledParcels,
						successRate,
						courierName,
						riskTag,
						lastCheckedAt: new Date()
					})
					.onConflictDoUpdate({
						target: schema.courierFraudCache.phone,
						set: {
							totalParcels,
							deliveredParcels,
							cancelledParcels,
							successRate,
							courierName,
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
			riskTag,
			isCached: false,
			requiresAdvancePayment: !isNew && riskTag === 'High Risk',
			courierName,
			badgeLabel,
			isConfigured
		};
	}

	/**
	 * Queries Steadfast Live Fraud Check API
	 */
	private static async fetchSteadfastFraud(
		phone: string,
		credentials: Record<string, string>
	): Promise<{ total: number; delivered: number; cancelled: number; successRate: number } | null> {
		const apiKey = credentials.apiKey;
		const secretKey = credentials.secretKey;
		if (!apiKey || !secretKey) return null;

		try {
			const res = await fetch(`https://portal.packzy.com/api/v1/fraud_check/score/${phone}`, {
				method: 'GET',
				headers: {
					'Api-Key': apiKey,
					'Secret-Key': secretKey,
					'Content-Type': 'application/json'
				},
				signal: AbortSignal.timeout(6000)
			});

			if (!res.ok) {
				console.warn('Steadfast fraud API response status:', res.status);
				return null;
			}

			const data = (await res.json()) as any;
			const total = Number(data.total_parcels ?? data.Total_parcels ?? data.total ?? 0);
			const delivered = Number(data.total_delivered ?? data.delivered ?? 0);
			const cancelled = Number(data.total_cancelled ?? data.cancelled ?? 0);
			const successRate = total > 0 ? Math.round((delivered / total) * 100) : 100;

			return { total, delivered, cancelled, successRate };
		} catch (err) {
			console.error('Steadfast fraud fetch error:', err);
			return null;
		}
	}

	/**
	 * Queries Pathao Live Success Rate API
	 */
	private static async fetchPathaoFraud(
		phone: string,
		credentials: Record<string, string>
	): Promise<{ total: number; delivered: number; cancelled: number; successRate: number } | null> {
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
				pData.success_rate ?? (total > 0 ? Math.round((delivered / total) * 100) : 100)
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
