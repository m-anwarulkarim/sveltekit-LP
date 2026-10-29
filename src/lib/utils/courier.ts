export type CourierProviderId = 'steadfast' | 'pathao' | 'paperfly' | 'carrybee' | 'redx';

export interface CourierMetadata {
	id: CourierProviderId;
	name: string;
	tag: string;
	color: string;
	border: string;
	bg: string;
}

export const ALL_COURIER_PROVIDERS: CourierMetadata[] = [
	{
		id: 'steadfast',
		name: 'Steadfast Courier',
		tag: 'Fastest nationwide COD',
		color: 'text-emerald-700',
		border: 'border-emerald-200',
		bg: 'bg-emerald-50'
	},
	{
		id: 'pathao',
		name: 'Pathao Courier',
		tag: 'Same day express delivery',
		color: 'text-rose-700',
		border: 'border-rose-200',
		bg: 'bg-rose-50'
	},
	{
		id: 'redx',
		name: 'REDX',
		tag: 'Wide coverage nationwide',
		color: 'text-red-700',
		border: 'border-red-200',
		bg: 'bg-red-50'
	},
	{
		id: 'paperfly',
		name: 'Paperfly',
		tag: 'Doorstep pickup & delivery',
		color: 'text-sky-700',
		border: 'border-sky-200',
		bg: 'bg-sky-50'
	},
	{
		id: 'carrybee',
		name: 'CarryBee Courier',
		tag: 'Enterprise logistics',
		color: 'text-amber-700',
		border: 'border-amber-200',
		bg: 'bg-amber-50'
	}
];

/**
 * Returns public tracking URL for any Bangladesh courier provider
 */
export function getCourierTrackingUrl(providerId: string, trackingCode: string, consignmentId?: string): string {
	if (!trackingCode) return '';
	const lower = (providerId || '').toLowerCase();

	if (lower.includes('steadfast')) {
		return `https://steadfast.com.bd/t/${trackingCode}`;
	}
	if (lower.includes('pathao')) {
		const id = consignmentId || trackingCode;
		return `https://pathao.com/courier/tracking/?consignment_id=${id}`;
	}
	if (lower.includes('redx')) {
		return `https://redx.com.bd/track-parcel/?trackingId=${trackingCode}`;
	}
	if (lower.includes('paperfly')) {
		return `https://paperfly.com.bd/tracking?tracking_number=${trackingCode}`;
	}
	if (lower.includes('carrybee')) {
		return `https://carrybee.com/track/${trackingCode}`;
	}
	return `https://steadfast.com.bd/t/${trackingCode}`;
}

