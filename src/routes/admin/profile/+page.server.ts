import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import { AdminProfileService } from '#lib/server/services/admin-profile.service';

export const load: PageServerLoad = async ({ platform }) => {
	try {
		const db = getDb(platform);
		const profile = await AdminProfileService.getOwnerProfile(db);
		return { profile };
	} catch (error: any) {
		console.error('Failed to load admin profile:', error);
		// Fallback safe default
		return {
			profile: {
				id: '1',
				name: 'Thecolorlighthouse',
				username: 'thecolorlighthouse',
				email: 'contact@thecolorlighthouse.com',
				phone: '01780081623',
				role: 'OWNER',
				avatarUrl: null,
				avatarBg: 'bg-black text-pink-500 border-pink-500/40',
				avatarText: 'COLOR LIGHT',
				hasPassword: true,
				createdAt: new Date('2025-09-03'),
				updatedAt: new Date()
			}
		};
	}
};

export const actions: Actions = {
	updateProfile: async ({ request, platform }) => {
		const data = await request.formData();
		const adminId = data.get('adminId')?.toString()?.trim();
		const name = data.get('name')?.toString()?.trim() || '';
		const username = data.get('username')?.toString()?.trim() || '';
		const email = data.get('email')?.toString()?.trim() || '';
		const phone = data.get('phone')?.toString()?.trim() || '';

		if (!adminId || !name || !username || !email) {
			return fail(400, {
				action: 'updateProfile',
				success: false,
				message: 'নাম, ইউজারনেম এবং ইমেইল পূরণ করা আবশ্যক!'
			});
		}

		try {
			const db = getDb(platform);
			const res = await AdminProfileService.updateProfile(db, adminId, {
				name,
				username,
				email,
				phone
			});
			return {
				action: 'updateProfile',
				success: true,
				message: res.message
			};
		} catch (error: any) {
			console.error('updateProfile error:', error);
			let msg = error.message || 'প্রোফাইল আপডেট ব্যর্থ হয়েছে!';
			if (msg.includes('UNIQUE constraint failed') || msg.includes('Failed query:')) {
				if (msg.includes('admin_users.email')) {
					msg = 'এই ইমেইলটি ইতিমধ্যে অন্য একটি অ্যাডমিন অ্যাকাউন্টে ব্যবহৃত হচ্ছে!';
				} else if (msg.includes('admin_users.username')) {
					msg = 'এই ইউজারনেমটি ইতিমধ্যে অন্য একটি অ্যাকাউন্টে ব্যবহৃত হচ্ছে!';
				} else {
					msg = 'ডাটাবেস ভ্যালিডেশন ত্রুটি! অনুগ্রহ করে তথ্য যাচাই করুন।';
				}
			}
			return fail(400, {
				action: 'updateProfile',
				success: false,
				message: msg
			});
		}
	},

	updateAvatar: async ({ request, platform }) => {
		const data = await request.formData();
		const adminId = data.get('adminId')?.toString()?.trim();
		const avatarUrl = data.get('avatarUrl')?.toString()?.trim();

		if (!adminId || !avatarUrl) {
			return fail(400, {
				action: 'updateAvatar',
				success: false,
				message: 'প্রোফাইল ছবি নির্বাচন করা আবশ্যক!'
			});
		}

		if (avatarUrl.length > 500 * 1024) {
			return fail(400, {
				action: 'updateAvatar',
				success: false,
				message: 'ছবির সাইজ অনেক বড়। অনুগ্রহ করে ছোট সাইজের ছবি আপলোড করুন।'
			});
		}

		try {
			const db = getDb(platform);
			const res = await AdminProfileService.updateAvatar(db, adminId, avatarUrl);
			return {
				action: 'updateAvatar',
				success: true,
				message: res.message
			};
		} catch (error: any) {
			console.error('updateAvatar error:', error);
			let userMsg = error.message || 'ছবি আপডেট ব্যর্থ হয়েছে!';
			if (userMsg.includes('Failed query') || userMsg.includes('D1_ERROR') || userMsg.includes('data:image')) {
				userMsg = 'ডাটাবেজে ছবি সংরক্ষণ করতে সমস্যা হয়েছে। ছবির সাইজ খুব বড় হতে পারে।';
			}
			return fail(400, {
				action: 'updateAvatar',
				success: false,
				message: userMsg
			});
		}
	},

	changePassword: async ({ request, platform }) => {
		const data = await request.formData();
		const adminId = data.get('adminId')?.toString()?.trim();
		const currentPassword = data.get('currentPassword')?.toString() || '';
		const newPassword = data.get('newPassword')?.toString() || '';
		const confirmPassword = data.get('confirmPassword')?.toString() || '';

		if (!adminId) {
			return fail(400, {
				action: 'changePassword',
				success: false,
				message: 'অ্যাডমিন আইডি পাওয়া যায়নি!'
			});
		}

		if (!newPassword || newPassword.length < 6) {
			return fail(400, {
				action: 'changePassword',
				success: false,
				message: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!'
			});
		}

		if (newPassword !== confirmPassword) {
			return fail(400, {
				action: 'changePassword',
				success: false,
				message: 'নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মেলেনি!'
			});
		}

		try {
			const db = getDb(platform);
			const res = await AdminProfileService.changePassword(db, adminId, {
				currentPassword,
				newPassword,
				confirmPassword
			});
			return {
				action: 'changePassword',
				success: true,
				message: res.message
			};
		} catch (error: any) {
			console.error('changePassword error:', error);
			return fail(400, {
				action: 'changePassword',
				success: false,
				message: error.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে!'
			});
		}
	}
};
