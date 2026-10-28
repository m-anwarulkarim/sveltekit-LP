import { eq, and, sql } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export interface ThemeColors {
	primary: string;
	secondary: string;
	tertiary: string;
}

export interface ThemeAppearanceConfig {
	colors: ThemeColors;
	dashboardStyle: 'classic' | 'professional';
	searchKeywords: string;
	checkoutLanguage: 'bangla' | 'english' | 'italian';
}

export interface ThemeViewsConfig {
	header: string; // e.g. 'header_1'
	showcase: string; // e.g. 'showcase_2'
	category: string; // e.g. 'category_1'
	productSections: string[]; // e.g. ['tag']
	productCard: string; // e.g. 'product_card_3'
	bottomNav: string; // e.g. 'bottom_nav_1'
	footer: string; // e.g. 'footer_1'
}

export interface ThemePageViewsConfig {
	checkout: string; // 'checkout_1' | 'checkout_2'
	productDetails?: string; // 'product_details_1' | 'product_details_2'
	cartView?: string; // 'cart_view_1' | 'cart_view_2'
	orderSuccess?: string; // 'order_success_1' | 'order_success_2'
}

export interface CompleteThemeConfig {
	appearance: ThemeAppearanceConfig;
	views: ThemeViewsConfig;
	pageViews: ThemePageViewsConfig;
	activePreset: string | null;
	lastSaved: string;
}

export const DEFAULT_THEME_CONFIG: CompleteThemeConfig = {
	appearance: {
		colors: {
			primary: '#e8007c',
			secondary: '#00c153',
			tertiary: '#ff00ae'
		},
		dashboardStyle: 'professional',
		searchKeywords: 'lipstick, foundation, face serum, moisturizer',
		checkoutLanguage: 'bangla'
	},
	views: {
		header: 'header_1',
		showcase: 'showcase_2',
		category: 'category_1',
		productSections: ['tag'],
		productCard: 'product_card_3',
		bottomNav: 'bottom_nav_1',
		footer: 'footer_1'
	},
	pageViews: {
		checkout: 'checkout_2',
		productDetails: 'product_details_1',
		cartView: 'cart_view_1',
		orderSuccess: 'order_success_1'
	},
	activePreset: 'Levoleather',
	lastSaved: new Date().toLocaleString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		second: '2-digit',
		hour12: true
	})
};

/**
 * Enterprise Service for Theme Customization (Cloudflare D1 Persistence)
 */
export class ThemeCustomizationService {
	private static async getSetting(
		db: DrizzleD1Database<typeof schema>,
		key: string
	): Promise<any | null> {
		try {
			const res = await db
				.select()
				.from(schema.storeSettings)
				.where(
					and(
						eq(schema.storeSettings.group, 'theme_customization'),
						eq(schema.storeSettings.key, key)
					)
				)
				.get();

			if (res && res.value) {
				try {
					return JSON.parse(res.value);
				} catch {
					return res.value;
				}
			}
			return null;
		} catch (error) {
			console.error(`Failed to read theme setting "${key}":`, error);
			return null;
		}
	}

	private static async setSetting(
		db: DrizzleD1Database<typeof schema>,
		key: string,
		value: any
	): Promise<void> {
		const jsonVal = typeof value === 'string' ? value : JSON.stringify(value);
		const existing = await db
			.select({ id: schema.storeSettings.id })
			.from(schema.storeSettings)
			.where(
				and(
					eq(schema.storeSettings.group, 'theme_customization'),
					eq(schema.storeSettings.key, key)
				)
			)
			.get();

		if (existing) {
			await db
				.update(schema.storeSettings)
				.set({
					value: jsonVal,
					updatedAt: new Date()
				})
				.where(eq(schema.storeSettings.id, existing.id));
		} else {
			await db.insert(schema.storeSettings).values({
				group: 'theme_customization',
				key,
				value: jsonVal,
				updatedAt: new Date()
			});
		}
	}

	/**
	 * Loads complete theme configuration with smart fallbacks
	 */
	static async getThemeConfig(
		db: DrizzleD1Database<typeof schema>
	): Promise<CompleteThemeConfig> {
		const appearance = await this.getSetting(db, 'appearance');
		const views = await this.getSetting(db, 'views');
		const pageViews = await this.getSetting(db, 'page_views');
		const activePreset = await this.getSetting(db, 'active_preset');
		const lastSaved = await this.getSetting(db, 'last_saved');

		return {
			appearance: {
				...DEFAULT_THEME_CONFIG.appearance,
				...(appearance || {})
			},
			views: {
				...DEFAULT_THEME_CONFIG.views,
				...(views || {})
			},
			pageViews: {
				...DEFAULT_THEME_CONFIG.pageViews,
				...(pageViews || {})
			},
			activePreset: activePreset || DEFAULT_THEME_CONFIG.activePreset,
			lastSaved: lastSaved || DEFAULT_THEME_CONFIG.lastSaved
		};
	}

