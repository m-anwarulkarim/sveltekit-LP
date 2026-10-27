import { defineEnvVars } from '@sveltejs/kit/env';

/**
 * SvelteKit Environment Variables Definition
 */
export const variables = defineEnvVars({
	CLOUDFLARE_ACCOUNT_ID: {
		description: 'Cloudflare Account ID for accessing D1 database and Cloudflare services.'
	},
	CLOUDFLARE_DATABASE_ID: {
		description: 'Cloudflare D1 Database UUID (e.g. `85e821c2-73e0-4490-b87a-66babacf5720`).'
	},
	CLOUDFLARE_D1_TOKEN: {
		description: 'Cloudflare API Token with D1 read/write permissions for Drizzle migrations.'
	},
	ORIGIN: {
		description: 'The app origin (base URL), e.g. `http://localhost:5173` or `https://lp.haqplus.com`.'
	},
	BETTER_AUTH_SECRET: {
		description:
			'Secret used to sign tokens. For production use 32 characters generated with high entropy. See [Better Auth installation](https://www.better-auth.com/docs/installation).'
	}
});

/**
 * Strongly typed interface for all .env environment variables
 */
export interface EnvVariables {
	/** Cloudflare Account ID for D1 database and edge services */
	CLOUDFLARE_ACCOUNT_ID: string;

	/** Cloudflare D1 Database UUID */
	CLOUDFLARE_DATABASE_ID: string;

	/** Cloudflare API token with D1 permissions for migrations */
	CLOUDFLARE_D1_TOKEN: string;

	/** Application base URL origin, e.g. http://localhost:5173 */
	ORIGIN: string;

	/** Better-Auth encryption secret (32+ high entropy characters) */
	BETTER_AUTH_SECRET: string;
}

export type Env = EnvVariables;
