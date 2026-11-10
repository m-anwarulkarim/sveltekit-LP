import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const siteUrl = (url?.origin || url?.origin || 'https://example.com').replace(/\/$/, '');

	const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /account/
Disallow: /checkout/
Disallow: /thank-you

# Automated Dynamic Sitemaps
Sitemap: ${siteUrl}/sitemap.xml
`;

	return new Response(robotsTxt, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800'
		}
	});
};

