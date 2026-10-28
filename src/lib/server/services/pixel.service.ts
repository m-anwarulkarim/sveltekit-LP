import { eq, and } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export type TrackingMode = 'native_direct' | 'capi_only' | 'disabled';
export type CatalogMatchKey = 'id' | 'sku';
export type ContentType = 'product' | 'product_group';

export interface MetaPixelSettings {
	trackingMode: TrackingMode;
	pixelId: string;
	backupPixelId?: string;
	capiToken: string;
	testEventCode?: string;
	defaultCurrency: string;
	catalogMatchKey: CatalogMatchKey;
	contentType: ContentType;
	events: {
		pageView: boolean;
		viewContent: boolean;
		addToCart: boolean;
		initiateCheckout: boolean;
		purchase: boolean;
	};
	advancedMatching: {
		enabled: boolean;
		matchPhone: boolean;
		matchEmail: boolean;
		matchName: boolean;
		matchCity: boolean;
	};
	enableCollaborativeAds: boolean;
	partnerSegmentId?: string;
	updatedAt?: string | number;
}

export const DEFAULT_PIXEL_SETTINGS: MetaPixelSettings = {
	trackingMode: 'native_direct',
	pixelId: '806385144697838',
	backupPixelId: '',
	capiToken: 'EAAQZCaLfr2KUBSw5YGLAS5uUNlyLllbFYrQQeCoMBP83lonTPvPJEMBS02zJOMOmplFSX',
	testEventCode: '',
	defaultCurrency: 'BDT',
	catalogMatchKey: 'id',
	contentType: 'product',
	events: {
		pageView: true,
		viewContent: true,
		addToCart: true,
		initiateCheckout: true,
		purchase: true
	},
	advancedMatching: {
		enabled: true,
		matchPhone: true,
		matchEmail: true,
		matchName: true,
		matchCity: true
	},
	enableCollaborativeAds: false,
	partnerSegmentId: ''
};

