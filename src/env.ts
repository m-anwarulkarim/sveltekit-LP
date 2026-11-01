import { defineEnvVars } from '@sveltejs/kit/env';

/**
 * SvelteKit Environment Variables Definition
 *
 * NOTE: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, CLOUDFLARE_D1_TOKEN, USE_REMOTE_D1,
 * R2_PUBLIC_URL, R2_BUCKET_NAME, BETTER_AUTH_SECRET, ADMIN_BOOTSTRAP_PASSWORD are intentionally NOT listed in defineEnvVars here.
 * They are accessed via platform.env / process.env.
 * Listing them in defineEnvVars causes SvelteKit runtime validator to treat them as
 * MISSING on the Cloudflare Edge Worker and throw an Error 1101 uncaught exception!
 */
export const variables = defineEnvVars({
	ORIGIN: {
		description: 'The app origin (base URL), e.g. `http://localhost:5173` or `https://lp.haqplus.com`.'
	}
});

/**
 * Strongly typed interface for all environment variables used in the project.
 */
export interface EnvVariables {
	/** Cloudflare Account ID (for migrations & CLI) */
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
	BETTER_AUTH_SECRET?: string;

	/** Break-glass Owner password. Remove it once the Owner has set a real password. */
	ADMIN_BOOTSTRAP_PASSWORD?: string;
}

export type Env = EnvVariables;
