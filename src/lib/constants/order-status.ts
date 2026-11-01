export function normalizeOrderStatus(status: string): string {
	if (status === 'paid') return 'confirmed';
	if (status === 'dispatched') return 'shipped';
	if (status === 'refunded') return 'cancelled';
	if (status === 'no_response_3') return 'good_no_response';
	return status;
}
