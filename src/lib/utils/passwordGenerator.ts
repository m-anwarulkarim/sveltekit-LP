/**
 * Client-safe random password generator
 */
export function generateRandomPassword(length: number = 10): string {
	const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
	const lower = 'abcdefghijkmnpqrstuvwxyz';
	const digits = '23456789';
	const symbols = '@#$!&';
	const all = upper + lower + digits + symbols;

	let result = '';
	result += upper[Math.floor(Math.random() * upper.length)];
	result += lower[Math.floor(Math.random() * lower.length)];
	result += digits[Math.floor(Math.random() * digits.length)];
	result += symbols[Math.floor(Math.random() * symbols.length)];

	for (let i = 4; i < length; i++) {
		result += all[Math.floor(Math.random() * all.length)];
	}

	return result
		.split('')
		.sort(() => Math.random() - 0.5)
		.join('');
}

