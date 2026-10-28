import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ platform }) => {
	const siteUrl = 'https://lp.haqplus.com';
	const now = new Date().toISOString().split('T')[0];

	interface SitemapUrl {
		url: string;
		priority: string;
		changefreq: string;
		lastmod?: string;
	}

	// Static Core Routes
	const staticRoutes: SitemapUrl[] = [
		{ url: `${siteUrl}/`, priority: '1.0', changefreq: 'daily' },
		{ url: `${siteUrl}/catalog`, priority: '0.9', changefreq: 'daily' },
		{ url: `${siteUrl}/categories`, priority: '0.8', changefreq: 'weekly' },
		{ url: `${siteUrl}/combos`, priority: '0.8', changefreq: 'weekly' },
		{ url: `${siteUrl}/track-order`, priority: '0.7', changefreq: 'monthly' },
		{ url: `${siteUrl}/about`, priority: '0.5', changefreq: 'monthly' },
		{ url: `${siteUrl}/contact`, priority: '0.5', changefreq: 'monthly' },
		{ url: `${siteUrl}/shipping`, priority: '0.4', changefreq: 'monthly' },
		{ url: `${siteUrl}/return-policy`, priority: '0.4', changefreq: 'monthly' },
		{ url: `${siteUrl}/privacy`, priority: '0.3', changefreq: 'monthly' },
		{ url: `${siteUrl}/terms`, priority: '0.3', changefreq: 'monthly' },
		{ url: `${siteUrl}/faq`, priority: '0.6', changefreq: 'weekly' }
	];

	let dynamicProductUrls: SitemapUrl[] = [];

	if (platform?.env?.DB) {
		try {
			const db = getDb(platform.env.DB);
			const publishedProducts = await db
				.select({
					slug: schema.products.slug,
					updatedAt: schema.products.updatedAt
				})
				.from(schema.products)
				.where(eq(schema.products.status, 'active'))
				.all();

			dynamicProductUrls = publishedProducts.map((p) => ({
				url: `${siteUrl}/products/${p.slug}`,
				priority: '0.9',
				changefreq: 'weekly',
				lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString().split('T')[0] : now
			}));
		} catch (e) {
			console.error('Error generating dynamic product sitemap:', e);
		}
	}

	const allUrls = [...staticRoutes, ...dynamicProductUrls];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
	.map(
		(entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod || now}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400'
		}
	});
};
