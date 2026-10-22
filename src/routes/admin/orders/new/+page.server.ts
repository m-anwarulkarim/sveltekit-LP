import type { Actions, PageServerLoad } from './$types';
import { handleCreateManualOrder } from '#lib/server/orders';

export const load: PageServerLoad = async ({ parent }) => {
	const parentData = await parent();
	return {
		...parentData
	};
};

export const actions: Actions = {
	createManualOrder: async ({ request, platform }) => handleCreateManualOrder(request, platform)
};
