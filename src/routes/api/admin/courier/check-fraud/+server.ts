import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import { FraudService } from '#lib/server/services/fraud.service';

export const POST: RequestHandler = async ({ request, platform }) => {
	try {
		const { phone, forceRefresh } = (await request.json()) as {
			phone?: string;
			forceRefresh?: boolean;
		};

		if (!phone || phone.trim().length < 6) {
			return json({ success: false, message: 'সঠিক মোবাইল নম্বর প্রদান করুন' }, { status: 400 });
		}

		const db = getDb(platform);
		const assessment = await FraudService.checkPhoneRisk(db, phone, !!forceRefresh);

		return json({
			success: true,
			stats: {
				total: assessment.totalParcels,
				delivered: assessment.deliveredParcels,
				cancelled: assessment.cancelledParcels,
				successRate: assessment.successRate,
				riskTag: assessment.riskTag,
				courierName: assessment.courierName,
				badgeLabel: assessment.badgeLabel,
				isConfigured: assessment.isConfigured
			}
		});
	} catch (e: any) {
		console.error('Error in api/admin/courier/check-fraud:', e);
		return json({ success: false, message: e.message || 'কুরিয়ার ডেটা যাচাই ব্যর্থ হয়েছে' }, { status: 500 });
	}
};

