import { json, type RequestHandler } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import { CourierService } from '#lib/server/services/courier.service';
import { SettingsService } from '#lib/server/services/settings.service';
import { normalizeBdPhone } from '#lib/server/utils/phone';

/**
 * Diagnostic probe: calls every known Steadfast fraud-check endpoint and
 * returns each raw response body so the real field names can be identified.
 * Credentials are never echoed back — only their length.
 */
export const GET: RequestHandler = async ({ url, platform }) => {
	const phone = normalizeBdPhone(url.searchParams.get('phone') || '');
	if (!phone) {
		return json({ success: false, message: 'phone query param আবশ্যক' }, { status: 400 });
	}

	const db = getDb(platform);

	const courierSettings = await CourierService.getCourierSettings(db).catch(() => ({ methods: [] as any[] }));
	const fraudSettings: any = await SettingsService.getSettingsGroup(db, 'fraud_check').catch(() => ({}));
	const steadfast = courierSettings.methods.find((m: any) => m.id === 'steadfast');

	const apiKey = (fraudSettings.steadFastApiKey || steadfast?.credentials?.apiKey || '').trim();
	const secretKey = (fraudSettings.steadFastSecretKey || steadfast?.credentials?.secretKey || '').trim();

	if (!apiKey || !secretKey) {
		return json({
			success: false,
			phone,
			message: 'Steadfast API Key/Secret কনফিগার করা নেই',
			apiKeyLength: apiKey.length,
			secretKeyLength: secretKey.length
		});
	}

	const candidates = [
		`https://portal.packzy.com/api/v1/fraud_check/score/${phone}`,
		`https://portal.packzy.com/api/v1/fraud_check/${phone}`,
		`https://portal.steadfast.com.bd/api/v1/fraud_check/score/${phone}`,
		`https://portal.packzy.com/api/v1/get_balance`
	];

	const attempts: any[] = [];
	for (const endpoint of candidates) {
		try {
			const res = await fetch(endpoint, {
				method: 'GET',
				headers: {
					'Api-Key': apiKey,
					'Secret-Key': secretKey,
					'Content-Type': 'application/json',
					Accept: 'application/json'
				},
				signal: AbortSignal.timeout(10000)
			});
			const body = await res.text();
			attempts.push({
				endpoint,
				status: res.status,
				contentType: res.headers.get('content-type'),
				body: body.slice(0, 1500)
			});
		} catch (err: any) {
			attempts.push({ endpoint, error: err?.message || String(err) });
		}
	}

	return json({
		success: true,
		phone,
		apiKeyLength: apiKey.length,
		secretKeyLength: secretKey.length,
		credentialSource: fraudSettings.steadFastApiKey ? 'fraud_check settings' : 'courier settings',
		attempts
	});
};
