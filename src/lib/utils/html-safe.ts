/**
 * Helpers for the few places that must build raw HTML for <svelte:head>.
 * Values come from the database, so they must not be able to close the tag they sit in.
 */

/** Builds a JSON-LD script tag. Escaping "<" stops a value from ending the script early. */
export function jsonLdScript(data: unknown): string {
	const json = JSON.stringify(data).replace(/</g, '\\u003c');
	return `<script type="application/ld+json">${json}</script>`;
}

/** Turns rich text into plain text for meta tags and short previews. */
export function plainText(html: string | null | undefined, maxLength = 200): string {
	const text = (html ?? '')
		.replace(/<[^>]*>/g, ' ')
		.replace(/&nbsp;/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
	return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text;
}

const CSS_COLOR =/^(#[0-9a-f]{3,8}|(rgb|rgba|hsl|hsla|oklch)\([0-9a-z\s.,%/-]+\))$/i;

/** Returns the color if it is a plain CSS color value, otherwise the fallback. */
export function safeCssColor(value: unknown, fallback: string): string {
	return typeof value === 'string' && CSS_COLOR.test(value.trim()) ? value.trim() : fallback;
}
