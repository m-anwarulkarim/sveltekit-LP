import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import { MediaService } from '#lib/server/services/media.service';
import { R2Service } from '#lib/server/services/r2.service';
import type { GalleryImage } from '../_data/gallery';

export const load: PageServerLoad = async ({ parent, platform }) => {
	const parentData = await parent();

	let galleryImages: GalleryImage[] = [];
	try {
		galleryImages = (await MediaService.listMedia(getDb(platform), { limit: 500 })) as GalleryImage[];
	} catch (error) {
		console.error('Failed to load gallery images from D1:', error);
	}

	return { ...parentData, galleryImages };
};

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const FOLDERS = ['products', 'categories', 'banners', 'stickers', 'general'] as const;
// SVG is excluded on purpose: it can carry scripts that run on this site's origin.
const IMAGE_DATA_URL = /^data:image\/(png|jpeg|webp|gif|avif);base64,/i;

export const actions: Actions = {
	uploadImage: async ({ request, platform }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString()?.trim() || 'Untitled Image';
		const url = data.get('url')?.toString()?.trim() || '';
		const rawFolder = data.get('folder')?.toString() || 'products';
		const folder = (FOLDERS as readonly string[]).includes(rawFolder) ? rawFolder : 'products';
		const dimensions = data.get('dimensions')?.toString() || '800 x 800';

		if (!url) {
			return fail(400, { message: 'ইমেজ ফাইল আবশ্যক।' });
		}
		if (!IMAGE_DATA_URL.test(url)) {
			return fail(400, { message: 'শুধুমাত্র PNG, JPG, WEBP, GIF বা AVIF ছবি আপলোড করা যাবে।' });
		}
		// Base64 encodes 3 bytes as 4 characters.
		if (url.length > (MAX_UPLOAD_BYTES * 4) / 3 + 100) {
			return fail(400, { message: 'ফাইলের সাইজ ৫ MB এর বেশি হতে পারবে না।' });
		}

		// The file must reach storage; a base64 string is never kept in the database.
		let stored: { url: string; sizeBytes: number };
		try {
			stored = await R2Service.uploadBase64(url, { platform, folder, filename: name || 'image.png' });
		} catch (e) {
			console.error('Failed to upload gallery image to R2:', e);
			return fail(500, { message: 'ছবি স্টোরেজে আপলোড করা যায়নি। আবার চেষ্টা করুন।' });
		}

		try {
			const db = getDb(platform);
			const uploaded = await MediaService.addMedia(db, {
				name,
				url: stored.url,
				folder,
				size: `${Math.max(1, Math.round(stored.sizeBytes / 1024))} KB`,
				dimensions
			});
			return { success: true, uploaded, message: 'ছবি সফলভাবে গ্যালারিতে সংরক্ষিত হয়েছে!' };
		} catch (error) {
			console.error('Failed to save media in D1:', error);
			return fail(500, { message: 'ছবি সংরক্ষণে ত্রুটি হয়েছে।' });
		}
	},

	deleteImage: async ({ request, platform }) => {
		const id = (await request.formData()).get('id')?.toString();
		if (!id) return fail(400, { message: 'ছবির আইডি আবশ্যক।' });

		const res = await MediaService.deleteMedia(getDb(platform), id, platform);
		if (!res.success) return fail(500, { message: 'ছবি মুছতে ব্যর্থ হয়েছে।' });
		return { success: true, deletedId: id, message: 'ছবি সফলভাবে মুছে ফেলা হয়েছে!' };
	},

	bulkDelete: async ({ request, platform }) => {
		const rawIds = (await request.formData()).get('ids')?.toString();
		let ids: string[] = [];
		try {
			ids = JSON.parse(rawIds || '[]');
		} catch {
			ids = rawIds ? rawIds.split(',') : [];
		}
		ids = ids.filter((id) => typeof id === 'string' && id);
		if (ids.length === 0) return fail(400, { message: 'কোনো ছবি নির্বাচন করা হয়নি।' });

		const res = await MediaService.bulkDeleteMedia(getDb(platform), ids, platform);
		if (res.failed > 0) {
			return fail(500, { message: `${res.failed}টি ছবি মুছতে ব্যর্থ হয়েছে।` });
		}
		return { success: true, message: `${ids.length}টি ছবি সফলভাবে মুছে ফেলা হয়েছে!` };
	}
};
