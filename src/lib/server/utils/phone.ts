/**
 * Phone Number Normalization & Validation Utility for Bangladesh
 */

const banglaToEnglishDigits: Record<string, string> = {
	'০': '0',
	'১': '1',
	'২': '2',
	'৩': '3',
	'৪': '4',
	'৫': '5',
	'৬': '6',
	'৭': '7',
	'৮': '8',
	'৯': '9'
};

/**
 * Normalizes phone number strings:
 * - Converts Bangla numerals to English numerals
 * - Strips out dashes, spaces, brackets
 * - Strips leading +88 or 88
 * - Returns clean 11-digit BD number (e.g. 01712345678)
 */
export function normalizeBdPhone(phone: string): string {
	if (!phone) return '';

	// 1. Convert Bangla digits to English
	let converted = phone
		.trim()
		.split('')
		.map((char) => banglaToEnglishDigits[char] || char)
		.join('');

	// 2. Remove all non-digits
	converted = converted.replace(/\D/g, '');

	// 3. Remove leading +88 or 88
	if (converted.startsWith('880')) {
		converted = converted.slice(2);
	}

	return converted;
}

/**
 * Validates if the given string is a valid 11-digit Bangladeshi mobile number
 * Operators: 013, 014, 015, 016, 017, 018, 019
 */
export function isValidBdPhone(phone: string): boolean {
	const normalized = normalizeBdPhone(phone);
	return /^01[3-9]\d{8}$/.test(normalized);
}
