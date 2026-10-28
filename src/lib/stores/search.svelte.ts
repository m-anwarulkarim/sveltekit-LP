class AdminSearchStore {
	isOpen = $state(false);
	initialQuery = $state('');

	open(query = '') {
		this.initialQuery = query;
		this.isOpen = true;
	}

	close() {
		this.isOpen = false;
		this.initialQuery = '';
	}
}

export const adminSearch = new AdminSearchStore();

