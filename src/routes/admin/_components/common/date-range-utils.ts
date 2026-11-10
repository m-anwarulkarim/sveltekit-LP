/**
 * Date Range Utilities for Admin Filtering
 * Handles timezone offsets (Dhaka UTC+6 default) and standard preset computations.
 */

export const DHAKA_UTC_OFFSET_MS = 6 * 60 * 60 * 1000;
export const DAY_MS = 24 * 60 * 60 * 1000;

export interface DateRangeWindow {
	startTs: number;
	endTs?: number;
}

export function toDateTimeLocalString(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function getDefaultFrom(): string {
	const d = new Date();
	d.setHours(0, 0, 0, 0);
	return toDateTimeLocalString(d);
}

export function getDefaultTo(): string {
	return toDateTimeLocalString(new Date());
}

export function parseDateRangeWindow(
	range: string = 'today',
	customFrom?: string | null,
	customTo?: string | null
): DateRangeWindow {
	const now = Date.now();
	const startOfToday = Math.floor((now + DHAKA_UTC_OFFSET_MS) / DAY_MS) * DAY_MS - DHAKA_UTC_OFFSET_MS;

	if (range === 'yesterday') {
		return {
			startTs: startOfToday - DAY_MS,
			endTs: startOfToday - 1
		};
	}

	if (range === '24h') {
		return {
			startTs: now - 24 * 60 * 60 * 1000,
			endTs: now
		};
	}

	if (range === '3days') {
		return {
			startTs: now - 3 * DAY_MS,
			endTs: now
		};
	}

	if (range === '7days' || range === '7d') {
		return {
			startTs: now - 7 * DAY_MS,
			endTs: now
		};
	}

	if (range === '30days' || range === '30d') {
		return {
			startTs: now - 30 * DAY_MS,
			endTs: now
		};
	}

	if (range === 'thisMonth') {
		const dhakaDate = new Date(now + DHAKA_UTC_OFFSET_MS);
		const year = dhakaDate.getUTCFullYear();
		const month = dhakaDate.getUTCMonth();
		const startOfMonth = Date.UTC(year, month, 1, 0, 0, 0) - DHAKA_UTC_OFFSET_MS;
		return {
			startTs: startOfMonth,
			endTs: now
		};
	}

	if (range === 'lastMonth') {
		const dhakaDate = new Date(now + DHAKA_UTC_OFFSET_MS);
		const year = dhakaDate.getUTCFullYear();
		const month = dhakaDate.getUTCMonth();
		const startOfLastMonth = Date.UTC(year, month - 1, 1, 0, 0, 0) - DHAKA_UTC_OFFSET_MS;
		const endOfLastMonth = Date.UTC(year, month, 1, 0, 0, 0) - DHAKA_UTC_OFFSET_MS - 1;
		return {
			startTs: startOfLastMonth,
			endTs: endOfLastMonth
		};
	}

	if (range === 'custom') {
		let startTs = startOfToday;
		let endTs: number | undefined = undefined;

		if (customFrom) {
			const parsed = new Date(customFrom).getTime();
			if (!isNaN(parsed)) startTs = parsed;
		}
		if (customTo) {
			const parsed = new Date(customTo).getTime();
			if (!isNaN(parsed)) endTs = parsed;
		}
		return { startTs, endTs };
	}

	if (range === 'all') {
		return { startTs: 0 };
	}

	// Default: today
	return { startTs: startOfToday };
}

export function formatDisplayDateTime(str: string | null): string {
	if (!str) return '';
	try {
		const d = new Date(str);
		if (isNaN(d.getTime())) return str;
		return d.toLocaleString('bn-BD', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	} catch {
		return str;
	}
}

