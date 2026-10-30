import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index';
import { DailyTargetService } from '#lib/server/services/daily-target.service';

export const GET: RequestHandler = async ({ url, platform }) => {
	const startDate = url.searchParams.get('startDate');
	const endDate = url.searchParams.get('endDate');

	if (!startDate || !endDate) {
		return json({ success: false, message: 'Missing date range' }, { status: 400 });
	}

	try {
		const db = getDb(platform);
		const days = await DailyTargetService.getDailyBreakdown(db, startDate, endDate);
		return json({ success: true, days });
	} catch (e: any) {
		console.error('Failed to get daily breakdown:', e);
		return json({ success: false, message: e?.message || 'Server error' }, { status: 500 });
	}
};

