import { json, type RequestHandler } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import { MediaService } from '#lib/server/services/media.service';

export const GET: RequestHandler = async ({ platform, url }) => {
	const folder = url.searchParams.get('folder') || undefined;
	const search = url.searchParams.get('q') || undefined;
	const limit = Number(url.searchParams.get('limit')) || 60;

	try {
		const db = getDb(platform);
		const items = await MediaService.listMedia(db, { folder, search, limit });
		return json({ success: true, items });
	} catch (error: any) {
		console.error('API /api/admin/media GET error:', error);
		return json({ success: false, items: [], error: error?.message }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, platform }) => {
	try {
		const body = await request.json();
		const { name, url, folder = 'products', size = '100 KB', dimensions = '800 x 800', mimeType } = body;

		if (!url) {
			return json({ success: false, message: 'Image URL is required' }, { status: 400 });
		}

		const db = getDb(platform);
		const created = await MediaService.addMedia(db, {
			name: name || 'Uploaded Image',
			url,
			folder,
			size,
			dimensions,
			mimeType: mimeType || 'image/png'
		});

		return json({ success: true, item: created });
	} catch (error: any) {
		console.error('API /api/admin/media POST error:', error);
		return json({ success: false, message: error?.message || 'Failed to save media' }, { status: 500 });
	}
};

