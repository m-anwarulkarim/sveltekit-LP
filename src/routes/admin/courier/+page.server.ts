import type { PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import { CourierService, type CourierHubFilterOptions } from '#lib/server/services/courier.service';

export const load: PageServerLoad = async ({ url, platform }) => {
	const db = getDb(platform);

	const dateRange = (url.searchParams.get('range') || 'all') as CourierHubFilterOptions['dateRange'];
	const provider = url.searchParams.get('provider') || 'all';
	const status = url.searchParams.get('status') || 'all';
	const search = url.searchParams.get('q') || '';
	const startDate = url.searchParams.get('from') || undefined;
	const endDate = url.searchParams.get('to') || undefined;

	const [hubData, courierSettings] = await Promise.all([
		CourierService.getCourierHubData(db, {
			dateRange,
			provider,
			status,
			search,
			startDate,
			endDate
		}),
		CourierService.getCourierSettings(db).catch(() => ({ methods: [], defaultProvider: 'steadfast' as const }))
	]);

	return {
		kpis: hubData.kpis,
		consignments: hubData.consignments,
		totalMatching: hubData.totalMatching,
		courierMethods: courierSettings.methods,
		defaultProvider: courierSettings.defaultProvider,
		filters: {
			dateRange,
			provider,
			status,
			search,
			startDate,
			endDate
		}
	};
};
