import { json, type RequestHandler } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import { MediaService } from '#lib/server/services/media.service';
import { R2Service } from '#lib/server/services/r2.service';

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
		return json({ success: false, items: [], error: 'Server error' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, platform }) => {
	try {
		const body = (await request.json()) as any;
		let { name, url, folder = 'products', size = '100 KB', dimensions = '800 x 800', mimeType } = body;

		if (!url) {
			return json({ success: false, message: 'Image URL is required' }, { status: 400 });
		}

		// If base64 data URI, upload directly to R2 to prevent D1 database bloat
		if (url.startsWith('data:')) {
			// SVG can carry scripts, so only plain raster images may be stored.
			if (!/^data:image\/(png|jpeg|webp|gif|avif)[;,]/i.test(url)) {
				return json({ success: false, message: 'শুধুমাত্র PNG, JPG, WEBP, GIF বা AVIF ছবি আপলোড করা যাবে।' }, { status: 400 });
			}
			try {
				const r2Res = await R2Service.uploadBase64(url, {
					platform,
					folder,
					filename: name || 'image.png'
				});
				url = r2Res.url;
				size = `${Math.round(r2Res.sizeBytes / 1024)} KB`;
			} catch (e) {
				console.error('Failed to upload base64 to R2, proceeding with url:', e);
			}
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
		return json({ success: false, message: 'Failed to save media' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ request, platform, url }) => {
	try {
		const db = getDb(platform);
		let ids: string[] = [];
		let imageUrl: string | null = null;

		const paramId = url.searchParams.get('id');
		const paramIds = url.searchParams.get('ids');
		const paramUrl = url.searchParams.get('url');

		if (paramId) ids.push(paramId);
		if (paramIds) ids.push(...paramIds.split(',').filter(Boolean));
		if (paramUrl) imageUrl = paramUrl;

		if (request.headers.get('content-type')?.includes('application/json')) {
			try {
				const body = (await request.json()) as any;
				if (body.id) ids.push(body.id);
				if (Array.isArray(body.ids)) ids.push(...body.ids);
				if (body.url) imageUrl = body.url;
			} catch (_) {}
		}

		ids = Array.from(new Set(ids.filter(Boolean)));

		if (imageUrl) {
			await MediaService.deleteMediaByUrl(db, imageUrl, platform);
		}

		if (ids.length === 1) {
			await MediaService.deleteMedia(db, ids[0], platform);
		} else if (ids.length > 1) {
			await MediaService.bulkDeleteMedia(db, ids, platform);
		}

		return json({ success: true });
	} catch (error: any) {
		console.error('API /api/admin/media DELETE error:', error);
		return json({ success: false, message: 'Failed to delete media' }, { status: 500 });
	}
};


