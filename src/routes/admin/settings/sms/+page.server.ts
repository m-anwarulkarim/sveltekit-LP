import { makeSettingsPage } from '#lib/server/settings-page';
import type { PageServerLoad, Actions } from './$types';

const page = makeSettingsPage('sms', {
	smsProvider: 'greenweb',
	apiKey: '',
	senderId: '',
	sendOnNewOrder: false,
	sendOnShipping: false,
	sendOnDelivery: false,
	newOrderTemplate: 'প্রিয় {customer_name}, আপনার অর্ডার #{order_id} সফলভাবে গৃহীত হয়েছে। মোট মূল্য: ৳{amount}। ধন্যবাদ!',
}, ['apiKey']);

export const load: PageServerLoad = page.load;
export const actions: Actions = page.actions;
