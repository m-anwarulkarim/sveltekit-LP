/**
 * Client Attribution & Marketing Campaign Tracking
 * Persists UTM parameters, ad click IDs (fbclid, gclid), and referrers across sessions
 */

export interface AttributionData {
	source: string;
	medium?: string;
	campaign?: string;
	content?: string;
	fbclid?: string;
	gclid?: string;
	referrer?: string;
	landingPage?: string;
	timestamp: number;
}

const STORAGE_KEY = 'aura_attribution';

export function captureAttribution(): AttributionData {
	if (typeof window === 'undefined') {
		return { source: 'Direct', timestamp: Date.now() };
	}

	try {
		const url = new URL(window.location.href);
		const utmSource = url.searchParams.get('utm_source');
		const utmMedium = url.searchParams.get('utm_medium');
		const utmCampaign = url.searchParams.get('utm_campaign');
		const utmContent = url.searchParams.get('utm_content');
		const fbclid = url.searchParams.get('fbclid');
		const gclid = url.searchParams.get('gclid');
		const referrer = document.referrer;

		// If new UTM or ad click parameters present in URL, create new attribution
		if (utmSource || fbclid || gclid || utmCampaign) {
			let resolvedSource = utmSource || (fbclid ? 'Facebook Ad' : (gclid ? 'Google Ad' : 'Direct'));
			if (utmCampaign) {
				resolvedSource = `${resolvedSource} (${utmCampaign})`;
			}

			const data: AttributionData = {
				source: resolvedSource,
				medium: utmMedium || (fbclid ? 'cpc' : undefined),
				campaign: utmCampaign || undefined,
				content: utmContent || undefined,
				fbclid: fbclid || undefined,
				gclid: gclid || undefined,
				referrer: referrer || undefined,
				landingPage: window.location.pathname,
				timestamp: Date.now()
			};

			sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
			return data;
		}

		// Otherwise check existing in sessionStorage
		const saved = sessionStorage.getItem(STORAGE_KEY);
		if (saved) {
			return JSON.parse(saved);
		}

		// Fallback to referrer check
		let source = 'Direct';
		if (referrer) {
			if (referrer.includes('facebook.com') || referrer.includes('fb.me')) source = 'Facebook Organic';
			else if (referrer.includes('instagram.com')) source = 'Instagram';
			else if (referrer.includes('google.com')) source = 'Google Search';
			else if (referrer.includes('tiktok.com')) source = 'TikTok';
			else if (referrer.includes('youtube.com')) source = 'YouTube';
			else {
				try {
					source = new URL(referrer).hostname;
				} catch {
					source = 'Referral';
				}
			}
		}

		const fallbackData: AttributionData = {
			source,
			referrer: referrer || undefined,
			landingPage: window.location.pathname,
			timestamp: Date.now()
		};

		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackData));
		return fallbackData;
	} catch (e) {
		return { source: 'Direct', timestamp: Date.now() };
	}
}

export function getAttributionSource(): string {
	const data = captureAttribution();
	return data.source || 'Direct';
}

