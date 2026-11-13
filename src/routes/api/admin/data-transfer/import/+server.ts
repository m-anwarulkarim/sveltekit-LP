import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index';
import { DataTransferService } from '#lib/server/services/data-transfer.service';

export const POST: RequestHandler = async ({ request, platform, locals }) => {
	// Guard: Only Admin / Owner can import data
	if (!locals.admin) {
		throw error(401, 'অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।');
	}

	try {
		const formData = await request.formData();
		const file = formData.get('file') as File | null;
		const entity = (formData.get('entity') as string) || 'products';
		const updateExisting = formData.get('updateExisting') !== 'false';

		if (!file || typeof file.text !== 'function') {
			return json({ success: false, message: 'কোনো ফাইল পাওয়া যায়নি।' }, { status: 400 });
		}

		const fileName = file.name || '';
		const format = fileName.endsWith('.csv') ? 'csv' : 'json';
		const fileContent = await file.text();

		if (!fileContent || fileContent.trim().length === 0) {
			return json({ success: false, message: 'আপলোড করা ফাইলটি সম্পূর্ণ খালি।' }, { status: 400 });
		}

		const db = getDb(platform);

		// Handle Full Backup Restore — destructive, Owner only
		if (entity === 'full_backup') {
			if (locals.admin.role !== 'Owner') {
				return json({ success: false, message: 'ফুল ব্যাকআপ রিস্টোর শুধু Owner করতে পারবেন।' }, { status: 403 });
			}
			let backupJson: any;
			try {
				backupJson = JSON.parse(fileContent);
			} catch (e: any) {
				return json({ success: false, message: 'ফুল ব্যাকআপ JSON ফাইলটি সঠিক নয়।' }, { status: 400 });
			}

			const result = await DataTransferService.restoreFullBackup(db, backupJson);
			return json(result);
		}

		// Single Entity Import
		let items: any[] = [];
		try {
			items = DataTransferService.parseUploadedFile(fileContent, format);
		} catch (parseErr: any) {
			return json(
				{
					success: false,
					message: `ফাইল পার্সিং ব্যর্থ: ${parseErr?.message || 'ফরম্যাট ত্রুটি'}`
				},
				{ status: 400 }
			);
		}

		if (!Array.isArray(items) || items.length === 0) {
			return json(
				{
					success: false,
					message: 'ফাইলে কোনো ভ্যালিড ডেটা সারি পাওয়া যায়নি।'
				},
				{ status: 400 }
			);
		}

		let result;
		switch (entity) {
			case 'products':
				result = await DataTransferService.importProducts(db, items, { updateExisting });
				break;
			case 'categories':
				result = await DataTransferService.importCategories(db, items);
				break;
			case 'coupons':
				result = await DataTransferService.importCoupons(db, items);
				break;
			default:
				return json({ success: false, message: `সমর্থিত নয় এমন এনটিটি: ${entity}` }, { status: 400 });
		}

		return json(result);
	} catch (err: any) {
		console.error('Data import API error:', err);
		return json(
			{
				success: false,
				message: err?.message || 'ইমপোর্ট চলাকালীন সার্ভারে অভ্যন্তরীণ ত্রুটি হয়েছে।'
			},
			{ status: 500 }
		);
	}
};

