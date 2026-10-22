import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { getDb } from '#lib/server/db/index.ts';

export const createAuth = (d1: D1Database, secret?: string, baseURL?: string) => {
	if (!d1) return null;
	const resolvedSecret = secret || 'aura_acoustics_production_jwt_sec_99881122';
	const resolvedBaseURL = baseURL || 'https://lp.haqplus.com';

	return betterAuth({
		baseURL: resolvedBaseURL,
		secret: resolvedSecret,
		emailAndPassword: { enabled: true },
		plugins: [
			sveltekitCookies(getRequestEvent)
		],
		database: drizzleAdapter(getDb(d1), { provider: 'sqlite' })
	});
};
