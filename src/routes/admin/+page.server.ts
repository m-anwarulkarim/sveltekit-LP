import type { PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import { AnalyticsService } from '#lib/server/services/analytics.service';

export const load: PageServerLoad = async ({ parent, platform }) => {
	const parentData = await parent();
	let kpiSummary = null;
	let activeDailyTarget = null;

	if (platform?.env?.DB) {
		try {
			const db = getDb(platform.env.DB);
			kpiSummary = await AnalyticsService.getKpiSummary(db);
			activeDailyTarget = await AnalyticsService.getActiveDailyTarget(db);
		} catch (e) {
			console.error('Failed to load admin analytics:', e);
		}
	}

	return {
		...parentData,
		kpiSummary,
		activeDailyTarget
	};
};
