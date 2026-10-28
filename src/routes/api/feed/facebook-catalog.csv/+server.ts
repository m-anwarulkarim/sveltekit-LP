import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db';
import { CatalogService } from '#lib/server/services/catalog.service';

export const GET: RequestHandler = async ({ url, platform }) => {
	const db = getDb(platform);
	const origin = url.origin;

	try {
		const csvData = await CatalogService.generateCsvFeed(db, origin);

		return new Response(csvData, {
			headers: {
				'Content-Type': 'text/csv; charset=utf-8',
				'Content-Disposition': 'inline; filename="facebook-catalog.csv"',
				'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
			}
		});
	} catch (err: any) {
		console.error('Failed to generate Facebook catalog CSV:', err);
		return new Response('Error generating catalog feed', { status: 500 });
	}
};

