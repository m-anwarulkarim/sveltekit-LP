import { defineEnvVars } from '@sveltejs/kit/env';

/**
 * SvelteKit Environment Variables Definition
 *
 * NOTE: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, CLOUDFLARE_D1_TOKEN are
 * intentionally NOT listed here. They are only used by Drizzle CLI (drizzle.config.ts)
 * and local Node.js scripts for migrations — NOT by the production Cloudflare Worker.
 * In the Worker, D1 is accessed via the native `DB` binding (cloudflare:workers env).
 * Listing them here would cause SvelteKit to treat them as MISSING and crash the server.
 */
export const variables = defineEnvVars({
	ORIGIN: {
		description: 'The app origin (base URL), e.g. `http://localhost:5173` or `https://lp.haqplus.com`.'
	},
	BETTER_AUTH_SECRET: {
		description:
			'Secret used to sign tokens. For production use 32 characters generated with high entropy. See [Better Auth installation](https://www.better-auth.com/docs/installation).'
	}
});

/**
 * Strongly typed interface for runtime environment variables available in the Worker.
 * Migration-only vars (CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, CLOUDFLARE_D1_TOKEN)
 * are accessed directly via `process.env` in drizzle.config.ts and scratch scripts.
 */
export interface EnvVariables {
	/** Application base URL origin, e.g. http://localhost:5173 */
	ORIGIN: string;

	/** Better-Auth encryption secret (32+ high entropy characters) */
	BETTER_AUTH_SECRET: string;
}

export type Env = EnvVariables;
