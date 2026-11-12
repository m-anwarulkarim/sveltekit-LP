import { json, type RequestHandler } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import { CourierService } from '#lib/server/services/courier.service';

/**
 * Read-only account reports from the active courier gateway.
 * Loaded on demand so the courier hub does not hit the external API on
 * every page view.
 */
export const GET: RequestHandler = async ({ url, platform }) => {
	const tab = url.searchParams.get('tab') || 'payments';
	const pageNumber = Math.max(1, Number(url.searchParams.get('page') || '1') || 1);

	try {
		const db = getDb(platform);

		switch (tab) {
			case 'payments':
				return json(await CourierService.getPaymentHistory(db, pageNumber));
			case 'returns':
				return json(await CourierService.getReturnRequests(db, pageNumber));
			case 'states':
				return json(await CourierService.getParcelStates(db));
			default:
				return json({ success: false, items: [], message: 'অজানা রিপোর্ট টাইপ' }, { status: 400 });
		}
	} catch (err: any) {
		console.error('Error in /api/admin/courier/account:', err);
		return json(
			{ success: false, items: [], message: err?.message || 'কুরিয়ার অ্যাকাউন্ট ডেটা আনা যায়নি' },
			{ status: 500 }
		);
	}
};
