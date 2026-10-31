import type { Actions, PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import { TagService } from '#lib/server/services/tag.service';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent }) => {
	const parentData = await parent();
	return {
		...parentData
	};
};

export const actions: Actions = {
	default: async ({ request, platform }) => {
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
			await TagService.createTag(db, {
				name,
				homeShow,
				priority,
				status
			});
		} catch (e: any) {
			console.error('Failed to create tag in D1:', e);
			return fail(500, { success: false, message: e.message || 'ট্যাগ তৈরিতে সমস্যা হয়েছে' });
		}

		throw redirect(303, '/admin/catalog/tags');
	}
};

