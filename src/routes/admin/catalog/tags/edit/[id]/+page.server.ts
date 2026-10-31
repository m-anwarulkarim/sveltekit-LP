import type { Actions, PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import { TagService } from '#lib/server/services/tag.service';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, platform, parent }) => {
	const parentData = await parent();
	const db = getDb(platform);
	const tag = await TagService.getTag(db, params.id);

	if (!tag) {
		throw error(404, 'ট্যাগ পাওয়া যায়নি');
	}

	return {
		...parentData,
		tag
	};
};

export const actions: Actions = {
	default: async ({ params, request, platform }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString()?.trim();
		const homeShow = (data.get('homeShow')?.toString() as 'Yes' | 'No') || 'Yes';
		const priority = data.get('priority')?.toString()?.trim() || '-';
		const status = (data.get('status')?.toString() as 'publish' | 'draft') || 'publish';

		if (!name) {
			return fail(400, { success: false, message: 'ট্যাগের নাম দেওয়া বাধ্যতামূলক' });
		}

		try {
			const db = getDb(platform);
			await TagService.updateTag(db, params.id, {
				name,
				homeShow,
				priority,
				status
			});
		} catch (e: any) {
			console.error('Failed to update tag in D1:', e);
			return fail(500, { success: false, message: e.message || 'ট্যাগ আপডেটে সমস্যা হয়েছে' });
		}

		throw redirect(303, '/admin/catalog/tags');
	}
};

