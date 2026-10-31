import { json, type RequestHandler } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import { MediaService } from '#lib/server/services/media.service';
import { R2Service } from '#lib/server/services/r2.service';

export const POST: RequestHandler = async ({ request, platform }) => {
	try {
		const contentType = request.headers.get('content-type') || '';
		let fileName = 'image.png';
		let mimeType = 'image/png';
		let folder = 'products';
		let buffer: ArrayBuffer;
		let formattedSize = '100 KB';

		if (contentType.includes('multipart/form-data')) {
			const formData = await request.formData();
			const file = formData.get('file') as File | null;
			folder = (formData.get('folder') as string) || 'products';

			if (!file) {
				return json({ success: false, message: 'No file provided' }, { status: 400 });
			}

			// Validate 5 MB limit
			const MAX_SIZE = 5 * 1024 * 1024;
			if (file.size > MAX_SIZE) {
				return json(
					{
						success: false,
						message: 'ফাইলের সাইজ ৫ MB এর বেশি হতে পারবে না (Maximum size 5 MB)'
					},
					{ status: 400 }
				);
			}

			fileName = file.name;
			mimeType = file.type || 'image/png';
			formattedSize =
				file.size > 1024 * 1024
					? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
					: `${Math.round(file.size / 1024)} KB`;

			buffer = await file.arrayBuffer();
		} else {
			// JSON request (handles base64 or direct URL)
			const body = await request.json();
			const { dataUrl, name, folder: reqFolder = 'products' } = body;
			folder = reqFolder;

			if (!dataUrl) {
				return json({ success: false, message: 'No image data provided' }, { status: 400 });
			}

			fileName = name || 'image.png';

			// If it's already an HTTP URL, save directly
			if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
				const db = getDb(platform);
				const created = await MediaService.addMedia(db, {
					name: fileName,
					url: dataUrl,
					folder,
					size: 'Web URL',
					dimensions: '800 x 800'
				});
				return json({ success: true, url: dataUrl, item: created });
			}

			const uploadRes = await R2Service.uploadBase64(dataUrl, {
				platform,
				folder,
				filename: fileName
			});

			const db = getDb(platform);
			const created = await MediaService.addMedia(db, {
				name: fileName,
				url: uploadRes.url,
				folder,
				size: `${Math.round(uploadRes.sizeBytes / 1024)} KB`,
				dimensions: '800 x 800',
				mimeType: optionsMime(uploadRes.url)
			});

			return json({ success: true, url: uploadRes.url, item: created });
		}

		// Upload binary buffer to R2
		const uploadRes = await R2Service.uploadBuffer(buffer, {
			platform,
			folder,
			filename: fileName,
			mimeType
		});

		// Save record in D1 media_assets table
		const db = getDb(platform);
		const created = await MediaService.addMedia(db, {
			name: fileName,
			url: uploadRes.url,
			folder,
			size: formattedSize,
			dimensions: '800 x 800',
			mimeType
		});

		return json({
			success: true,
			url: uploadRes.url,
			item: created
		});
	} catch (error: any) {
		console.error('API /api/admin/media/upload error:', error);
		return json(
			{
				success: false,
				message: error?.message || 'ছবি আপলোড করতে ব্যর্থ হয়েছে'
			},
			{ status: 500 }
		);
	}
};

function optionsMime(url: string): string {
	if (url.endsWith('.webp')) return 'image/webp';
	if (url.endsWith('.jpg') || url.endsWith('.jpeg')) return 'image/jpeg';
	if (url.endsWith('.svg')) return 'image/svg+xml';
	return 'image/png';
}
