import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const filterParam = event.url.searchParams.get('filter');
	if (filterParam && filterParam !== 'all') {
		throw redirect(307, `/categories/${filterParam}`);
	}
	throw redirect(307, '/catalog/all-category');
};
