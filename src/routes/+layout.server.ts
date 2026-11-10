import type { LayoutServerLoad } from './$types';
import { SeoService } from '#lib/server/services/seo.service';
import { getDb } from '#lib/server/db/index';
import { cached } from '#lib/server/cache';
import {
	ThemeCustomizationService,
	DEFAULT_THEME_CONFIG
} from '#lib/server/services/theme-customization.service';
import { PixelService, DEFAULT_PIXEL_SETTINGS } from '#lib/server/services/pixel.service';
import { GtmService, DEFAULT_GTM_SETTINGS } from '#lib/server/services/gtm.service';
import { CategoryService } from '#lib/server/services/category.service';
import { CustomizationService } from '#lib/server/services/customization.service';
import {
	SettingsService,
	type StoreDeliveryConfig,
	DEFAULT_PRODUCT_SETTINGS,
	type ProductSettingsConfig,
	DEFAULT_WEBSITE_INFO,
	type WebsiteInfoConfig,
	DEFAULT_GOOGLE_CONSOLE_CONFIG,
	type GoogleConsoleConfig,
	DEFAULT_SOCIAL_LOGIN_CONFIG
} from '#lib/server/services/settings.service';

/** Public shape — never contains googleClientSecret. */
export interface PublicSocialLogin {
	enableGoogleLogin: boolean;
	enableOneTap: boolean;
	googleClientId: string;
}

export const load: LayoutServerLoad = async (event) => {
	let themeConfig = DEFAULT_THEME_CONFIG;
	let pixelConfig: Awaited<ReturnType<typeof PixelService.getPublicConfig>> = {
		pixelId: DEFAULT_PIXEL_SETTINGS.pixelId,
		backupPixelId: DEFAULT_PIXEL_SETTINGS.backupPixelId || '',
		trackingMode: DEFAULT_PIXEL_SETTINGS.trackingMode,
		defaultCurrency: DEFAULT_PIXEL_SETTINGS.defaultCurrency,
		catalogMatchKey: DEFAULT_PIXEL_SETTINGS.catalogMatchKey,
		events: DEFAULT_PIXEL_SETTINGS.events,
		advancedMatching: DEFAULT_PIXEL_SETTINGS.advancedMatching.enabled,
		capiEnabled: false,
		testEventCode: undefined
	};
	let gtmConfig: Awaited<ReturnType<typeof GtmService.getPublicConfig>> = {
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
		hotlinePhone: '0156007230',
		storeName: 'seedbd'
	};
	let productSettings: ProductSettingsConfig = DEFAULT_PRODUCT_SETTINGS;
	let websiteInfo: WebsiteInfoConfig = DEFAULT_WEBSITE_INFO;
	let activePopup: any = null;
	let googleConsole: GoogleConsoleConfig = DEFAULT_GOOGLE_CONSOLE_CONFIG;
	let socialLogin: PublicSocialLogin = {
		enableGoogleLogin: false,
		enableOneTap: false,
		googleClientId: ''
	};

	try {
		const db = getDb(event.platform);
		const [tc, pc, gtm, cats, sCfg, pCfg, wInfo, popup, gConsole, sLogin] = await cached('root-layout', 30_000, () => Promise.all([
			ThemeCustomizationService.getThemeConfig(db).catch(() => DEFAULT_THEME_CONFIG),
			PixelService.getPublicConfig(db).catch(() => pixelConfig),
			GtmService.getPublicConfig(db).catch(() => gtmConfig),
			CategoryService.listCategories(db, { parentId: null, status: 'publish' }).catch(() => []),
			SettingsService.getStoreDeliveryConfig(db).catch(() => storeConfig),
			SettingsService.getProductSettings(db).catch(() => DEFAULT_PRODUCT_SETTINGS),
			SettingsService.getWebsiteInfo(db).catch(() => DEFAULT_WEBSITE_INFO),
			CustomizationService.getActivePopupForStorefront(db).catch(() => null),
			SettingsService.getGoogleConsoleConfig(db).catch(() => DEFAULT_GOOGLE_CONSOLE_CONFIG),
			SettingsService.getSocialLoginConfig(db).catch(() => DEFAULT_SOCIAL_LOGIN_CONFIG)
		]));
		if (tc) themeConfig = tc;
		if (pc) pixelConfig = pc;
		if (gtm) gtmConfig = gtm;
		if (cats && cats.length > 0) categories = cats;
		if (sCfg) storeConfig = sCfg;
		if (pCfg) productSettings = pCfg;
		if (wInfo) websiteInfo = wInfo;
		if (popup) activePopup = popup;
		if (gConsole) googleConsole = gConsole;
		if (sLogin) {
			// Never expose googleClientSecret to the client.
			socialLogin = {
				enableGoogleLogin:
					Boolean(sLogin.enableGoogleLogin) &&
					Boolean(sLogin.googleClientId) &&
					Boolean(sLogin.googleClientSecret),
				enableOneTap: Boolean(sLogin.enableOneTap),
				googleClientId: sLogin.googleClientId || ''
			};
		}
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
		productSettings,
		websiteInfo,
		activePopup,
		googleConsole,
		socialLogin,
		websiteJsonLd: SeoService.getWebSiteJsonLd(event.url.origin),
		organizationJsonLd: SeoService.getOrganizationJsonLd(event.url.origin)
	};
};
