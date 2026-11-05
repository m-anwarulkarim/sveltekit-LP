import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { oneTap } from 'better-auth/plugins';
import { getRequestEvent } from '$app/server';
import { getDb } from '#lib/server/db/index.ts';
import { SettingsService } from '#lib/server/services/settings.service';
import { getGoogleClientId, getGoogleClientSecret } from '#lib/server/secrets';
import { EmailService, verifyEmailTemplate, passwordResetTemplate } from '#lib/server/email/index';

export interface AuthOptions {
	googleClientId?: string;
	googleClientSecret?: string;
	enableOneTap?: boolean;
}

export const createAuth = (
	d1: D1Database,
	secret: string,
	baseURL: string,
	opts: AuthOptions = {}
) => {
	if (!d1 || !secret) return null;

	const hasGoogle = Boolean(opts.googleClientId && opts.googleClientSecret);
	const socialProviders: Record<string, any> = {};
	if (hasGoogle) {
		socialProviders.google = {
			clientId: opts.googleClientId,
			clientSecret: opts.googleClientSecret
		};
	}

	const plugins: any[] = [sveltekitCookies(getRequestEvent)];
	// One-Tap depends on the Google provider; it also validates id_tokens using the same client ID.
	if (hasGoogle && opts.enableOneTap) {
		plugins.push(oneTap());
	}

	const db = getDb(d1);

	return betterAuth({
		baseURL,
		secret,
		trustedOrigins: [baseURL],
		emailAndPassword: {
			enabled: true,
			sendResetPassword: async ({ user, url }) => {
				const tmpl = passwordResetTemplate({ userName: user.name, resetUrl: url });
				await EmailService.sendTemplate(db, { email: user.email, name: user.name }, tmpl);
			}
		},
		emailVerification: {
			sendVerificationEmail: async ({ user, url }) => {
				const tmpl = verifyEmailTemplate({ userName: user.name, verificationUrl: url });
				await EmailService.sendTemplate(db, { email: user.email, name: user.name }, tmpl);
			}
		},
		socialProviders,
		plugins,
		database: drizzleAdapter(db, { provider: 'sqlite' })
	});
};

/**
 * Resolves auth options from the admin's D1 configuration, falling back to env vars when
 * either the switch is off or credentials are missing. This way env vars can still be used
 * for first-time bootstrap, but once an admin saves credentials they become the source of truth.
 */
export async function resolveAuthOptions(d1: D1Database): Promise<AuthOptions> {
	try {
		const cfg = await SettingsService.getSocialLoginConfig(getDb(d1));
		if (cfg.enableGoogleLogin && cfg.googleClientId && cfg.googleClientSecret) {
			return {
				googleClientId: cfg.googleClientId,
				googleClientSecret: cfg.googleClientSecret,
				enableOneTap: Boolean(cfg.enableOneTap)
			};
		}
	} catch (err) {
		console.error('Failed to load social login config from D1:', err);
	}
	return {
		googleClientId: getGoogleClientId() || undefined,
		googleClientSecret: getGoogleClientSecret() || undefined,
		enableOneTap: false
	};
}
