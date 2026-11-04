const MAX_SLUG_LENGTH = 120;

/**
 * Turns any title into a URL slug. Letters and digits from every script are kept, so a
 * Bangla name gives a Bangla slug instead of an empty one.
 */
export function slugify(text: string): string {
	return text
		.normalize('NFC')
		.toLowerCase()
		.trim()
		.replace(/[^\p{L}\p{N}\p{M}]+/gu, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, MAX_SLUG_LENGTH)
		.replace(/-+$/g, '');
}
