import type { EmailMessage, EmailProvider, SendResult } from '../types';

/** Dev/fallback provider — logs email to console instead of sending */
export class ConsoleEmailProvider implements EmailProvider {
	async send(message: EmailMessage): Promise<SendResult> {
		const to = Array.isArray(message.to) ? message.to : [message.to];
		console.log('[EMAIL DEV]', {
			to: to.map((a) => a.email).join(', '),
			subject: message.subject,
			html: message.html.slice(0, 200) + '...'
		});
		return { success: true, messageId: `console-${Date.now()}` };
	}
}
