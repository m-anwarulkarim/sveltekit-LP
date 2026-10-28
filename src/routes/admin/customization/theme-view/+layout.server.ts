import type { LayoutServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import { ThemeCustomizationService } from '#lib/server/services/theme-customization.service';

export const load: LayoutServerLoad = async ({ platform, parent }) => {
	const parentData = await parent();
	let themeConfig = null;

	try {
		const db = getDb(platform);
		themeConfig = await ThemeCustomizationService.getThemeConfig(db);
	} catch (error) {
		console.error('Failed to load theme configuration from D1:', error);
	}

	return {
		...parentData,
		themeConfig
	};
};

