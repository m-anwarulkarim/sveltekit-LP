import { json, type RequestHandler } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import { CourierService } from '#lib/server/services/courier.service';

export const POST: RequestHandler = async ({ request, platform }) => {
	try {
		const db = getDb(platform);
		let orderIds: string[] | undefined = undefined;

		try {
			const body = (await request.json()) as { orderIds?: unknown };
			if (Array.isArray(body?.orderIds)) {
				orderIds = body.orderIds;
			}
		} catch (_) {
			// Body is optional (sync all active if omitted)
		}

		const result = await CourierService.syncActiveConsignments(db, orderIds);

		return json({
			success: true,
			syncedCount: result.syncedCount,
			updatedCount: result.updatedCount,
			errors: result.errors,
			message: result.updatedCount > 0
				? `${result.updatedCount}টি পার্সেলের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে!`
				: 'সকল পার্সেল ইতিমধ্যে আপ-টু-ডেট আছে।'
		});
	} catch (error: any) {
		console.error('Error in /api/admin/courier/sync:', error);
		return json(
			{ success: false, message: error.message || 'কুরিয়ার স্ট্যাটাস সিঙ্ক করতে সমস্যা হয়েছে।' },
			{ status: 500 }
		);
	}
};

