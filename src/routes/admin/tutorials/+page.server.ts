import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { TutorialService, DEFAULT_TUTORIALS, type TutorialItem } from '#lib/server/services/tutorial.service';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent, platform }) => {
	const parentData = await parent();
	let tutorials: TutorialItem[] = DEFAULT_TUTORIALS;

	try {
		const db = getDb(platform);
		tutorials = await TutorialService.getTutorials(db);
	} catch (e) {
		console.error('Failed to load tutorials in page.server.ts:', e);
	}

	return {
		...parentData,
		tutorials
	};
};

export const actions: Actions = {
	create: async ({ request, platform }) => {
		const data = await request.formData();
		const title = data.get('title')?.toString()?.trim();
		const youtubeUrlOrId = data.get('youtubeUrlOrId')?.toString()?.trim();
		const duration = data.get('duration')?.toString()?.trim() || '০৫:০০ মিনিট';
		const category = data.get('category')?.toString()?.trim() || 'Getting Started';
		const rawTags = data.get('tags')?.toString()?.trim() || '';

		if (!title || !youtubeUrlOrId) {
			return fail(400, {
				error: true,
				message: 'ভিডিওর শিরোনাম এবং ইউটিউব লিংক আবশ্যক।'
			});
		}

		const tags = rawTags
			? rawTags.split(',').map((t) => t.trim()).filter(Boolean)
			: ['Tutorial', category];

		try {
			const db = getDb(platform);
			const created = await TutorialService.addTutorial(db, {
				title,
				youtubeUrlOrId,
				duration,
				category,
				tags
			});

			return {
				success: true,
				message: 'নতুন ভিডিও টিউটোরিয়াল সফলভাবে যুক্ত হয়েছে!',
				created
			};
		} catch (e: any) {
			console.error('Failed to create tutorial:', e);
			return fail(500, {
				error: true,
				message: e.message || 'টিউটোরিয়াল সংরক্ষণ করতে ব্যর্থ হয়েছে।'
			});
		}
	},

	delete: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString()?.trim();

		if (!id) {
			return fail(400, {
				error: true,
				message: 'ভিডিও আইডি পাওয়া যায়নি।'
			});
		}

		try {
			const db = getDb(platform);
			await TutorialService.deleteTutorial(db, id);

			return {
				success: true,
				message: 'টিউটোরিয়াল সফলভাবে মুছে ফেলা হয়েছে।'
			};
		} catch (e: any) {
			console.error('Failed to delete tutorial:', e);
			return fail(500, {
				error: true,
				message: e.message || 'টিউটোরিয়াল মুছতে ব্যর্থ হয়েছে।'
			});
		}
	}
};

