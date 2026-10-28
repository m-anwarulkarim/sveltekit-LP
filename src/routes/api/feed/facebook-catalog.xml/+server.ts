import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db';
import { CatalogService } from '#lib/server/services/catalog.service';

export const GET: RequestHandler = async ({ url, platform }) => {
	const db = getDb(platform);
	const origin = url.origin;

	try {
		const xmlData = await CatalogService.generateXmlFeed(db, origin);

		return new Response(xmlData, {
			headers: {
				'Content-Type': 'application/xml; charset=utf-8',
				'Content-Disposition': 'inline; filename="facebook-catalog.xml"',
				'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
			}
		});
	} catch (err: any) {
		console.error('Failed to generate Facebook catalog XML:', err);
		return new Response('Error generating catalog feed', { status: 500 });
	}
};

