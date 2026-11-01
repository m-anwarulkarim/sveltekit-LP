import xss from 'xss';

// The package is CommonJS: its helpers live on the default export at runtime.
const { FilterXSS, getDefaultWhiteList } = xss as unknown as typeof import('xss');

const whiteList = getDefaultWhiteList();
const RICH_TEXT_TAGS = [
	'p', 'div', 'span', 'br', 'hr', 'b', 'strong', 'i', 'em', 'u', 's', 'sub', 'sup', 'small',
	'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
	'table', 'thead', 'tbody', 'tr', 'th', 'td'
];
for (const tag of RICH_TEXT_TAGS) {
	whiteList[tag] = [...new Set([...(whiteList[tag] ?? []), 'style', 'class', 'align'])];
}
whiteList.a = ['href', 'title', 'target', 'rel', 'class', 'style'];
whiteList.img = ['src', 'alt', 'title', 'width', 'height', 'loading', 'class', 'style'];

const filter = new FilterXSS({
	whiteList,
	stripIgnoreTag: true,
	stripIgnoreTagBody: ['script', 'style', 'iframe', 'object', 'embed', 'noscript']
});

/** Cleans rich text from the editor so it is safe to render with {@html}. Use it on the server. */
export function sanitizeRichText(html: string | null | undefined): string {
	return html ? filter.process(html) : '';
}
