import type { LayoutServerLoad } from './$types';
import { SeoService } from '#lib/server/services/seo.service';
import { getDb } from '#lib/server/db/index';
import { ThemeCustomizationService } from '#lib/server/services/theme-customization.service';
import { PixelService } from '#lib/server/services/pixel.service';

export const load: LayoutServerLoad = async (event) => {
	const db = getDb(event.platform);
	const [themeConfig, pixelConfig] = await Promise.all([
		ThemeCustomizationService.getThemeConfig(db),
		PixelService.getPublicConfig(db)
	]);

	return {
		user: event.locals.user ?? null,
		session: event.locals.session ?? null,
		themeConfig,
		pixelConfig,
		websiteJsonLd: SeoService.getWebSiteJsonLd(),
		organizationJsonLd: SeoService.getOrganizationJsonLd()
	};
};
