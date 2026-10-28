import type { Actions, PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import { MediaService } from '#lib/server/services/media.service';
import { getGalleryImages, addGalleryImage, deleteGalleryImage, type GalleryImage } from '../_data/gallery';

export const load: PageServerLoad = async ({ parent, platform, url }) => {
	const parentData = await parent();
	const folder = url.searchParams.get('folder') || undefined;
	const search = url.searchParams.get('q') || undefined;

	let galleryImages: GalleryImage[] = [];

	if (platform?.env?.DB) {
		try {
			const db = getDb(platform.env.DB);
			const liveImages = await MediaService.listMedia(db, {
				folder,
				search
			});
			galleryImages = (liveImages || []) as any;
		} catch (error) {
			console.error('Failed to load gallery images from D1:', error);
		}
	}

	return {
		...parentData,
		galleryImages
	};
};

export const actions: Actions = {
	uploadImage: async ({ request, platform }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString()?.trim() || 'Untitled Image';
		const url = data.get('url')?.toString()?.trim() || '';
		const folder = (data.get('folder')?.toString() || 'products') as GalleryImage['folder'];
		const size = data.get('size')?.toString() || '50 KB';
		const dimensions = data.get('dimensions')?.toString() || '800 x 800';

		if (!url) {
			return { success: false, message: 'ইমেজ ফাইল বা ইউআরএল আবশ্যক।' };
		}

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				const uploaded = await MediaService.addMedia(db, {
					name,
					url,
					folder,
					size,
					dimensions
				});
				return { success: true, uploaded, message: 'ছবি সফলভাবে গ্যালারিতে সংরক্ষিত হয়েছে!' };
			} catch (error: any) {
				console.error('Failed to save media in D1:', error);
				return { success: false, message: error.message || 'ছবি আপলোডে ত্রুটি হয়েছে।' };
			}
		}

		const newImage: GalleryImage = {
			id: 'img-' + Date.now(),
			name,
			url,
			folder,
			size,
			dimensions,
			uploadedAt: 'মাত্র এখন'
		};

		addGalleryImage(newImage);
		return { success: true, uploaded: newImage, message: 'ছবি সফলভাবে আপলোড হয়েছে!' };
	},

	deleteImage: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return { success: false, message: 'Image ID required' };

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				await MediaService.deleteMedia(db, id);
				return { success: true, deletedId: id, message: 'ছবি সফলভাবে মুছে ফেলা হয়েছে!' };
			} catch (error: any) {
				console.error('Failed to delete media in D1:', error);
				return { success: false, message: error.message };
			}
		}

		deleteGalleryImage(id);
		return { success: true, deletedId: id, message: 'ছবি সফলভাবে মুছে ফেলা হয়েছে!' };
	},

	bulkDelete: async ({ request, platform }) => {
		const data = await request.formData();
		const rawIds = data.get('ids')?.toString();
		let ids: string[] = [];

		try {
			ids = JSON.parse(rawIds || '[]');
		} catch {
			ids = rawIds ? rawIds.split(',') : [];
		}

		if (ids.length === 0) {
			return { success: false, message: 'No IDs provided' };
		}

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				await MediaService.bulkDeleteMedia(db, ids);
				return { success: true, message: `${ids.length}টি ছবি সফলভাবে মুছে ফেলা হয়েছে!` };
			} catch (error: any) {
				console.error('Failed to bulk delete media in D1:', error);
				return { success: false, message: error.message };
			}
		}

		ids.forEach((id) => deleteGalleryImage(id));
		return { success: true, message: `${ids.length}টি ছবি সফলভাবে মুছে ফেলা হয়েছে!` };
	}
};
