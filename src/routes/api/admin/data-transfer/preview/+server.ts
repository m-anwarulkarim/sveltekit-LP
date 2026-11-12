import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DataTransferService } from '#lib/server/services/data-transfer.service';

export const POST: RequestHandler = async ({ request, locals }) => {
	// Guard: Only logged-in Admin
	if (!locals.admin) {
		throw error(401, 'অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।');
	}

	try {
		const formData = await request.formData();
		const file = formData.get('file') as File | null;

		if (!file || typeof file.text !== 'function') {
			return json({ success: false, error: 'ফাইল পাওয়া যায়নি।' }, { status: 400 });
		}

		const fileName = file.name || '';
		const format = fileName.endsWith('.csv') ? 'csv' : 'json';
		const fileContent = await file.text();

		let items: any[] = [];
		try {
			items = DataTransferService.parseUploadedFile(fileContent, format);
		} catch (parseErr: any) {
			return json({ success: false, error: `পার্সিং সমস্যা: ${parseErr?.message}` }, { status: 400 });
		}

		const preview = DataTransferService.inspectPreview(items);
		return json(preview);
	} catch (err: any) {
		return json({ success: false, error: err?.message || 'প্রিভিউ জেনারেট করা সম্ভব হয়নি।' }, { status: 500 });
	}
};

