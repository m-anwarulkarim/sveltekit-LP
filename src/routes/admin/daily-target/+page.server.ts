import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { DailyTargetService, type TargetViewItem } from '#lib/server/services/daily-target.service';

export const load: PageServerLoad = async ({ parent, platform }) => {
	const parentData = await parent();
	let targets: TargetViewItem[] = [];

	try {
		const db = getDb(platform);
		const dbTargets = await DailyTargetService.listTargets(db);
		targets = dbTargets || [];
	} catch (error) {
		console.error('Failed to load daily targets from D1:', error);
	}

	// Calculate comprehensive summary metrics
	const totalTargets = targets.length;
	const activeTargets = targets.filter((t) => t.status === 'active').length;
	const totalTargetAmount = targets.reduce((acc, t) => acc + (t.targetAmount || 0), 0);
	const totalConsumedAmount = targets.reduce((acc, t) => acc + (t.consumedAmount || 0), 0);
	const remainingAmount = Math.max(0, totalTargetAmount - totalConsumedAmount);
	const overallPercent =
		totalTargetAmount > 0
			? Math.min(100, Math.round((totalConsumedAmount / totalTargetAmount) * 100))
			: 0;
	const totalOrdersAchieved = targets.reduce((acc, t) => acc + (t.ordersCount || 0), 0);
	const overallAov =
		totalOrdersAchieved > 0 ? Math.round(totalConsumedAmount / totalOrdersAchieved) : 0;

	return {
		...parentData,
		targets,
		summary: {
			totalTargets,
			activeTargets,
			totalTargetAmount,
			totalConsumedAmount,
			remainingAmount,
			overallPercent,
			totalOrdersAchieved,
			overallAov
		}
	};
};

export const actions: Actions = {
	createTarget: async ({ request, platform }) => {
		const data = await request.formData();
		const title = data.get('title')?.toString()?.trim() || 'Daily Sales Target';
		const startDate = data.get('startDate')?.toString()?.trim() || '';
		const endDate = data.get('endDate')?.toString()?.trim() || '';
		const targetAmountStr = data.get('targetAmount')?.toString()?.trim() || '0';
		const targetAmount = parseFloat(targetAmountStr);

		if (!startDate || !endDate) {
			return { success: false, message: 'শুরুর তারিখ এবং সমাপ্তির তারিখ দেওয়া আবশ্যক!' };
		}

		if (isNaN(targetAmount) || targetAmount <= 0) {
			return { success: false, message: 'সঠিক টার্গেট অ্যামাউন্ট লিখুন!' };
		}

		if (startDate > endDate) {
			return { success: false, message: 'সমাপ্তির তারিখ শুরুর তারিখের আগের হতে পারে না!' };
		}

		try {
			const db = getDb(platform);
			await DailyTargetService.createTarget(db, {
				title,
				startDate,
				endDate,
				targetAmount
			});
			return { success: true, message: `নতুন টার্গেট "${title}" সফলভাবে তৈরি হয়েছে!` };
		} catch (error: any) {
			console.error('Failed to create target in D1:', error);
			return { success: false, message: error?.message || 'টার্গেট তৈরিতে ত্রুটি হয়েছে!' };
		}
	},

	updateTarget: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString()?.trim();
		const title = data.get('title')?.toString()?.trim();
		const startDate = data.get('startDate')?.toString()?.trim();
		const endDate = data.get('endDate')?.toString()?.trim();
		const targetAmountStr = data.get('targetAmount')?.toString()?.trim();
		const status = data.get('status')?.toString()?.trim() as
			| 'active'
			| 'upcoming'
			| 'completed'
			| undefined;

		if (!id) {
			return { success: false, message: 'টার্গেট আইডি পাওয়া যায়নি!' };
		}

		const targetAmount = targetAmountStr ? parseFloat(targetAmountStr) : undefined;
		if (targetAmount !== undefined && (isNaN(targetAmount) || targetAmount <= 0)) {
			return { success: false, message: 'সঠিক টার্গেট অ্যামাউন্ট লিখুন!' };
		}

		if (startDate && endDate && startDate > endDate) {
			return { success: false, message: 'সমাপ্তির তারিখ শুরুর তারিখের আগের হতে পারে না!' };
		}

		try {
			const db = getDb(platform);
			await DailyTargetService.updateTarget(db, id, {
				title,
				startDate,
				endDate,
				targetAmount,
				status
			});
			return { success: true, message: 'টার্গেট সফলভাবে আপডেট করা হয়েছে!' };
		} catch (error: any) {
			console.error('Failed to update target in D1:', error);
			return { success: false, message: error?.message || 'টার্গেট আপডেটে ত্রুটি হয়েছে!' };
		}
	},

	deleteTarget: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString()?.trim();

		if (!id) {
			return { success: false, message: 'টার্গেট আইডি পাওয়া যায়নি!' };
		}

		try {
			const db = getDb(platform);
			await DailyTargetService.deleteTarget(db, id);
			return { success: true, message: 'টার্গেটটি সফলভাবে মুছে ফেলা হয়েছে।' };
		} catch (error: any) {
			console.error('Failed to delete target in D1:', error);
			return { success: false, message: error?.message || 'টার্গেট মুছতে ত্রুটি হয়েছে!' };
		}
	}
};
