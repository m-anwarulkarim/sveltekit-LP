import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /account/
Disallow: /checkout/
Disallow: /thank-you

# Automated Sitemaps
Sitemap: https://lp.haqplus.com/sitemap.xml
`;

	return new Response(robotsTxt, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800'
		}
	});
};

