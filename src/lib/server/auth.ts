import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { getDb } from '#lib/server/db/index.ts';

export const createAuth = (
	d1: D1Database,
	secret: string,
	baseURL: string,
	googleClientId?: string,
	googleClientSecret?: string
) => {
	if (!d1 || !secret) return null;

	const socialProviders: Record<string, any> = {};
	if (googleClientId && googleClientSecret) {
		socialProviders.google = {
			clientId: googleClientId,
			clientSecret: googleClientSecret
		};
	}

	return betterAuth({
		baseURL,
		secret,
		trustedOrigins: [baseURL],
		emailAndPassword: { enabled: true },
		socialProviders,
		plugins: [sveltekitCookies(getRequestEvent)],
		database: drizzleAdapter(getDb(d1), { provider: 'sqlite' })
	});
};
