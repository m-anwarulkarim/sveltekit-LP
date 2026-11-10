import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { EmailSettingsService } from '#lib/server/services/email-settings.service';
import { EmailService } from '#lib/server/email/index';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ platform }) => {
	const db = getDb(platform);
	const settings = await EmailSettingsService.getEmailSettings(db);
	// Never expose the API key to the client — only show whether it's set
	return {
		settings: {
			...settings,
			resendApiKey: settings.resendApiKey ? '••••••••' : ''
		},
		hasApiKey: Boolean(settings.resendApiKey)
	};
};

export const actions: Actions = {
	save: async ({ request, platform }) => {
		try {
			const data = await request.formData();
			const payloadRaw = data.get('settings');
			if (typeof payloadRaw !== 'string') return fail(400, { error: true, message: 'Invalid payload' });

			const payload = JSON.parse(payloadRaw);

			// If the masked placeholder is submitted unchanged, don't overwrite the real key
			const db = getDb(platform);
			if (payload.resendApiKey === '••••••••') {
				const current = await EmailSettingsService.getEmailSettings(db);
				payload.resendApiKey = current.resendApiKey;
			}

			await EmailSettingsService.saveEmailSettings(db, payload);
			return { success: true };
		} catch (err: any) {
			console.error('Failed to save email settings:', err);
			return fail(500, { error: true, message: err?.message || 'Failed to save' });
		}
	},

	test: async ({ platform }) => {
		try {
			const db = getDb(platform);
			const settings = await EmailSettingsService.getEmailSettings(db);

			if (!settings.enabled) {
				return fail(400, { error: true, message: 'Email সেন্ডিং নিষ্ক্রিয় আছে। আগে সক্রিয় করুন।' });
			}

			const result = await EmailService.send(db, {
				to: { email: settings.fromEmail, name: 'Test' },
				subject: 'Test Email from Haq Plus Store',
				html: '<p>এটি একটি পরীক্ষামূলক ইমেইল। সব ঠিক আছে! ✅</p>'
			});

			if (!result.success) {
				return fail(500, { error: true, message: result.error || 'Send failed' });
			}

			return { success: true, testSent: true };
		} catch (err: any) {
			return fail(500, { error: true, message: err?.message || 'Test failed' });
		}
	}
};
