import type { PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import { CourierService, type CourierHubFilterOptions } from '#lib/server/services/courier.service';

export const load: PageServerLoad = async ({ url, platform }) => {
	const dateRange = (url.searchParams.get('range') || 'all') as CourierHubFilterOptions['dateRange'];
	const provider = url.searchParams.get('provider') || 'all';
	const status = url.searchParams.get('status') || 'all';
	const search = url.searchParams.get('q') || '';
	const startDate = url.searchParams.get('from') || undefined;
	const endDate = url.searchParams.get('to') || undefined;

	const filters = {
		dateRange,
		provider,
		status,
		search,
		startDate,
		endDate
	};

	try {
		const db = getDb(platform);

		const [hubData, courierSettings] = await Promise.all([
			CourierService.getCourierHubData(db, {
				dateRange,
				provider,
				status,
				search,
				startDate,
				endDate
			}).catch((err) => {
				console.error('getCourierHubData error:', err);
				return {
					kpis: CourierService.getDefaultKPIs(),
					consignments: [],
					totalMatching: 0
				};
			}),
			CourierService.getCourierSettings(db).catch(() => ({
				methods: [],
				defaultProvider: 'steadfast' as const
			}))
		]);

		return {
			kpis: hubData?.kpis ?? CourierService.getDefaultKPIs(),
			consignments: hubData?.consignments ?? [],
			totalMatching: hubData?.totalMatching ?? 0,
			courierMethods: courierSettings?.methods ?? [],
			defaultProvider: courierSettings?.defaultProvider ?? 'steadfast',
			filters
		};
	} catch (err: any) {
		console.error('Fatal load error in /admin/courier:', err);
		return {
			kpis: CourierService.getDefaultKPIs(),
			consignments: [],
			totalMatching: 0,
			courierMethods: [],
			defaultProvider: 'steadfast' as const,
			filters
		};
	}
};

