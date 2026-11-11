import { makeSettingsPage } from '#lib/server/settings-page';
import type { PageServerLoad, Actions } from './$types';

const page = makeSettingsPage('chat_widgets', {
	enableWhatsApp: false,
	whatsappNumber: '',
	whatsappDefaultMessage: 'হ্যালো! প্রোডাক্ট সম্পর্কে বিস্তারিত জানতে চাই।',
	enableMessenger: false,
	messengerPageId: '',
	enableTawkTo: false,
	tawkPropertyId: '',
});

export const load: PageServerLoad = page.load;
export const actions: Actions = page.actions;
