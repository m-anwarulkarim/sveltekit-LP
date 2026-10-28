import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { adminId } = await request.json();

		if (!adminId || adminId === 'owner') {
			cookies.delete('admin_active_id', { path: '/' });
			return json({ success: true, message: 'Owner একাউন্টে ফিরে যাওয়া হয়েছে' });
		}

		cookies.set('admin_active_id', adminId, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7 // 7 days
		});

		return json({ success: true, message: 'অ্যাডমিন ভিউ পরিবর্তন করা হয়েছে' });
	} catch (err: any) {
		return json({ success: false, message: err.message }, { status: 500 });
	}
};

