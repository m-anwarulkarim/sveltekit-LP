import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type * as schema from '../db/schema';
import type { EmailSettings } from '../email/types';
import { DEFAULT_EMAIL_SETTINGS } from '../email/types';
import { SettingsService } from './settings.service';

export class EmailSettingsService {
	static async getEmailSettings(
		db: DrizzleD1Database<typeof schema>
	): Promise<EmailSettings> {
		try {
			const s = await SettingsService.getSettingsGroup(db, 'email');
			return {
				provider: (s.provider as EmailSettings['provider']) || DEFAULT_EMAIL_SETTINGS.provider,
				fromName: String(s.from_name || DEFAULT_EMAIL_SETTINGS.fromName),
				fromEmail: String(s.from_email || DEFAULT_EMAIL_SETTINGS.fromEmail),
				resendApiKey: String(s.resend_api_key || ''),
				enabled: s.enabled !== undefined ? Boolean(s.enabled) : DEFAULT_EMAIL_SETTINGS.enabled
			};
		} catch {
			return { ...DEFAULT_EMAIL_SETTINGS };
		}
	}

	static async saveEmailSettings(
		db: DrizzleD1Database<typeof schema>,
		config: Partial<EmailSettings>
	): Promise<EmailSettings> {
		const mapping: [string, any][] = [
			['provider', config.provider ?? DEFAULT_EMAIL_SETTINGS.provider],
			['from_name', String(config.fromName ?? DEFAULT_EMAIL_SETTINGS.fromName).trim()],
			['from_email', String(config.fromEmail ?? DEFAULT_EMAIL_SETTINGS.fromEmail).trim()],
			['resend_api_key', String(config.resendApiKey ?? '').trim()],
			['enabled', Boolean(config.enabled)]
		];

		for (const [key, val] of mapping) {
			await SettingsService.setSetting(db, 'email', key, val);
		}

		return this.getEmailSettings(db);
	}
}
