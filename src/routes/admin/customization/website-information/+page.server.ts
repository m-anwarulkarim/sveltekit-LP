import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import {
	SettingsService,
	DEFAULT_WEBSITE_INFO,
	type WebsiteInfoConfig
} from '#lib/server/services/settings.service';

export const load: PageServerLoad = async ({ platform }) => {
	try {
		const db = getDb(platform);
		const websiteInfo = await SettingsService.getWebsiteInfo(db);
		return {
			websiteInfo
		};
	} catch (error) {
		console.error('Failed to load website info from D1:', error);
		return {
			websiteInfo: DEFAULT_WEBSITE_INFO
		};
	}
};

export const actions: Actions = {
	saveWebsiteInfo: async ({ request, platform }) => {
		const data = await request.formData();

		const websiteName = data.get('websiteName')?.toString()?.trim() || '';
		const shortDescription = data.get('shortDescription')?.toString()?.trim() || '';
		const whatsappNumber = data.get('whatsappNumber')?.toString()?.trim() || '';
		let logoUrl = data.get('logoUrl')?.toString()?.trim() || '';
		let faviconUrl = data.get('faviconUrl')?.toString()?.trim() || '';

		const rawAddresses = data.get('addresses')?.toString();
		let addresses: string[] = [];
		if (rawAddresses) {
			try {
				addresses = JSON.parse(rawAddresses);
			} catch {
				addresses = [rawAddresses];
			}
		}

		const rawEmails = data.get('emails')?.toString();
		let emails: string[] = [];
		if (rawEmails) {
			try {
				emails = JSON.parse(rawEmails);
			} catch {
				emails = [rawEmails];
			}
		}

		// Handle direct file uploads (convert small image assets to Data URI if provided)
		const logoFile = data.get('logoFile') as File | null;
		if (logoFile && logoFile.size > 0 && logoFile.type.startsWith('image/')) {
			try {
				const buffer = await logoFile.arrayBuffer();
				const base64 = Buffer.from(buffer).toString('base64');
				logoUrl = `data:${logoFile.type};base64,${base64}`;
			} catch (e) {
				console.error('Failed to process logo upload:', e);
			}
		}

		const faviconFile = data.get('faviconFile') as File | null;
		if (faviconFile && faviconFile.size > 0 && faviconFile.type.startsWith('image/')) {
			try {
				const buffer = await faviconFile.arrayBuffer();
				const base64 = Buffer.from(buffer).toString('base64');
				faviconUrl = `data:${faviconFile.type};base64,${base64}`;
			} catch (e) {
				console.error('Failed to process favicon upload:', e);
			}
		}

		if (!websiteName) {
			return fail(400, { success: false, message: 'ওয়েবসাইটের নাম প্রদান করা আবশ্যক' });
		}

		try {
			const db = getDb(platform);
			const payload: Partial<WebsiteInfoConfig> = {
				websiteName,
				shortDescription,
				whatsappNumber,
				addresses: addresses.filter((a) => a && a.trim().length > 0),
				emails: emails.filter((e) => e && e.trim().length > 0)
			};

			if (logoUrl) payload.logoUrl = logoUrl;
			if (faviconUrl) payload.faviconUrl = faviconUrl;

			const result = await SettingsService.saveWebsiteInfo(db, payload);

			return {
				success: true,
				websiteInfo: result.websiteInfo,
				message: 'ওয়েবসাইটের তথ্য সফলভাবে সংরক্ষণ করা হয়েছে!'
			};
		} catch (e: any) {
			console.error('Failed to save website information:', e);
			return fail(500, {
				success: false,
				message: e?.message || 'তথ্য সংরক্ষণ করতে সমস্যা হয়েছে'
			});
		}
	}
};

