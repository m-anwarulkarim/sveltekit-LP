import type { Actions, PageServerLoad } from './$types';
import {
	handleConvertIncompleteToOrder,
	handleUpdateIncompleteOrder,
	handleDeleteOrder
} from '#lib/server/orders';

export const load: PageServerLoad = async ({ parent }) => {
	const parentData = await parent();
	return {
		...parentData
	};
};

export const actions: Actions = {
	// Convert incomplete order directly to a confirmed/processing live order
	convertOrder: async ({ request, platform }) => {
		return await handleConvertIncompleteToOrder(request, platform);
	},

	// Update incomplete order details, recovery status, or notes
	updateIncomplete: async ({ request, platform }) => {
		return await handleUpdateIncompleteOrder(request, platform);
	},

	// Discard / Move incomplete order to trash
	deleteOrder: async ({ request, platform }) => {
		return await handleDeleteOrder(request, platform);
	}
};

