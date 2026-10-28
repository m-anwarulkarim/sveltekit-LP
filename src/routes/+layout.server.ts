import type { LayoutServerLoad } from './$types';
import { SeoService } from '#lib/server/services/seo.service';

export const load: LayoutServerLoad = async (event) => {
	return {
		user: event.locals.user ?? null,
		session: event.locals.session ?? null,
		websiteJsonLd: SeoService.getWebSiteJsonLd(),
		organizationJsonLd: SeoService.getOrganizationJsonLd()
	};
};
