import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { SecurityService } from '#lib/server/services/security.service';

export const load: PageServerLoad = async ({ parent, platform, url }) => {
	const parentData = await parent();
	const searchQuery = url.searchParams.get('q') || '';
	const filterType = (url.searchParams.get('filter') as 'all' | 'permanent' | 'auto' | 'manual') || 'all';
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const limit = Math.max(1, Math.min(100, Number(url.searchParams.get('limit')) || 10));
	const offset = (page - 1) * limit;

	let blockedList: any[] = [];
	let totalCount = 0;
	let stats = {
		total: 0,
		permanent: 0,
		auto: 0,
		manual: 0
	};

	if (platform?.env?.DB) {
		try {
			const db = getDb(platform.env.DB);
			const result = await SecurityService.listBlockedIps(db, {
				search: searchQuery,
				filterType,
				limit,
				offset
			});
			blockedList = result.items || [];
			totalCount = result.totalCount || 0;
			stats = result.stats;
		} catch (error) {
			console.error('Failed to load blocked IPs from D1:', error);
		}
	}

	return {
		...parentData,
		blockedList,
		totalCount,
		stats,
		currentPage: page,
		perPage: limit,
		filterType,
		searchQuery
	};
};

export const actions: Actions = {
	blockIp: async ({ request, platform }) => {
		const data = await request.formData();
		const ipAddress = data.get('ipAddress')?.toString()?.trim() || '';
		const phoneNo = data.get('phoneNo')?.toString()?.trim() || '';
		const deviceId = data.get('deviceId')?.toString()?.trim() || '-';
		const type = data.get('type')?.toString()?.trim() || 'Manual Admin Block';
		const reason = data.get('reason')?.toString()?.trim() || 'Suspected Fraudulent Orders';
		const duration = data.get('duration')?.toString() || 'permanent';

		if (!ipAddress && !phoneNo) {
			return { success: false, message: 'আইপি অ্যাড্রেস অথবা ফোন নম্বর দেওয়া আবশ্যক!' };
		}

		let isPermanent = duration === 'permanent';
		let blockUntil: Date | null = null;

		if (!isPermanent) {
			const now = new Date();
			if (duration === '24h') {
				blockUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);
			} else if (duration === '7d') {
				blockUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
			} else if (duration === '30d') {
				blockUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
			}
		}

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				const res = await SecurityService.blockIp(db, {
					ipAddress: ipAddress || '103.45.12.89',
					phoneNo: phoneNo || undefined,
					deviceId: deviceId !== '-' ? deviceId : undefined,
					type,
					reason,
					isPermanent,
					blockUntil
				});
				return {
					success: true,
					item: res,
					message: `'${ipAddress || phoneNo}' সফলভাবে ব্লকলিস্টে যুক্ত করা হয়েছে!`
				};
			} catch (e: any) {
				console.error('Failed to block IP in D1:', e);
				return { success: false, message: e.message || 'আইপি ব্লক করতে সমস্যা হয়েছে' };
			}
		}

		return {
			success: true,
			item: {
				id: 'blk-' + Date.now(),
				ipAddress: ipAddress || '103.45.12.89',
				phoneNo: phoneNo || '-'
			},
			message: `'${ipAddress || phoneNo}' সফলভাবে ব্লকলিস্টে যুক্ত করা হয়েছে!`
		};
	},

	updateBlock: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const ipAddress = data.get('ipAddress')?.toString()?.trim();
		const phoneNo = data.get('phoneNo')?.toString()?.trim();
		const reason = data.get('reason')?.toString()?.trim();
		const duration = data.get('duration')?.toString();

		if (!id) {
			return { success: false, message: 'Block ID is required' };
		}

		let isPermanent: boolean | undefined = undefined;
		let blockUntil: Date | null | undefined = undefined;

		if (duration) {
			isPermanent = duration === 'permanent';
			if (!isPermanent) {
				const now = new Date();
				if (duration === '24h') {
					blockUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);
				} else if (duration === '7d') {
					blockUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
				} else if (duration === '30d') {
					blockUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
				}
			} else {
				blockUntil = null;
			}
		}

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				await SecurityService.updateBlock(db, id, {
					ipAddress,
					phoneNo,
					reason,
					isPermanent,
					blockUntil
				});
				return { success: true, message: 'ব্লক রেকর্ড সফলভাবে আপডেট করা হয়েছে!' };
			} catch (e: any) {
				console.error('Failed to update block in D1:', e);
				return { success: false, message: e.message };
			}
		}

		return { success: true, message: 'ব্লক রেকর্ড আপডেট করা হয়েছে!' };
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
			return { success: false, message: 'কোনো আইটেম নির্বাচন করা হয়নি।' };
		}

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				await SecurityService.bulkUnblock(db, ids);
				return { success: true, message: `${ids.length}টি আইটেম সফলভাবে আনব্লক করা হয়েছে!` };
			} catch (e: any) {
				console.error('Failed to bulk unblock in D1:', e);
				return { success: false, message: e.message };
			}
		}

		return { success: true, message: `${ids.length}টি আইটেম সফলভাবে আনব্লক করা হয়েছে!` };
	}
};
