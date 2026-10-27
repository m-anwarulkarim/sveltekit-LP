import type { PageServerLoad } from './$types';
import { INITIAL_PRODUCTS } from '../../../../_data';

export const load: PageServerLoad = async ({ params, parent }) => {
	const layoutData = await parent();
	const products = (layoutData?.products && layoutData.products.length > 0)
		? layoutData.products
		: INITIAL_PRODUCTS;

	const product = products.find((p: any) => p.id === params.id || p.slug === params.id) || null;

	return {
		product,
		productId: params.id
	};
};
