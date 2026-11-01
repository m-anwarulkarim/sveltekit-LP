import { env as cfEnv } from 'cloudflare:workers';
import { env as dynamicPrivateEnv } from '$env/dynamic/private';

// This value was committed to git, so it must never be accepted as a signing key again.
const LEAKED_AUTH_SECRET = 'aura_acoustics_production_jwt_sec_99881122';
const MIN_SECRET_LENGTH = 32;

function readEnv(name: string): string {
	const raw =
		((cfEnv as unknown as Record<string, unknown>)?.[name] as string | undefined) ||
		dynamicPrivateEnv?.[name] ||
		'';
	return String(raw).replace(/^["']|["']$/g, '').trim();
}

/**
 * Returns the signing secret, or null when it is missing or unsafe.
 * Callers must fail closed on null: nothing may be signed with a fallback value.
 */
export function getAuthSecret(): string | null {
	const secret = readEnv('BETTER_AUTH_SECRET');
	if (!secret || secret === LEAKED_AUTH_SECRET || secret.length < MIN_SECRET_LENGTH) {
		console.error(
			'BETTER_AUTH_SECRET is missing, too short, or a leaked value. Authentication is disabled until it is rotated.'
		);
		return null;
	}
	return secret;
}

/** Break-glass Owner password. Only set while bootstrapping or recovering access. */
export function getAdminBootstrapPassword(): string | null {
	return readEnv('ADMIN_BOOTSTRAP_PASSWORD') || null;
}
