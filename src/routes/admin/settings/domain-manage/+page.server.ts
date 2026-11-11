import { makeSettingsPage } from '#lib/server/settings-page';
import type { PageServerLoad, Actions } from './$types';

const page = makeSettingsPage('domain', {
	primaryDomain: 'thecolorlighthouse.com',
	defaultSubdomain: 'thecolorlight.saleecom.com',
	forceHttps: true,
	redirectWww: true,
	sslStatus: 'Active (Cloudflare Universal SSL)',
});

export const load: PageServerLoad = page.load;
export const actions: Actions = page.actions;
