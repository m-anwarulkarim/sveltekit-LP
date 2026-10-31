import { defineEnvVars } from '@sveltejs/kit/env';

/**
 * SvelteKit Environment Variables Definition
 *
 * Covers all environment variables used across the application:
 * Cloudflare D1, Cloudflare R2, Better-Auth, and SvelteKit Server.
 */
export const variables = defineEnvVars({
	// 1. Cloudflare D1 Database & Credentials
	CLOUDFLARE_ACCOUNT_ID: {
		description: 'Cloudflare Account ID for API access and D1/R2 management.'
	},
	CLOUDFLARE_DATABASE_ID: {
		description: 'Cloudflare D1 Database ID (UUID) for remote D1 database access.'
	},
	CLOUDFLARE_D1_TOKEN: {
		description: 'Cloudflare API Token with D1 database access permissions.'
	},
	USE_REMOTE_D1: {
		description: 'Flag ("true" or "false") to connect to remote Cloudflare D1 directly in local dev.'
	},

	// 2. Application Base Origin
	ORIGIN: {
		description: 'The app origin (base URL), e.g. `http://localhost:5173` or `https://lp.haqplus.com`.'
	},

	// 3. Cloudflare R2 Object Storage
	R2_PUBLIC_URL: {
		description:
			'Public CDN URL of the Cloudflare R2 bucket for serving images, e.g. `https://pub-fe7043cdba5e4550a7e594df8db06129.r2.dev`.'
	},
	R2_BUCKET_NAME: {
		description: 'Name of the Cloudflare R2 bucket, e.g. `haqplus`.'
	},

	// 4. Authentication Secret
	BETTER_AUTH_SECRET: {
		description:
			'Secret used to sign tokens. For production use 32 characters generated with high entropy. See [Better Auth installation](https://www.better-auth.com/docs/installation).'
	}
});

/**
 * Strongly typed interface for all runtime environment variables.
 */
export interface EnvVariables {
	/** Cloudflare Account ID */
	CLOUDFLARE_ACCOUNT_ID?: string;

	/** Cloudflare D1 Database ID (UUID) */
	CLOUDFLARE_DATABASE_ID?: string;

	/** Cloudflare D1 API Token */
	CLOUDFLARE_D1_TOKEN?: string;

	/** Flag to enable remote Cloudflare D1 connection in local dev */
	USE_REMOTE_D1?: string;

	/** Application base URL origin, e.g. http://localhost:5173 or https://lp.haqplus.com */
	ORIGIN: string;

	/** Cloudflare R2 Public CDN base URL for serving images */
	R2_PUBLIC_URL?: string;

	/** Cloudflare R2 Bucket name */
	R2_BUCKET_NAME?: string;

	/** Better-Auth encryption secret (32+ high entropy characters) */
	BETTER_AUTH_SECRET: string;
}

export type Env = EnvVariables;
