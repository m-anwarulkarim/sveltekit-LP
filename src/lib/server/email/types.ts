export interface EmailAddress {
	email: string;
	name?: string;
}

export interface EmailMessage {
	to: EmailAddress | EmailAddress[];
	subject: string;
	html: string;
	text?: string;
	from?: EmailAddress;
	replyTo?: EmailAddress;
}

export interface SendResult {
	success: boolean;
	messageId?: string;
	error?: string;
}

export interface EmailProvider {
	send(message: EmailMessage): Promise<SendResult>;
}

export type EmailProviderType = 'resend' | 'console';

export interface EmailSettings {
	provider: EmailProviderType;
	fromName: string;
	fromEmail: string;
	resendApiKey: string;
	enabled: boolean;
}

export const DEFAULT_EMAIL_SETTINGS: EmailSettings = {
	provider: 'console',
	fromName: 'Store',
	fromEmail: 'noreply@example.com',
	resendApiKey: '',
	enabled: false
};
