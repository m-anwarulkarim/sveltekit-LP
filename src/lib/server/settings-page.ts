import { fail } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import { SettingsService } from '#lib/server/services/settings.service';

const MASKED = '••••••••';

/**
 * Shared load/save handlers for simple admin settings pages.
 * Only keys present in `defaults` are read and written (whitelist),
 * so a tampered payload can never write outside its own group.
 * Keys listed in `secretKeys` are masked on load and preserved on save
 * unless the admin types a new value — raw secrets never reach the browser.
 */
export function makeSettingsPage<T extends Record<string, unknown>>(
	group: string,
	defaults: T,
	secretKeys: (keyof T & string)[] = []
) {
	return {
		load: async ({ platform }: { platform: App.Platform | undefined }) => {
			const db = getDb(platform);
			const saved = await SettingsService.getSettingsGroup(db, group);
			const settings: Record<string, unknown> = { ...defaults };
			for (const key of Object.keys(defaults)) {
				if (key in saved) settings[key] = saved[key];
			}
			for (const key of secretKeys) {
				if (settings[key]) settings[key] = MASKED;
			}
			return { settings: settings as T };
		},
		actions: {
			save: async ({ request, platform }: { request: Request; platform: App.Platform | undefined }) => {
				const raw = (await request.formData()).get('settings')?.toString();
				if (!raw) return fail(400, { message: 'সেটিংস ডেটা পাওয়া যায়নি' });

				let parsed: Record<string, unknown>;
				try {
					parsed = JSON.parse(raw);
				} catch {
					return fail(400, { message: 'সেটিংস ডেটা সঠিক নয়' });
				}

				const db = getDb(platform);
				const existing = secretKeys.length > 0 ? await SettingsService.getSettingsGroup(db, group) : {};
				for (const key of Object.keys(defaults)) {
					if (!(key in parsed)) continue;
					let value = parsed[key];
					if ((secretKeys as string[]).includes(key)) {
						// Masked or cleared secret means "keep what is already stored".
						if (value === MASKED || (!value && existing[key])) value = existing[key];
					}
					await SettingsService.setSetting(db, group, key, value);
				}
				return { success: true };
			}
		}
	};
}
