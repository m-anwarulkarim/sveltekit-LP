// Global singleton in-memory order store across all server routes
let liveOrders: any[] = [];

export function getLiveOrders() {
	return liveOrders;
}

export function syncLiveOrders(orders: any[]) {
	liveOrders = [...orders];
	return liveOrders;
}

export function addLiveOrder(newOrder: any) {
	liveOrders = [newOrder, ...liveOrders];
	return newOrder;
}

export function updateLiveOrderStatus(orderId: string, newStatus: string, note?: string) {
	let found = false;
	liveOrders = liveOrders.map((o: any) => {
		if (o.id === orderId || o.orderNumber === orderId) {
			found = true;
			const updated: any = {
				...o,
				status: newStatus,
				updatedAt: new Date().toISOString()
			};
			if (newStatus === 'confirmed' || newStatus === 'processing') {
				updated.confirmedAt = new Date().toISOString();
			} else if (newStatus === 'shipped') {
				updated.shippedAt = new Date().toISOString();
			} else if (newStatus === 'delivered') {
				updated.deliveredAt = new Date().toISOString();
			}
			return updated;
		}
		return o;
	});
	return found;
}

export function trashLiveOrder(orderId: string) {
	liveOrders = liveOrders.map((o: any) => {
		if (o.id === orderId || o.orderNumber === orderId) {
			return { ...o, isTrashed: true, updatedAt: new Date().toISOString() };
		}
		return o;
	});
}

export function restoreLiveOrder(orderId: string) {
	liveOrders = liveOrders.map((o: any) => {
		if (o.id === orderId || o.orderNumber === orderId) {
			return { ...o, isTrashed: false, status: 'pending', updatedAt: new Date().toISOString() };
		}
		return o;
	});
}

export function deleteLiveOrderPermanently(orderId: string) {
	liveOrders = liveOrders.filter((o: any) => o.id !== orderId && o.orderNumber !== orderId);
}

