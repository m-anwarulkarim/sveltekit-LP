import type { PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import { ReportService } from '#lib/server/services/report.service';

export const load: PageServerLoad = async ({ platform }) => {
	try {
		const db = getDb(platform);
		const report = await ReportService.getAssetValuationReport(db);
		return { report };
	} catch (error) {
		console.error('Failed to load asset valuation report:', error);
		return {
			report: {
				products: [],
				totalAssetCost: 0,
				totalRetailValue: 0,
				potentialProfit: 0,
				publishedCount: 0,
				totalCount: 0,
				totalStockQty: 0
			}
		};
	}
};

