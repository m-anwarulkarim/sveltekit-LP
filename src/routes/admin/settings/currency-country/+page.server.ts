import { makeSettingsPage } from '#lib/server/settings-page';
import type { PageServerLoad, Actions } from './$types';

const page = makeSettingsPage('locale', {
	primaryCurrency: 'BDT',
	currencySymbol: '৳',
	decimalDigits: 0,
	defaultCountry: 'Bangladesh',
	timeZone: 'Asia/Dhaka (GMT+6)',
});

export const load: PageServerLoad = page.load;
export const actions: Actions = page.actions;
