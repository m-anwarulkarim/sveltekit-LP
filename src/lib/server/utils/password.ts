/**
 * Pure Web Crypto API Password Hashing and Utility
 * 100% compatible with Cloudflare Workers (edge) and Node.js environments.
 */

function bufferToHex(buffer: ArrayBuffer): string {
	return Array.from(new Uint8Array(buffer))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

function hexToBuffer(hex: string): Uint8Array {
	const bytes = new Uint8Array(hex.length / 2);
	for (let i = 0; i < hex.length; i += 2) {
		bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
	}
	return bytes;
}

/**
 * Hashes a plaintext password with a random 16-byte salt using PBKDF2 SHA-256
 */
export async function hashPassword(password: string): Promise<string> {
	if (!password) return '';
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const enc = new TextEncoder();
	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		enc.encode(password),
		{ name: 'PBKDF2' },
		false,
		['deriveBits', 'deriveKey']
	);

	const derivedKey = await crypto.subtle.deriveBits(
		{
			name: 'PBKDF2',
			salt,
			iterations: 100000,
			hash: 'SHA-256'
		},
		keyMaterial,
		256
	);

	const saltHex = bufferToHex(salt.buffer);
	const hashHex = bufferToHex(derivedKey);
	return `${saltHex}:${hashHex}`;
}

/**
 * Verifies a plaintext password against a stored `salt:hash` string
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
	if (!password || !storedHash || !storedHash.includes(':')) {
		return false;
	}

	try {
		const [saltHex, originalHashHex] = storedHash.split(':');
		const salt = hexToBuffer(saltHex);
		const enc = new TextEncoder();
		const keyMaterial = await crypto.subtle.importKey(
			'raw',
			enc.encode(password),
			{ name: 'PBKDF2' },
			false,
			['deriveBits', 'deriveKey']
		);

		const derivedKey = await crypto.subtle.deriveBits(
			{
				name: 'PBKDF2',
				salt: salt.buffer as ArrayBuffer,
				iterations: 100000,
				hash: 'SHA-256'
			},
			keyMaterial,
			256
		);

		const derivedHashHex = bufferToHex(derivedKey);
		return derivedHashHex === originalHashHex;
	} catch (err) {
		console.error('Password verification error:', err);
		return false;
	}
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

	let result = '';
	// Ensure at least one from each required category
	result += upper[Math.floor(Math.random() * upper.length)];
	result += lower[Math.floor(Math.random() * lower.length)];
	result += digits[Math.floor(Math.random() * digits.length)];
	result += symbols[Math.floor(Math.random() * symbols.length)];

	for (let i = 4; i < length; i++) {
		result += all[Math.floor(Math.random() * all.length)];
	}

	// Shuffle
	return result
		.split('')
		.sort(() => Math.random() - 0.5)
		.join('');
}

