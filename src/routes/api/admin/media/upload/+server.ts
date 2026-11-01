import { json, type RequestHandler } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import { MediaService } from '#lib/server/services/media.service';
import { R2Service } from '#lib/server/services/r2.service';
import { MEDIA_MENU_IDS, hasAnyMenuAccess } from '#lib/constants/admin-permissions';

const MAX_SIZE = 5 * 1024 * 1024;

// SVG is excluded on purpose: it can carry scripts that run on this site's origin.
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
	'image/png': 'png',
	'image/jpeg': 'jpg',
	'image/webp': 'webp',
	'image/gif': 'gif',
	'image/avif': 'avif'
};

const INVALID_TYPE_MESSAGE = 'শুধুমাত্র PNG, JPG, WEBP, GIF বা AVIF ছবি আপলোড করা যাবে।';
const TOO_LARGE_MESSAGE = 'ফাইলের সাইজ ৫ MB এর বেশি হতে পারবে না (Maximum size 5 MB)';

function cleanFolder(value: unknown): string {
	const folder = typeof value === 'string' ? value : '';
	return /^[a-z0-9_-]+(\/[a-z0-9_-]+)*$/i.test(folder) ? folder : 'products';
}

/** The stored extension always comes from the verified type, never from the client's name. */
function cleanFileName(name: unknown, extension: string): string {
	const base = (typeof name === 'string' ? name : 'image').replace(/\.[^/.]+$/, '') || 'image';
	return `${base}.${extension}`;
}

function formatSize(bytes: number): string {
	return bytes > 1024 * 1024
		? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
		: `${Math.round(bytes / 1024)} KB`;
}

export const POST: RequestHandler = async ({ request, platform, locals }) => {
	const admin = locals.admin!;
	const canUpload = (folder: string) =>
		folder === 'avatars' ||
		admin.role === 'Owner' ||
		hasAnyMenuAccess(admin.permissions, MEDIA_MENU_IDS);
	const forbidden = () => json({ success: false, message: 'Forbidden' }, { status: 403 });

	try {
		const contentType = request.headers.get('content-type') || '';
		const db = getDb(platform);

		if (contentType.includes('multipart/form-data')) {
			const formData = await request.formData();
			const file = formData.get('file');
			const folder = cleanFolder(formData.get('folder'));
			if (!canUpload(folder)) return forbidden();

			if (!(file instanceof File)) {
				return json({ success: false, message: 'No file provided' }, { status: 400 });
			}
			if (file.size > MAX_SIZE) {
				return json({ success: false, message: TOO_LARGE_MESSAGE }, { status: 400 });
			}

			const extension = ALLOWED_IMAGE_TYPES[file.type];
			if (!extension) {
				return json({ success: false, message: INVALID_TYPE_MESSAGE }, { status: 400 });
			}

			const fileName = cleanFileName(file.name, extension);
			const uploadRes = await R2Service.uploadBuffer(await file.arrayBuffer(), {
				platform,
				folder,
				filename: fileName,
				mimeType: file.type
			});

			const created = await MediaService.addMedia(db, {
				name: fileName,
				url: uploadRes.url,
				folder,
				size: formatSize(file.size),
				dimensions: '800 x 800',
				mimeType: file.type
			});

			return json({ success: true, url: uploadRes.url, item: created });
		}

		// JSON request (handles base64 or direct URL)
		const body = (await request.json()) as { dataUrl?: unknown; name?: unknown; folder?: unknown };
		const dataUrl = typeof body?.dataUrl === 'string' ? body.dataUrl : '';
		const folder = cleanFolder(body?.folder);
		if (!canUpload(folder)) return forbidden();

		if (!dataUrl) {
			return json({ success: false, message: 'No image data provided' }, { status: 400 });
		}

		// If it's already an HTTP URL, save directly
		if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
			const created = await MediaService.addMedia(db, {
				name: typeof body?.name === 'string' ? body.name : 'image',
				url: dataUrl,
				folder,
				size: 'Web URL',
				dimensions: '800 x 800'
			});
			return json({ success: true, url: dataUrl, item: created });
		}

		const declaredType = dataUrl.match(/^data:([^;,]+)[;,]/)?.[1]?.toLowerCase() ?? '';
		const extension = ALLOWED_IMAGE_TYPES[declaredType];
		if (!extension) {
			return json({ success: false, message: INVALID_TYPE_MESSAGE }, { status: 400 });
		}
		// Base64 encodes 3 bytes as 4 characters.
		if (dataUrl.length > (MAX_SIZE * 4) / 3 + 100) {
			return json({ success: false, message: TOO_LARGE_MESSAGE }, { status: 400 });
		}

		const fileName = cleanFileName(body?.name, extension);
		const uploadRes = await R2Service.uploadBase64(dataUrl, {
			platform,
			folder,
			filename: fileName
		});

		const created = await MediaService.addMedia(db, {
			name: fileName,
			url: uploadRes.url,
			folder,
			size: formatSize(uploadRes.sizeBytes),
			dimensions: '800 x 800',
			mimeType: declaredType
		});

		return json({ success: true, url: uploadRes.url, item: created });
	} catch (error) {
		console.error('API /api/admin/media/upload error:', error);
		return json({ success: false, message: 'ছবি আপলোড করতে ব্যর্থ হয়েছে' }, { status: 500 });
	}
};
