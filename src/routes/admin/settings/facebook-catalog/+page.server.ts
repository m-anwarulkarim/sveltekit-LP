import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { getDb } from '#lib/server/db';
import { CatalogService, type FacebookCatalogSettings } from '#lib/server/services/catalog.service';

export const load: PageServerLoad = async ({ platform, url }) => {
	const db = getDb(platform);
	const [settings, diagnostics] = await Promise.all([
		CatalogService.getSettings(db),
		CatalogService.getDiagnostics(db)
	]);

	return {
		settings,
		diagnostics,
		origin: url.origin
	};
};

export const actions: Actions = {
	saveSettings: async ({ request, platform }) => {
		const formData = await request.formData();
		const rawSettings = formData.get('settings')?.toString();

		if (!rawSettings) {
			return fail(400, { message: 'ক্যাটালগ সেটিংস পাওয়া যায়নি' });
		}

		try {
			const parsed = JSON.parse(rawSettings) as FacebookCatalogSettings;
			const db = getDb(platform);
			const success = await CatalogService.saveSettings(db, parsed);

			if (success) {
				return { success: true, message: 'Facebook Catalog সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' };
			} else {
				return fail(500, { message: 'ডাটাবেজে সেটিংস সংরক্ষণ করা যায়নি' });
			}
		} catch (err: any) {
			return fail(500, { message: err?.message || 'সেটিংস সংরক্ষণে অপ্রত্যাশিত সমস্যা' });
		}
	}
};

