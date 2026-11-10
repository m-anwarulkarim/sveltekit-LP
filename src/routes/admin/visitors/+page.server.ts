import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { VisitorAnalyticsService } from '#lib/server/services/visitor-analytics.service';

export const load: PageServerLoad = async ({ parent, platform, url }) => {
	const parentData = await parent();
	const rangeParam = url.searchParams.get('range');
	const range = rangeParam === '7days' || rangeParam === '30days' ? rangeParam : 'today';

	try {
		const db = getDb(platform);
		const summary = await VisitorAnalyticsService.getTrafficSummary(db, range);

		return {
			...parentData,
			trafficSummary: summary,
			activeRange: range
		};
	} catch (err) {
		console.error('Failed to load visitor analytics data:', err);
		return {
			...parentData,
			trafficSummary: {
				activeNow: 0,
				todaySessions: 0,
				todayPageviews: 0,
				conversionRate: 0,
				topSource: 'Direct',
				sourcesBreakdown: [],
				deviceBreakdown: [],
				topPages: [],
				topCities: [],
				recentVisitors: []
			},
			activeRange: range
		};
	}
};

export const actions: Actions = {
	blockIp: async ({ request, platform, locals }) => {
		if (locals.admin?.role !== 'Owner') {
			return fail(403, { message: 'এই অ্যাকশনটি শুধুমাত্র Owner করতে পারবেন।' });
		}

		const data = await request.formData();
		const ipAddress = data.get('ipAddress')?.toString()?.trim();
		const reason = data.get('reason')?.toString()?.trim() || 'Suspicious Traffic from Visitor Deck';

		if (!ipAddress) {
			return fail(400, { message: 'IP address পাওয়া যায়নি।' });
		}

		try {
			const db = getDb(platform);
			await db.insert(schema.ipBlocks).values({
				ipAddress,
				reason,
				type: 'Manual',
				isPermanent: true
			});

			return { success: true, message: `আইপি ${ipAddress} সফলভাবে ব্লক করা হয়েছে।` };
		} catch (err) {
			console.error('Failed to block IP:', err);
			return fail(500, { message: 'আইপি ব্লক করতে সমস্যা হয়েছে।' });
		}
	}
};
