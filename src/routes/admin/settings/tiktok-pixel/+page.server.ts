import { makeSettingsPage } from '#lib/server/settings-page';
import type { PageServerLoad, Actions } from './$types';

const page = makeSettingsPage('tiktok_pixel', {
	tiktokPixelId: '',
	tiktokAccessToken: '',
	enableTikTokEventsAPI: false,
	testEventCode: '',
}, ['tiktokAccessToken']);

export const load: PageServerLoad = page.load;
export const actions: Actions = page.actions;
