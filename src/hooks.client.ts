import type { HandleClientError } from '@sveltejs/kit';

export const handleError: HandleClientError = ({ error, event }) => {
	console.error('[SvelteKit Client Error at', event?.url?.pathname || 'unknown', ']:', error);
	return {
		message: (error as any)?.message || 'ব্রাউজারে তথ্য লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে পেজটি রিলোড দিন।'
	};
};
