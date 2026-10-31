import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index';
import { CustomerService } from '#lib/server/services/customer.service';

export const GET: RequestHandler = async ({ url, platform }) => {
	const phone = url.searchParams.get('phone') || '';
	const customerId = url.searchParams.get('customerId') || '';
	const target = phone.trim() || customerId.trim();

	if (!target) {
		return json({ success: false, orders: [], message: 'Target phone or ID required' }, { status: 400 });
	}

	try {
		const db = getDb(platform);
		const orders = await CustomerService.getCustomerOrders(db, target);
		return json({ success: true, orders });
	} catch (error: any) {
		console.error('Failed to get customer orders:', error);
		return json({ success: false, orders: [], message: error?.message || 'Server error' }, { status: 500 });
	}
};

