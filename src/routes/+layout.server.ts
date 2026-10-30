import type { LayoutServerLoad } from './$types';
import { SeoService } from '#lib/server/services/seo.service';
import { getDb } from '#lib/server/db/index';
import {
	ThemeCustomizationService,
	DEFAULT_THEME_CONFIG
} from '#lib/server/services/theme-customization.service';
import { PixelService, DEFAULT_PIXEL_SETTINGS } from '#lib/server/services/pixel.service';
import { GtmService, DEFAULT_GTM_SETTINGS } from '#lib/server/services/gtm.service';
import { CategoryService } from '#lib/server/services/category.service';
import { SettingsService, type StoreDeliveryConfig } from '#lib/server/services/settings.service';

export const load: LayoutServerLoad = async (event) => {
	let themeConfig = DEFAULT_THEME_CONFIG;
	let pixelConfig = {
		pixelId: DEFAULT_PIXEL_SETTINGS.pixelId,
		backupPixelId: DEFAULT_PIXEL_SETTINGS.backupPixelId || '',
		trackingMode: DEFAULT_PIXEL_SETTINGS.trackingMode,
		events: DEFAULT_PIXEL_SETTINGS.events
	};
	let gtmConfig = {
		isEnabled: DEFAULT_GTM_SETTINGS.isEnabled,
		gtmId: DEFAULT_GTM_SETTINGS.gtmId,
		ga4MeasurementId: DEFAULT_GTM_SETTINGS.ga4MeasurementId,
		enableDataLayer: DEFAULT_GTM_SETTINGS.enableDataLayer,
		events: DEFAULT_GTM_SETTINGS.events
	};
	let categories: any[] = [];
	let storeConfig: StoreDeliveryConfig = {
		insideDhakaCharge: 60,
		outsideDhakaCharge: 120,
		freeShippingThreshold: 600,
		hotlinePhone: '01860-229546',
		storeName: 'AURA Store'
	};

	try {
		const db = getDb(event.platform);
		const [tc, pc, gtm, cats, sCfg] = await Promise.all([
			ThemeCustomizationService.getThemeConfig(db).catch(() => DEFAULT_THEME_CONFIG),
			PixelService.getPublicConfig(db).catch(() => pixelConfig),
			GtmService.getPublicConfig(db).catch(() => gtmConfig),
			CategoryService.listCategories(db, { parentId: null, status: 'publish' }).catch(() => []),
			SettingsService.getStoreDeliveryConfig(db).catch(() => storeConfig)
		]);
		if (tc) themeConfig = tc;
		if (pc) pixelConfig = pc;
		if (gtm) gtmConfig = gtm;
		if (cats && cats.length > 0) categories = cats;
		if (sCfg) storeConfig = sCfg;
	} catch (err) {
		console.error('Failed to load database in root layout:', err);
	}

	return {
		user: event.locals.user ?? null,
		session: event.locals.session ?? null,
		themeConfig,
		pixelConfig,
		gtmConfig,
		categories,
		storeConfig,
		websiteJsonLd: SeoService.getWebSiteJsonLd(),
		organizationJsonLd: SeoService.getOrganizationJsonLd()
	};
};
