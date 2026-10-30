import type { LayoutServerLoad } from './$types';
import { SeoService } from '#lib/server/services/seo.service';
import { getDb } from '#lib/server/db/index';
import {
	ThemeCustomizationService,
	DEFAULT_THEME_CONFIG
} from '#lib/server/services/theme-customization.service';
import { PixelService, DEFAULT_PIXEL_SETTINGS } from '#lib/server/services/pixel.service';

export const load: LayoutServerLoad = async (event) => {
	let themeConfig = DEFAULT_THEME_CONFIG;
	let pixelConfig = {
		pixelId: DEFAULT_PIXEL_SETTINGS.pixelId,
		backupPixelId: DEFAULT_PIXEL_SETTINGS.backupPixelId || '',
		trackingMode: DEFAULT_PIXEL_SETTINGS.trackingMode,
		events: DEFAULT_PIXEL_SETTINGS.events
	};

	try {
		const db = getDb(event.platform);
		const [tc, pc] = await Promise.all([
			ThemeCustomizationService.getThemeConfig(db).catch(() => DEFAULT_THEME_CONFIG),
			PixelService.getPublicConfig(db).catch(() => pixelConfig)
		]);
		if (tc) themeConfig = tc;
		if (pc) pixelConfig = pc;
	} catch (err) {
		console.error('Failed to load database in root layout:', err);
	}

	return {
		user: event.locals.user ?? null,
		session: event.locals.session ?? null,
		themeConfig,
		pixelConfig,
		websiteJsonLd: SeoService.getWebSiteJsonLd(),
		organizationJsonLd: SeoService.getOrganizationJsonLd()
	};
};
