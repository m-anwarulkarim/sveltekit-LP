import { makeSettingsPage } from '#lib/server/settings-page';
import type { PageServerLoad, Actions } from './$types';

const page = makeSettingsPage('epbx', {
	enableAutoCall: false,
	ivrProvider: 'bangladesh_epbx',
	apiUrl: '',
	authToken: '',
	retryAttempts: 2,
	promptAudioUrl: '',
}, ['authToken']);

export const load: PageServerLoad = page.load;
export const actions: Actions = page.actions;
