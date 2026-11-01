/**
 * Pure Web Crypto API Password Hashing and Utility
 * 100% compatible with Cloudflare Workers (edge) and Node.js environments.
 *
 * Current format : `<32 hex salt>:<pbkdf2-sha256 hex>`
 * Legacy format  : `<16 char salt>:<sha256(password:salt) hex>` (verify only, upgraded on login)
 */

// Cloudflare Workers caps PBKDF2 at 100,000 iterations.
const PBKDF2_ITERATIONS = 100000;
const CURRENT_SALT_HEX_LENGTH = 32;

function bufferToHex(buffer: ArrayBuffer): string {
	return Array.from(new Uint8Array(buffer))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
	const bytes = new Uint8Array(new ArrayBuffer(hex.length / 2));
	for (let i = 0; i < hex.length; i += 2) {
		bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
	}
	return bytes;
}

/** Compares two strings without leaking the position of the first difference. */
export function timingSafeEqual(a: string, b: string): boolean {
	const enc = new TextEncoder();
	const left = enc.encode(a);
	const right = enc.encode(b);
	let diff = left.length ^ right.length;
	const length = Math.max(left.length, right.length);
	for (let i = 0; i < length; i++) {
		diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
	}
	return diff === 0;
}

async function derivePbkdf2Hex(password: string, salt: Uint8Array<ArrayBuffer>): Promise<string> {
	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(password),
		{ name: 'PBKDF2' },
		false,
		['deriveBits']
	);
	const derived = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
		keyMaterial,
		256
	);
	return bufferToHex(derived);
}

/**
 * Hashes a plaintext password with a random 16-byte salt using PBKDF2 SHA-256
 */
export async function hashPassword(password: string): Promise<string> {
	if (!password) return '';
	const salt = crypto.getRandomValues(new Uint8Array(new ArrayBuffer(16)));
	const saltHex = bufferToHex(salt.buffer);
	return `${saltHex}:${await derivePbkdf2Hex(password, salt)}`;
}

/**
 * Verifies a plaintext password against a stored hash in either supported format
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
	if (!password || !storedHash || !storedHash.includes(':')) {
		return false;
	}

	try {
		const [salt, expected] = storedHash.split(':');
		if (salt.length === CURRENT_SALT_HEX_LENGTH) {
			return timingSafeEqual(await derivePbkdf2Hex(password, hexToBytes(salt)), expected);
		}

		const legacy = await crypto.subtle.digest(
			'SHA-256',
			new TextEncoder().encode(`${password}:${salt}`)
		);
		return timingSafeEqual(bufferToHex(legacy), expected);
	} catch (err) {
		console.error('Password verification error:', err);
		return false;
	}
}

/** True when a stored hash uses the legacy format and should be re-hashed after login. */
export function needsPasswordUpgrade(storedHash: string): boolean {
	return storedHash.split(':')[0]?.length !== CURRENT_SALT_HEX_LENGTH;
}

function randomIndex(max: number): number {
	// Rejection sampling keeps the distribution uniform.
	const limit = Math.floor(0x100000000 / max) * max;
	const buffer = new Uint32Array(1);
	do {
		crypto.getRandomValues(buffer);
	} while (buffer[0] >= limit);
	return buffer[0] % max;
}

/**
 * Generates a clean, memorable, secure password for staff/admin
 */
export function generateSecurePassword(length: number = 10): string {
	const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
	const lower = 'abcdefghijkmnpqrstuvwxyz';
	const digits = '23456789';
	const symbols = '@#$!&';
	const all = upper + lower + digits + symbols;

	// Ensure at least one from each required category
	const chars = [
		upper[randomIndex(upper.length)],
		lower[randomIndex(lower.length)],
		digits[randomIndex(digits.length)],
		symbols[randomIndex(symbols.length)]
	];

	for (let i = 4; i < length; i++) {
		chars.push(all[randomIndex(all.length)]);
	}

	// Fisher-Yates shuffle
	for (let i = chars.length - 1; i > 0; i--) {
		const j = randomIndex(i + 1);
		[chars[i], chars[j]] = [chars[j], chars[i]];
	}
	return chars.join('');
}
