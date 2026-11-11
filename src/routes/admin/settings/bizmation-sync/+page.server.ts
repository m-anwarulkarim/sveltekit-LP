import { makeSettingsPage } from '#lib/server/settings-page';
import type { PageServerLoad, Actions } from './$types';

const page = makeSettingsPage('bizmation_sync', {
	enableSync: false,
	bizmationStoreId: '',
	apiKey: '',
	syncInventory: false,
	syncIntervalMinutes: 15,
	syncOrdersToAccounting: false,
}, ['apiKey']);

export const load: PageServerLoad = page.load;
export const actions: Actions = page.actions;