export class PixelService {
	/**
	 * SHA-256 hasher for Advanced Matching customer privacy compliance
	 */
	static async hashValue(val?: string | null): Promise<string | undefined> {
		if (!val) return undefined;
		const clean = val.trim().toLowerCase();
		if (!clean) return undefined;

		const encoder = new TextEncoder();
		const data = encoder.encode(clean);
		const hashBuffer = await crypto.subtle.digest('SHA-256', data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
	}

	/**
	 * Normalizes Bangladeshi and international phone numbers into E.164 digits format
	 */
	static normalizePhone(phone?: string | null): string | undefined {
		if (!phone) return undefined;
		let digits = phone.replace(/\D/g, '');
		if (digits.startsWith('01') && digits.length === 11) {
			digits = '88' + digits;
		}
		return digits || undefined;
	}

	/**
	 * Retrieves Meta Pixel Settings from D1 store_settings table
	 */
	static async getSettings(db: DrizzleD1Database<typeof schema>): Promise<MetaPixelSettings> {
		try {
			const row = await db
				.select()
				.from(schema.storeSettings)
				.where(and(eq(schema.storeSettings.group, 'tracking'), eq(schema.storeSettings.key, 'facebook_pixel')))
				.get();

			if (!row || !row.value) {
				return DEFAULT_PIXEL_SETTINGS;
			}

			const parsed = JSON.parse(row.value);
			return {
				...DEFAULT_PIXEL_SETTINGS,
				...parsed,
				events: {
					...DEFAULT_PIXEL_SETTINGS.events,
					...(parsed.events || {})
				},
				advancedMatching: {
					...DEFAULT_PIXEL_SETTINGS.advancedMatching,
					...(parsed.advancedMatching || {})
				}
			};
		} catch (err) {
			console.error('Failed to load facebook_pixel settings:', err);
			return DEFAULT_PIXEL_SETTINGS;
		}
	}

	/**
	 * Saves Meta Pixel Settings to D1 store_settings table
	 */
	static async saveSettings(
		db: DrizzleD1Database<typeof schema>,
		settings: MetaPixelSettings
	): Promise<boolean> {
		try {
			const jsonStr = JSON.stringify({
				...settings,
				updatedAt: new Date().toISOString()
			});

			const existing = await db
				.select()
				.from(schema.storeSettings)
				.where(and(eq(schema.storeSettings.group, 'tracking'), eq(schema.storeSettings.key, 'facebook_pixel')))
				.get();

			if (existing) {
				await db
					.update(schema.storeSettings)
					.set({
						value: jsonStr,
						updatedAt: new Date()
					})
					.where(eq(schema.storeSettings.id, existing.id));
			} else {
				await db.insert(schema.storeSettings).values({
					id: crypto.randomUUID(),
					group: 'tracking',
					key: 'facebook_pixel',
					value: jsonStr,
					updatedAt: new Date()
				});
			}

			return true;
		} catch (err) {
			console.error('Failed to save facebook_pixel settings:', err);
			return false;
		}
	}

	/**
	 * Inspects if Google Tag Manager (GTM) Container ID is configured in D1
	 */
	static async getGtmStatus(db: DrizzleD1Database<typeof schema>): Promise<{
		isGtmConfigured: boolean;
		gtmId?: string;
	}> {
		try {
			const row = await db
				.select()
				.from(schema.storeSettings)
				.where(and(eq(schema.storeSettings.group, 'tracking'), eq(schema.storeSettings.key, 'gtm')))
				.get();

			if (row && row.value) {
				try {
					const parsed = JSON.parse(row.value);
					if (parsed?.gtmId || parsed?.containerId) {
						return { isGtmConfigured: true, gtmId: parsed.gtmId || parsed.containerId };
					}
				} catch {
					if (row.value.trim().startsWith('GTM-')) {
						return { isGtmConfigured: true, gtmId: row.value.trim() };
					}
				}
			}
			return { isGtmConfigured: false };
		} catch {
			return { isGtmConfigured: false };
		}
	}

	/**
	 * Tests Meta Conversions API (CAPI) connectivity by sending a test event to Graph API
	 */
	static async testCapiConnection(
		pixelId: string,
		capiToken: string,
		testEventCode?: string
	): Promise<{ success: boolean; message: string; details?: any }> {
		if (!pixelId || !capiToken) {
			return {
				success: false,
				message: 'Pixel ID এবং CAPI Access Token উভয়ই প্রদান করা আবশ্যক।'
			};
		}

		const cleanPixelId = pixelId.trim();
		const cleanToken = capiToken.trim();

		// Construct test payload compliant with Meta Conversions API specifications
		const testPayload: Record<string, any> = {
			data: [
				{
					event_name: 'TestEvent',
					event_time: Math.floor(Date.now() / 1000),
					action_source: 'website',
					event_source_url: 'https://test-store.local/admin/settings/facebook-pixel',
					event_id: `TEST-${Date.now()}`,
					user_data: {
						client_user_agent: 'Meta CAPI Verification Probe / 2.0',
						em: [await this.hashValue('test.customer@example.com')],
						ph: [await this.hashValue('8801700000000')]
					},
					custom_data: {
						currency: 'BDT',
						value: 100
					}
				}
			]
		};

		if (testEventCode && testEventCode.trim()) {
			testPayload.test_event_code = testEventCode.trim();
		}

		try {
			const endpoint = `https://graph.facebook.com/v19.0/${cleanPixelId}/events?access_token=${encodeURIComponent(cleanToken)}`;
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(testPayload)
			});

			const resData = (await response.json()) as any;

			if (response.ok && (resData?.events_received || resData?.fbtrace_id)) {
				return {
					success: true,
					message: testEventCode
						? `CAPI সংযোগ সফল! Meta Events Manager > Test Events ট্যাবে ইভেন্ট পুশ হয়েছে (Trace ID: ${resData.fbtrace_id || 'OK'})।`
						: `CAPI অ্যাক্সেস টোকেন বৈধ এবং মেটা সার্ভারের সাথে সফলভাবে সংযুক্ত (Trace ID: ${resData.fbtrace_id || 'OK'})।`,
					details: resData
				};
			} else {
				const errMsg = resData?.error?.message || response.statusText || 'Unknown Meta API error';
				return {
					success: false,
					message: `মেটা এপিআই ত্রুটি: ${errMsg}`,
					details: resData
				};
			}
		} catch (err: any) {
			return {
				success: false,
				message: `কানেকশন টেস্ট ব্যর্থ: ${err?.message || 'নেটওয়ার্ক সংযোগে সমস্যা'}`
			};
		}
	}
}

