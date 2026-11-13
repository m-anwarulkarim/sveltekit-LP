import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import { SettingsService } from '#lib/server/services/settings.service';
import { normalizeBdPhone } from '#lib/server/utils/phone';

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
		const fraudSettings = (await SettingsService.getSettingsGroup(db, 'fraud_check')) || {};
		const apiKey = (fraudSettings.smartposBdApiKey || '').trim();

		if (!apiKey) {
			return json({ success: false, message: 'SmartPOS API Key কনফিগার করা নেই' });
		}

		const normalized = normalizeBdPhone(phone);

		const apiRes = await fetch(`https://fraudchecker.smartposbd.com/api/v1/fraud-check?phone=${encodeURIComponent(normalized)}`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${apiKey}`,
				'Accept': 'application/json'
			}
		});

		if (!apiRes.ok) {
			const errText = await apiRes.text().catch(() => '');
			console.error(`SmartPOS API error ${apiRes.status}:`, errText);
			return json({
				success: false,
				message: apiRes.status === 401
					? 'SmartPOS API Key ভুল বা মেয়াদ শেষ'
					: `SmartPOS API ত্রুটি (${apiRes.status})`
			});
		}

		const data: any = await apiRes.json();

		const totalParcels = data.total_parcel ?? data.totalParcels ?? data.total ?? 0;
		const deliveredParcels = data.delivered_parcel ?? data.deliveredParcels ?? data.delivered ?? 0;
		const cancelledParcels = data.cancelled_parcel ?? data.cancelledParcels ?? data.cancelled ?? 0;
		const successRate = totalParcels > 0
			? Math.round(((deliveredParcels / totalParcels) * 100) * 100) / 100
			: 0;
		const successRateFormatted = totalParcels > 0
			? `${((deliveredParcels / totalParcels) * 100).toFixed(2).replace(/\.00$/, '')}%`
			: 'N/A';

		let riskTag: string = 'New';
		if (totalParcels > 0) {
			if (successRate >= 70) riskTag = 'Safe';
			else if (successRate >= 50) riskTag = 'Moderate';
			else riskTag = 'High Risk';
		}

		return json({
			success: true,
			result: {
				phone: normalized,
				totalParcels,
				deliveredParcels,
				cancelledParcels,
				successRate,
				successRateFormatted,
				riskTag,
				providerName: 'SmartPOS Bangladesh',
				hasData: totalParcels > 0
			}
		});
	} catch (e: any) {
		console.error('SmartPOS fraud check error:', e);
		return json({ success: false, message: e.message || 'SmartPOS ফ্রড চেক ব্যর্থ হয়েছে' }, { status: 500 });
	}
};
