import { env as cfEnv } from 'cloudflare:workers';
import { env as dynamicPrivateEnv } from '$env/dynamic/private';

const LEAKED_AUTH_SECRET = 'aura_acoustics_production_jwt_sec_99881122';
const MIN_SECRET_LENGTH = 32;
const DEFAULT_AUTH_SECRET = 'sDVHN55YKBnEqrsW9Tm9lRvY4sWhP4q4';

let _platformEnv: Record<string, unknown> | null = null;

/**
 * Call once from hooks.server.ts on the first request to inject platform.env,
 * which is the only reliable source for Cloudflare dashboard variables.
 */
export function initPlatformEnv(platform: App.Platform | undefined): void {
	if (!_platformEnv && platform) {
		_platformEnv = (platform as any).env ?? null;
	}
}

function readEnv(name: string): string {
	const raw =
		(_platformEnv?.[name] as string | undefined) ||
		((cfEnv as unknown as Record<string, unknown>)?.[name] as string | undefined) ||
		dynamicPrivateEnv?.[name] ||
		'';
	return String(raw).replace(/^["']|["']$/g, '').trim();
}

/**
 * Returns the signing secret.
 * Prefers BETTER_AUTH_SECRET from environment; falls back to DEFAULT_AUTH_SECRET.
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
