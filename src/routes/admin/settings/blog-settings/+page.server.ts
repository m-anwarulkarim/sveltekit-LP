import { makeSettingsPage } from '#lib/server/settings-page';
import type { PageServerLoad, Actions } from './$types';

const page = makeSettingsPage('blog', {
	enableBlog: true,
	postsPerPage: 9,
	enableComments: true,
	autoApproveComments: false,
	blogTitle: 'Haq Plus - Articles & Tips',
});

export const load: PageServerLoad = page.load;
export const actions: Actions = page.actions;
