import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index';
import { DataTransferService, CsvHelper } from '#lib/server/services/data-transfer.service';

export const GET: RequestHandler = async ({ url, platform, locals }) => {
	// Guard: Only logged-in Admin can export data
	if (!locals.admin) {
		throw error(401, 'অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।');
	}

	const entity = url.searchParams.get('entity') || 'products';
	const format = (url.searchParams.get('format') || 'json').toLowerCase() as 'json' | 'csv';

	const db = getDb(platform);
	const dateStr = new Date().toISOString().slice(0, 10);

	try {
		let data: any;
		let filename = `${entity}-${dateStr}.${format}`;

		switch (entity) {
			case 'products':
				data = await DataTransferService.exportProducts(db);
				break;
			case 'categories':
				data = await DataTransferService.exportCategories(db);
				break;
			case 'coupons':
				data = await DataTransferService.exportCoupons(db);
				break;
			case 'orders':
				data = await DataTransferService.exportOrders(db);
				break;
			case 'sales_summary':
				data = await DataTransferService.exportSalesSummary(db);
				filename = `sales-summary-${dateStr}.${format}`;
				break;
			case 'customers':
				data = await DataTransferService.exportCustomers(db);
				break;
			case 'full_backup':
				data = await DataTransferService.exportFullBackup(db);
				filename = `haqplus-full-backup-${dateStr}.json`;
				// Full backup is strictly JSON
				return new Response(JSON.stringify(data, null, 2), {
					headers: {
						'Content-Type': 'application/json; charset=utf-8',
						'Content-Disposition': `attachment; filename="${filename}"`
					}
				});
			default:
				throw error(400, 'অজানা এনটিটি টাইপ।');
		}

		if (format === 'csv') {
			if (!Array.isArray(data)) {
				data = [data];
			}
			const csvContent = CsvHelper.stringify(data);
			return new Response(csvContent, {
				headers: {
					'Content-Type': 'text/csv; charset=utf-8',
					'Content-Disposition': `attachment; filename="${filename}"`
				}
			});
		}

		// JSON Export
		const jsonString = JSON.stringify(data, null, 2);
		return new Response(jsonString, {
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Content-Disposition': `attachment; filename="${filename}"`
			}
		});
	} catch (err: any) {
		console.error(`Export failed for ${entity}:`, err);
		throw error(500, err?.message || 'ডেটা এক্সপোর্ট করতে ব্যর্থ হয়েছে।');
	}
};

