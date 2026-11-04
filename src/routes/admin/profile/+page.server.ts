import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import { AdminProfileService } from '#lib/server/services/admin-profile.service';
import { R2Service } from '#lib/server/services/r2.service';

export const load: PageServerLoad = async ({ platform, locals }) => {
	const profile = await AdminProfileService.getProfileById(getDb(platform), locals.admin!.id);
	if (!profile) throw error(404, 'অ্যাডমিন প্রোফাইল পাওয়া যায়নি');
	return { profile };
};

export const actions: Actions = {
	updateProfile: async ({ request, platform, locals }) => {
		const data = await request.formData();
		const adminId = locals.admin!.id;
		const name = data.get('name')?.toString()?.trim() || '';
		const username = data.get('username')?.toString()?.trim() || '';
		const email = data.get('email')?.toString()?.trim() || '';
		const phone = data.get('phone')?.toString()?.trim() || '';

		if (!name || !username || !email) {
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

	updateAvatar: async ({ request, platform, locals }) => {
		const data = await request.formData();
		const adminId = locals.admin!.id;
		let avatarUrl = data.get('avatarUrl')?.toString()?.trim();

		if (!avatarUrl) {
			return fail(400, {
				action: 'updateAvatar',
				success: false,
				message: 'প্রোফাইল ছবি নির্বাচন করা আবশ্যক!'
			});
		}

		// If base64 data URI is provided, upload to R2 or local disk storage
		if (avatarUrl.startsWith('data:')) {
			try {
				const r2Res = await R2Service.uploadBase64(avatarUrl, {
					platform,
					folder: 'avatars',
					filename: `admin-${adminId}.png`
				});
				avatarUrl = r2Res.url;
			} catch (e: any) {
				console.error('Failed to upload avatar to storage:', e);
			}
		}

		// Prevent storing massive base64 payloads directly into SQLite D1
		if (avatarUrl.startsWith('data:')) {
			return fail(400, {
				action: 'updateAvatar',
				success: false,
				message: 'ছবি আপলোড করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
			});
		}

		try {
			const db = getDb(platform);
			const res = await AdminProfileService.updateAvatar(db, adminId, avatarUrl);
			return {
				action: 'updateAvatar',
				success: true,
				avatarUrl: R2Service.resolvePublicUrl(avatarUrl),
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

	changePassword: async ({ request, platform, locals }) => {
		const data = await request.formData();
		const adminId = locals.admin!.id;
		const currentPassword = data.get('currentPassword')?.toString() || '';
		const newPassword = data.get('newPassword')?.toString() || '';
		const confirmPassword = data.get('confirmPassword')?.toString() || '';

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
