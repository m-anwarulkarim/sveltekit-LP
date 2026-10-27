import type { Actions, PageServerLoad } from './$types';
import { getGalleryImages, addGalleryImage, deleteGalleryImage, type GalleryImage } from '../_data/gallery.ts';

export const load: PageServerLoad = async ({ parent }) => {
	const parentData = await parent();
	const galleryImages = getGalleryImages();
	return {
		...parentData,
		galleryImages
	};
};

export const actions: Actions = {
	uploadImage: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString() || 'Untitled Image';
		const url = data.get('url')?.toString() || '';
		const folder = (data.get('folder')?.toString() || 'products') as GalleryImage['folder'];
		const size = data.get('size')?.toString() || '50 KB';
		const dimensions = data.get('dimensions')?.toString() || '800 x 800';

		if (!url) {
			return { success: false, message: 'ইমেজ ফাইল বা ইউআরএল আবশ্যক।' };
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
		return { success: true, uploaded: newImage };
	},

	deleteImage: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return { success: false, message: 'Image ID required' };

		deleteGalleryImage(id);
		return { success: true, deletedId: id };
	}
};

