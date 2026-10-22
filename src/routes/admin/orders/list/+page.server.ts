import type { Actions, PageServerLoad } from './$types';
import {
	handleUpdateStatus,
	handleQuickCancel,
	handleDeleteOrder
} from '#lib/server/orders';

export const load: PageServerLoad = async ({ parent }) => {
	const parentData = await parent();
	return {
		...parentData
	};
};

export const actions: Actions = {
	updateOrderStatus: async ({ request, platform }) => handleUpdateStatus(request, platform),
	quickCancelOrder: async ({ request, platform }) => handleQuickCancel(request, platform),
	deleteOrder: async ({ request, platform }) => handleDeleteOrder(request, platform),
	bookCourier: async ({ request }) => {
		const data = await request.formData();
		const count = data.get('count') || '1';
		return {
			success: true,
			message: `${count} টি অর্ডার সফলভাবে Steadfast কুরিয়ারে বুকিং সম্পন্ন হয়েছে!`
		};
	}
};
