import type { Actions, PageServerLoad } from './$types';
import {
	handleRestoreOrder,
	handlePermanentDelete,
	handleEmptyTrash
} from '#lib/server/orders';

export const load: PageServerLoad = async ({ parent }) => {
	const parentData = await parent();
	return {
		...parentData
	};
};

export const actions: Actions = {
	restoreOrder: async ({ request, platform }) => handleRestoreOrder(request, platform),
	permanentDeleteOrder: async ({ request, platform }) => handlePermanentDelete(request, platform),
	emptyTrash: async ({ platform }) => handleEmptyTrash(platform)
};
