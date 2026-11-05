import type { EmailAddress, EmailMessage, EmailProvider, SendResult } from '../types';

/** Resend HTTP API provider — works on Cloudflare Workers (no raw TCP needed) */
export class ResendEmailProvider implements EmailProvider {
	private apiKey: string;

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	private formatAddress(addr: EmailAddress): string {
		return addr.name ? `${addr.name} <${addr.email}>` : addr.email;
	}

	async send(message: EmailMessage): Promise<SendResult> {
		const toList = Array.isArray(message.to) ? message.to : [message.to];

		const payload: Record<string, any> = {
			from: message.from ? this.formatAddress(message.from) : message.from,
			to: toList.map((a) => this.formatAddress(a)),
			subject: message.subject,
			html: message.html
		};

		if (message.text) payload.text = message.text;
		if (message.replyTo) payload.reply_to = this.formatAddress(message.replyTo);

		try {
			const res = await fetch('https://api.resend.com/emails', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			const json: any = await res.json();

			if (!res.ok) {
				return { success: false, error: json?.message || `Resend error ${res.status}` };
			}

			return { success: true, messageId: json.id };
		} catch (err: any) {
			return { success: false, error: err?.message || 'Network error' };
		}
	}
}