	/**
	 * Updates Appearance & Colors settings
	 */
	static async updateAppearance(
		db: DrizzleD1Database<typeof schema>,
		input: Partial<ThemeAppearanceConfig>
	) {
		const current = await this.getThemeConfig(db);
		const updatedAppearance = {
			...current.appearance,
			...input
		};

		const nowString = new Date().toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit',
			second: '2-digit',
			hour12: true
		});

		await this.setSetting(db, 'appearance', updatedAppearance);
		await this.setSetting(db, 'last_saved', nowString);

		return {
			success: true,
			message: 'অ্যাপিয়ারেন্স ও ব্র্যান্ড কালার সেটিংস সফলভাবে সংরক্ষিত হয়েছে!',
			lastSaved: nowString
		};
	}

	/**
	 * Updates Modular Theme Views
	 */
	static async updateThemeViews(
		db: DrizzleD1Database<typeof schema>,
		input: Partial<ThemeViewsConfig>
	) {
		const current = await this.getThemeConfig(db);
		const updatedViews = {
			...current.views,
			...input
		};

		const nowString = new Date().toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit',
			second: '2-digit',
			hour12: true
		});

		await this.setSetting(db, 'views', updatedViews);
		await this.setSetting(db, 'last_saved', nowString);

		return {
			success: true,
			message: 'থিম লেআউট সেকশন সেটিংস সফলভাবে সংরক্ষিত হয়েছে!',
			lastSaved: nowString
		};
	}

	/**
	 * Updates Page Views (Checkout layout, etc.)
	 */
	static async updatePageViews(
		db: DrizzleD1Database<typeof schema>,
		input: Partial<ThemePageViewsConfig>
	) {
		const current = await this.getThemeConfig(db);
		const updatedPageViews = {
			...current.pageViews,
			...input
		};

		const nowString = new Date().toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit',
			second: '2-digit',
			hour12: true
		});

		await this.setSetting(db, 'page_views', updatedPageViews);
		await this.setSetting(db, 'last_saved', nowString);

		return {
			success: true,
			message: 'পেজ ভিউ (চেকআউট) কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!',
			lastSaved: nowString
		};
	}

	/**
	 * Applies a full ready-made Theme Design Preset
	 */
	static async applyDesignPreset(
		db: DrizzleD1Database<typeof schema>,
		preset: {
			id: string;
			name: string;
			components: {
				header: string;
				showcase: string;
				productCard: string;
				footer: string;
			};
		}
	) {
		const current = await this.getThemeConfig(db);
		const updatedViews: ThemeViewsConfig = {
			...current.views,
			header: preset.components.header,
			showcase: preset.components.showcase,
			productCard: preset.components.productCard,
			footer: preset.components.footer
		};

		const nowString = new Date().toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit',
			second: '2-digit',
			hour12: true
		});

		await this.setSetting(db, 'views', updatedViews);
		await this.setSetting(db, 'active_preset', preset.name);
		await this.setSetting(db, 'last_saved', nowString);

		return {
			success: true,
			message: `"${preset.name}" থিম ডিজাইন সফলভাবে অ্যাপ্লাই করা হয়েছে!`,
			lastSaved: nowString
		};
	}

	/**
	 * Resets all theme configurations to factory defaults
	 */
	static async resetDefaults(db: DrizzleD1Database<typeof schema>) {
		const nowString = new Date().toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit',
			second: '2-digit',
			hour12: true
		});

		await this.setSetting(db, 'appearance', DEFAULT_THEME_CONFIG.appearance);
		await this.setSetting(db, 'views', DEFAULT_THEME_CONFIG.views);
		await this.setSetting(db, 'page_views', DEFAULT_THEME_CONFIG.pageViews);
		await this.setSetting(db, 'active_preset', DEFAULT_THEME_CONFIG.activePreset);
		await this.setSetting(db, 'last_saved', nowString);

		return {
			success: true,
			message: 'থিম কাস্টমাইজেশন ফ্যাক্টরি ডিফল্ট সেটিংসে রিসেট হয়েছে!',
			lastSaved: nowString
		};
	}
}

