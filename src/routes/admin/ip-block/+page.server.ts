import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { SecurityService } from '#lib/server/services/security.service';

export const load: PageServerLoad = async ({ parent, platform, url }) => {
	const parentData = await parent();
	const searchQuery = url.searchParams.get('q') || '';
	const page = Number(url.searchParams.get('page')) || 1;
	const limit = Number(url.searchParams.get('limit')) || 10;
	const offset = (page - 1) * limit;

	let blockedList: any[] = [];
	let totalCount = 0;

	if (platform?.env?.DB) {
		try {
			const db = getDb(platform.env.DB);
			const result = await SecurityService.listBlockedIps(db, {
				search: searchQuery,
				limit,
				offset
			});
			blockedList = result.items || [];
			totalCount = result.totalCount || 0;
		} catch (error) {
			console.error('Failed to load blocked IPs from D1:', error);
		}
	}

	return {
		...parentData,
		blockedList,
		totalCount,
		currentPage: page,
		perPage: limit
	};
};

export const actions: Actions = {
	blockIp: async ({ request, platform }) => {
		const data = await request.formData();
		const ipAddress = data.get('ipAddress')?.toString()?.trim() || '';
		const phoneNo = data.get('phoneNo')?.toString()?.trim() || '';
		const reason = data.get('reason')?.toString()?.trim() || 'Suspected Fraudulent Orders';
		const isPermanent = data.get('isPermanent') !== 'false';

		if (!ipAddress && !phoneNo) {
			return { success: false, message: 'আইপি অ্যাড্রেস অথবা ফোন নম্বর দেওয়া বাধ্যতামূলক!' };
		}

		const targetIp = ipAddress || '103.45.12.89';

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				const res = await SecurityService.blockIp(db, {
					ipAddress: targetIp,
					phoneNo: phoneNo || undefined,
					reason,
					type: 'Manual Admin Block',
					isPermanent
				});
				return { success: true, item: res, message: `'${targetIp}' সফলভাবে ব্লক লিস্টে যুক্ত করা হয়েছে!` };
			} catch (e: any) {
				console.error('Failed to block IP in D1:', e);
				return { success: false, message: e.message || 'আইপি ব্লক করতে সমস্যা হয়েছে' };
			}
		}

		return {
			success: true,
			item: {
				id: 'blk-' + Date.now(),
				ipAddress: targetIp,
				phoneNo: phoneNo || '-'
			},
			message: `'${targetIp}' সফলভাবে ব্লক লিস্টে যুক্ত করা হয়েছে!`
		};
	},

	unblockIp: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const ipAddress = data.get('ipAddress')?.toString() || '';

		if (!id && !ipAddress) {
			return { success: false, message: 'Block ID or IP required' };
		}

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				await SecurityService.unblockIp(db, id || ipAddress);
				return { success: true, message: `আইপি '${ipAddress || id}' সফলভাবে আনব্লক করা হয়েছে!` };
			} catch (e: any) {
				console.error('Failed to unblock IP in D1:', e);
				return { success: false, message: e.message };
			}
		}

		return { success: true, message: `আইপি '${ipAddress || id}' সফলভাবে আনব্লক করা হয়েছে!` };
	},

	bulkUnblock: async ({ request, platform }) => {
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
				await SecurityService.bulkUnblock(db, ids);
				return { success: true, message: `${ids.length}টি আইপি সফলভাবে আনব্লক করা হয়েছে!` };
			} catch (e: any) {
				console.error('Failed to bulk unblock in D1:', e);
				return { success: false, message: e.message };
			}
		}

		return { success: true, message: `${ids.length}টি আইপি সফলভাবে আনব্লক করা হয়েছে!` };
	}
};
