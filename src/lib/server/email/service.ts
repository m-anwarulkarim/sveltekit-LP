import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type * as schema from '../db/schema';
import type { EmailMessage, EmailSettings, SendResult } from './types';
import { createProvider } from './providers/index';
import { EmailSettingsService } from '../services/email-settings.service';

export class EmailService {
	private static cachedSettings: EmailSettings | null = null;

	/** Sends a raw EmailMessage using the configured provider from D1 */
	static async send(
		db: DrizzleD1Database<typeof schema>,
		message: EmailMessage
	): Promise<SendResult> {
		const settings = await EmailSettingsService.getEmailSettings(db);

		if (!settings.enabled) {
			console.log('[EmailService] Email sending is disabled in admin settings.');
			return { success: false, error: 'Email sending is disabled.' };
		}

		const provider = createProvider(settings);

		// Inject store from address if not provided in the message
		if (!message.from) {
			message.from = { name: settings.fromName, email: settings.fromEmail };
		}

		return provider.send(message);
	}

	/** Sends a pre-rendered template email */
	static async sendTemplate(
		db: DrizzleD1Database<typeof schema>,
		to: { email: string; name?: string },
		template: { subject: string; html: string; text?: string }
	): Promise<SendResult> {
		return this.send(db, {
			to,
			subject: template.subject,
			html: template.html,
			text: template.text
		});
	}
}
