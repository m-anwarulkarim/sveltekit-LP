import type { LayoutServerLoad } from './$types';
import { SeoService } from '#lib/server/services/seo.service';
import { getDb } from '#lib/server/db/index';
import { ThemeCustomizationService } from '#lib/server/services/theme-customization.service';

export const load: LayoutServerLoad = async (event) => {
	const db = getDb(event.platform);
	const themeConfig = await ThemeCustomizationService.getThemeConfig(db);

	return {
		user: event.locals.user ?? null,
		session: event.locals.session ?? null,
		themeConfig,
		websiteJsonLd: SeoService.getWebSiteJsonLd(),
		organizationJsonLd: SeoService.getOrganizationJsonLd()
	};
};

