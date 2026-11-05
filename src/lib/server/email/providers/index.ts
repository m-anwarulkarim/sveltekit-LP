import type { EmailProvider, EmailSettings } from '../types';
import { ResendEmailProvider } from './resend.provider';
import { ConsoleEmailProvider } from './console.provider';

export function createProvider(settings: EmailSettings): EmailProvider {
	if (settings.provider === 'resend' && settings.resendApiKey) {
		return new ResendEmailProvider(settings.resendApiKey);
	}
	return new ConsoleEmailProvider();
}
