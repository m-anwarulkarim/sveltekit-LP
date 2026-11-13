import { env as cfEnv } from 'cloudflare:workers';
import { env as dynamicPrivateEnv } from '$env/dynamic/private';

const LEAKED_AUTH_SECRET = 'aura_acoustics_production_jwt_sec_99881122';
const MIN_SECRET_LENGTH = 32;
const DEFAULT_AUTH_SECRET = 'sDVHN55YKBnEqrsW9Tm9lRvY4sWhP4q4';

function readEnv(name: string): string {
	const raw =
		((cfEnv as unknown as Record<string, unknown>)?.[name] as string | undefined) ||
		dynamicPrivateEnv?.[name] ||
		'';
	return String(raw).replace(/^["']|["']$/g, '').trim();
}

/**
 * Returns the signing secret.
 * Falls back to DEFAULT_AUTH_SECRET if missing in Cloudflare environment bindings.
 */
export function getAuthSecret(): string {
	const secret = readEnv('BETTER_AUTH_SECRET');
	if (secret && secret !== LEAKED_AUTH_SECRET && secret.length >= MIN_SECRET_LENGTH) {
		return secret;
	}
	return DEFAULT_AUTH_SECRET;
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
