import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { normalizeBdPhone } from '#lib/server/utils/phone';
import { getDb } from '#lib/server/db/index';
import { SettingsService } from '#lib/server/services/settings.service';

export const POST: RequestHandler = async ({ request, platform }) => {
	try {
		const { phone, forceRefresh } = (await request.json()) as {
			phone?: string;
			forceRefresh?: boolean;
		};

		if (!phone || phone.trim().length < 6) {
			return json({ success: false, message: 'সঠিক মোবাইল নম্বর প্রদান করুন' }, { status: 400 });
		}

		const normalized = normalizeBdPhone(phone);

		const db = getDb(platform);
		const fraudSettings = await SettingsService.getSettingsGroup(db, 'fraud_check');
		const apiKey = (fraudSettings.smartposBdApiKey as string) || '';

		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		};
		if (apiKey) {
			headers['Authorization'] = `Bearer ${apiKey}`;
		}

		const apiRes = await fetch('https://fraudchecker.smartposbd.com/api/v1/fraud-check', {
			method: 'POST',
			headers,
			body: JSON.stringify({ phone: normalized })
		});

		if (!apiRes.ok) {
			const errText = await apiRes.text().catch(() => '');
			console.error(`SmartPOS API error ${apiRes.status}:`, errText);
			return json({
				success: false,
				message: `SmartPOS API ত্রুটি (${apiRes.status})`
			});
		}

		const data: any = await apiRes.json();

		const totalParcels = data.total_parcel ?? 0;
		const deliveredParcels = data.success_parcel ?? 0;
		const cancelledParcels = data.cancel_parcel ?? 0;
		const score = data.score ?? 0;
		const apiStatus = data.status ?? 'Unknown';

		const successRate = totalParcels > 0
			? Math.round(((deliveredParcels / totalParcels) * 100) * 100) / 100
			: 0;
		const successRateFormatted = totalParcels > 0
			? `${((deliveredParcels / totalParcels) * 100).toFixed(2).replace(/\.00$/, '')}%`
			: 'N/A';

		let riskTag: string;
		if (totalParcels === 0) riskTag = 'New';
		else if (apiStatus === 'Safe' || score >= 70) riskTag = 'Safe';
		else if (apiStatus === 'Moderate' || score >= 40) riskTag = 'Moderate';
		else riskTag = 'High Risk';

		const byCourier: Record<string, any> = {};
		if (data.response) {
			for (const [key, val] of Object.entries(data.response) as [string, any][]) {
				if (val?.status && val?.data) {
					byCourier[key] = {
						total: val.data.total ?? 0,
						delivered: val.data.success ?? 0,
						cancelled: val.data.cancel ?? 0,
						successRate: val.data.deliveredPercentage ?? 0,
						returnRate: val.data.returnPercentage ?? 0,
						rating: val.data.rating ?? null
					};
				}
			}
		}

		return json({
			success: true,
			result: {
				phone: normalized,
				score,
				apiStatus,
				totalParcels,
				deliveredParcels,
				cancelledParcels,
				successRate,
				successRateFormatted,
				riskTag,
				providerName: 'SmartPOS Bangladesh',
				hasData: totalParcels > 0,
				byCourier,
				communityReports: data.community_reports ?? [],
				unresolvedReports: data.unresolved_reports ?? 0
			}
		});
	} catch (e: any) {
		console.error('SmartPOS fraud check error:', e);
		return json({ success: false, message: e.message || 'SmartPOS ফ্রড চেক ব্যর্থ হয়েছে' }, { status: 500 });
	}
};
