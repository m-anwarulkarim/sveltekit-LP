import { makeSettingsPage } from '#lib/server/settings-page';
import type { PageServerLoad, Actions } from './$types';

const page = makeSettingsPage(
	'fraud_check',
	{
		enableCourierFraudCheck: true,
		returnRateThreshold: 25,
		autoBlockBadIps: false,
		smartposBdApiKey: '',
		steadFastApiKey: '',
		steadFastSecretKey: '',
		pathaoApiKey: '',
		pathaoSecret: '',
		pathaoUsername: '',
		pathaoPassword: ''
	},
	['smartposBdApiKey', 'steadFastApiKey', 'steadFastSecretKey', 'pathaoApiKey', 'pathaoSecret', 'pathaoPassword']
);

export const load: PageServerLoad = page.load;
export const actions: Actions = page.actions;
