import { env as cfEnv } from 'cloudflare:workers';
import { env as dynamicPrivateEnv } from '$env/dynamic/private';

// These values were committed to git, so they must never be accepted as signing keys again.
const REJECTED_SECRETS = new Set([
	'aura_acoustics_production_jwt_sec_99881122',
	'sDVHN55YKBnEqrsW9Tm9lRvY4sWhP4q4'
]);
const MIN_SECRET_LENGTH = 32;

function readEnv(name: string): string {
	const raw =
		((cfEnv as unknown as Record<string, unknown>)?.[name] as string | undefined) ||
		dynamicPrivateEnv?.[name] ||
		'';
	return String(raw).replace(/^["']|["']$/g, '').trim();
}

let secretWarned = false;

/**
 * Returns the signing secret from BETTER_AUTH_SECRET env var.
 * Returns empty string when unconfigured — callers treat that as "auth unavailable".
 */
export function getAuthSecret(): string {
	const secret = readEnv('BETTER_AUTH_SECRET');
	if (secret && !REJECTED_SECRETS.has(secret) && secret.length >= MIN_SECRET_LENGTH) {
		return secret;
	}
	if (!secretWarned) {
		secretWarned = true;
		console.error(
			'SECURITY: BETTER_AUTH_SECRET is missing, too short, or uses a leaked value. ' +
			'Admin and customer auth will not work until a valid secret is configured.'
		);
	}
	return '';
}

export function getGoogleClientId(): string | null {
	return readEnv('GOOGLE_CLIENT_ID') || null;
}

export function getGoogleClientSecret(): string | null {
	return readEnv('GOOGLE_CLIENT_SECRET') || null;
}

/** Break-glass Owner password. Only set while bootstrapping or recovering access. */
export function getAdminBootstrapPassword(): string | null {
	return readEnv('ADMIN_BOOTSTRAP_PASSWORD') || null;
}
