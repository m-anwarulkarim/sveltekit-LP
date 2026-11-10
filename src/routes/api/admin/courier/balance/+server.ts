import { json, type RequestHandler } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import { CourierService } from '#lib/server/services/courier.service';

export const GET: RequestHandler = async ({ platform }) => {
	try {
		const db = getDb(platform);
		const result = await CourierService.getLiveBalance(db);

		return json({
			success: result.success,
			balance: result.balance,
			currency: result.currency,
			provider: result.provider,
			message: result.message
		});
	} catch (error: any) {
		console.error('Error in /api/admin/courier/balance:', error);
		return json(
			{ success: false, balance: 0, currency: 'BDT', message: error.message || 'ব্যালেন্স আনা যায়নি।' },
			{ status: 500 }
		);
	}
};

