// Default initial catalog
export const INITIAL_PRODUCTS = [
	{
		id: 'prod-spectrum-x',
		name: 'AURA Spectrum X',
		slug: 'aura-spectrum-x',
		tagline: '50mm Planar Magnetic Flagship Headphones',
		price: 34900,
		originalPrice: 42900,
		rating: 49,
		reviewsCount: 128,
		image: '/images/headphones.jpg',
		category: 'Hardware',
		badge: 'Flagship',
		inStock: true,
		description: 'Ultra-low distortion planar transducers with Neural ANC 2.0 (-48dB).'
	},
	{
		id: 'prod-wave-earbuds',
		name: 'AURA Wave Spatial Pro',
		slug: 'aura-wave-spatial-pro',
		tagline: 'True Wireless Spatial IEMs with Head Tracking',
		price: 18900,
		originalPrice: 22900,
		rating: 48,
		reviewsCount: 94,
		image: '/images/earbuds.jpg',
		category: 'Audio',
		badge: 'Bestseller',
		inStock: true,
		description: 'Beryllium-coated 11mm dynamic drivers with 36hr battery case.'
	},
	{
		id: 'prod-sound-deck',
		name: 'AURA Creator Sound Deck',
		slug: 'aura-creator-sound-deck',
		tagline: '32-Bit/384kHz Quad-DAC Studio Interface',
		price: 44900,
		originalPrice: 51900,
		rating: 50,
		reviewsCount: 62,
		image: '/images/sound-deck.jpg',
		category: 'Studio',
		badge: 'Studio Grade',
		inStock: true,
		description: 'Motorized conductive faders and balanced 4.4mm Pentaconn output.'
	}
];

// Realistic E-commerce orders matching Pre-Confirmation and Post-Confirmation
export const INITIAL_ORDERS = [
	{
		id: '87472',
		customerName: 'Emon',
		customerEmail: '01741402270',
		shippingAddress: 'Leather centre, g-9 dncc super market, gulshan-2, Dhaka',
		items: JSON.stringify([
			{
				id: 'prod-spectrum-x',
				name: 'AURA Spectrum X (Black)',
				price: 1466,
				quantity: 1,
				image: '/images/headphones.jpg',
				source: 'Direct',
				timeAgo: '12 minutes ago',
				successRate: { delivered: 30, returned: 2, percent: 95 }
			}
		]),
		total: 1466,
		status: 'pending'
	},
	{
		id: '22026',
		customerName: 'নাম মোঃ সহিদুল ইসলাম খান',
		customerEmail: '01714455381',
		shippingAddress: 'গ্রাম মিলোজয়ার থানা বিশ্বম্ভরপুর জেলা সুনামগঞ্জ',
		items: JSON.stringify([
			{
				id: 'prod-wave-earbuds',
				name: 'AURA Wave Spatial Pro',
				price: 380,
				quantity: 1,
				image: '/images/earbuds.jpg',
				source: 'Direct',
				altPhone: '01781519059',
				timeAgo: '1 day ago',
				successRate: { delivered: 30, returned: 2, percent: 95 }
			}
		]),
		total: 380,
		status: 'pending'
	},
	{
		id: '84650',
		customerName: 'পিহাদ আলম',
		customerEmail: '01345770404',
		shippingAddress: 'ভূঁইয়া সায়িপুুর, পৌরসভা, বাঘতলী, নেত্রকোণা',
		items: JSON.stringify([
			{
				id: 'prod-sound-deck',
				name: 'AURA Creator Deck Accessory',
				price: 175,
				quantity: 1,
				image: '/images/sound-deck.jpg',
				source: 'Direct',
				timeAgo: '2 days ago',
				successRate: { delivered: 15, returned: 1, percent: 93 }
			}
		]),
		total: 175,
		status: 'pending'
	},
	{
		id: '84651',
		customerName: 'তাহসীন চৌধুরী',
		customerEmail: '01819283741',
		shippingAddress: 'হালিশহর ব্লক-বি, চট্টগ্রাম',
		items: JSON.stringify([
			{
				id: 'prod-spectrum-x',
				name: 'AURA Pro Headband',
				price: 1250,
				quantity: 1,
				source: 'Facebook',
				timeAgo: '3 hours ago',
				successRate: { delivered: 8, returned: 4, percent: 66 }
			}
		]),
		total: 1250,
		status: 'incomplete'
	},
	{
		id: '84652',
		customerName: 'মোস্তাফিজুর রহমান',
		customerEmail: '01711223344',
		shippingAddress: 'আম্বরখানা পয়েন্ট, সিলেট সদর',
		items: JSON.stringify([
			{
				id: 'prod-wave-earbuds',
				name: 'AURA Wave Spatial Pro',
				price: 890,
				quantity: 1,
				source: 'Direct',
				timeAgo: '4 hours ago',
				successRate: { delivered: 22, returned: 1, percent: 95 }
			}
		]),
		total: 890,
		status: 'no_response'
	},
	{
		id: '84653',
		customerName: 'রিফাত মাহমুদ',
		customerEmail: '01911998877',
		shippingAddress: 'সোনারগাঁও রোড, মতিঝিল, ঢাকা',
		items: JSON.stringify([
			{
				id: 'prod-sound-deck',
				name: 'AURA Sound Deck Unit',
				price: 1850,
				quantity: 1,
				source: 'Facebook',
				timeAgo: '6 hours ago',
				successRate: { delivered: 45, returned: 3, percent: 93 }
			}
		]),
		total: 1850,
		status: 'good_no_response'
	},
	{
		id: '84654',
		customerName: 'তানজিলা হক',
		customerEmail: '01677889900',
		shippingAddress: 'নয়াটোলা, মগবাজার, ঢাকা',
		items: JSON.stringify([
			{
				id: 'prod-spectrum-x',
				name: 'AURA Spectrum X',
				price: 3490,
				quantity: 1,
				source: 'Direct',
				timeAgo: '1 day ago',
				successRate: { delivered: 12, returned: 0, percent: 100 }
			}
		]),
		total: 3490,
		status: 'busy'
	},
	{
		id: '84655',
		customerName: 'জহিরুল ইসলাম',
		customerEmail: '01555667788',
		shippingAddress: 'চৌহাট্টা, সিলেট',
		items: JSON.stringify([
			{
				id: 'prod-wave-earbuds',
				name: 'AURA Wave Earbuds',
				price: 650,
				quantity: 1,
				source: 'Facebook',
				timeAgo: '1 day ago',
				successRate: { delivered: 18, returned: 2, percent: 90 }
			}
		]),
		total: 650,
		status: 'hold'
	},
	{
		id: '84656',
		customerName: 'বশির আহমেদ',
		customerEmail: '01888990011',
		shippingAddress: 'কান্দিরপাড়, কুমিল্লা',
		items: JSON.stringify([
			{
				id: 'prod-sound-deck',
				name: 'AURA Creator Deck',
				price: 2450,
				quantity: 1,
				source: 'Direct',
				timeAgo: '2 days ago',
				successRate: { delivered: 28, returned: 3, percent: 90 }
			}
		]),
		total: 2450,
		status: 'recall'
	},
	// Post-Confirmation Orders
	{
		id: 'INV-1227',
		customerName: 'হোসাইন',
		customerEmail: '01943298190',
		shippingAddress: 'ঝাউদিয়া, পশ্চিমপাড়া (কবরস্থান সংলগ্ন), কুষ্টিয়া',
		items: JSON.stringify([
			{
				id: 'prod-wave-earbuds',
				name: 'AURA Spatial IEMs',
				price: 313,
				quantity: 1,
				source: 'Facebook',
				courier: 'Steadfast',
				trackingCode: 'ST-928174',
				timeAgo: '১ দিন আগে',
				confirmedAt: '১ দিন আগে',
				subStatus: 'partial_delivered'
			}
		]),
		total: 313,
		status: 'partial_delivered'
	},
	{
		id: 'INV-1108',
		customerName: 'vissho Roy',
		customerEmail: '01305082314',
		shippingAddress: 'গ্রাম চরকলপুকুর থানা পীরগঞ্জ জেলা রংপুর',
		items: JSON.stringify([
			{
				id: 'prod-spectrum-x',
				name: 'AURA Audio Adapter',
				price: 219,
				quantity: 1,
				source: 'Facebook',
				courier: 'Steadfast',
				trackingCode: 'ST-928091',
				timeAgo: '১ দিন আগে',
				confirmedAt: '১ দিন আগে',
				subStatus: 'partial_delivered'
			}
		]),
		total: 219,
		status: 'partial_delivered'
	},
	{
		id: 'INV-1229',
		customerName: 'তানভীর আহমেদ',
		customerEmail: '01712345678',
		shippingAddress: 'উত্তরা সেক্টর ৪, রোড ৭, ঢাকা',
		items: JSON.stringify([
			{
				id: 'prod-spectrum-x',
				name: 'AURA Spectrum X (Obsidian)',
				price: 3490,
				quantity: 1,
				source: 'Direct',
				courier: 'Steadfast',
				trackingCode: 'ST-928501',
				timeAgo: '২ ঘন্টা আগে',
				confirmedAt: '২ ঘন্টা আগে'
			}
		]),
		total: 3490,
		status: 'confirmed'
	},
	{
		id: 'INV-1228',
		customerName: 'আরিফুল ইসলাম',
		customerEmail: '01834567890',
		shippingAddress: 'জিইসি মোড়, নাসিরাবাদ, চট্টগ্রাম',
		items: JSON.stringify([
			{
				id: 'prod-wave-earbuds',
				name: 'AURA Wave Spatial Pro',
				price: 1890,
				quantity: 1,
				source: 'Facebook',
				courier: 'Pathao',
				trackingCode: 'PT-441208',
				timeAgo: '৫ ঘন্টা আগে',
				confirmedAt: '৫ ঘন্টা আগে'
			}
		]),
		total: 1890,
		status: 'printed'
	},
	{
		id: 'INV-1225',
		customerName: 'সাদিয়া সুলতানা',
		customerEmail: '01923456781',
		shippingAddress: 'ধানমন্ডি ২৭, ঢাকা ১২০৯',
		items: JSON.stringify([
			{
				id: 'prod-sound-deck',
				name: 'AURA Creator Sound Deck',
				price: 2750,
				quantity: 1,
				source: 'Direct',
				courier: 'Steadfast',
				trackingCode: 'ST-927914',
				timeAgo: '৮ ঘন্টা আগে',
				confirmedAt: '৮ ঘন্টা আগে'
			}
		]),
		total: 2750,
		status: 'entry_done'
	},
	{
		id: 'INV-1220',
		customerName: 'মেহেদী হাসান শুভ',
		customerEmail: '01765432109',
		shippingAddress: 'বনশ্রী ব্লক সি, রামপুরা, ঢাকা',
		items: JSON.stringify([
			{
				id: 'prod-spectrum-x',
				name: 'AURA Spectrum X',
				price: 1200,
				quantity: 1,
				source: 'Facebook',
				courier: 'Steadfast',
				trackingCode: 'ST-926880',
				timeAgo: '১ দিন আগে',
				confirmedAt: '১ দিন আগে'
			}
		]),
		total: 1200,
		status: 'shipped'
	},
	{
		id: 'INV-1215',
		customerName: 'নুসরাত জাহান',
		customerEmail: '01612345678',
		shippingAddress: 'হালিশহর ব্লক এ, চট্টগ্রাম',
		items: JSON.stringify([
			{
				id: 'prod-wave-earbuds',
				name: 'AURA Wave Pro',
				price: 850,
				quantity: 1,
				source: 'Direct',
				courier: 'Paperfly',
				trackingCode: 'PF-881230',
				timeAgo: '১ দিন আগে',
				confirmedAt: '১ দিন আগে'
			}
		]),
		total: 850,
		status: 'shipped'
	},
	{
		id: 'INV-1190',
		customerName: 'ফারহানা কবীর',
		customerEmail: '01898765432',
		shippingAddress: 'উপশহর মেইন রোড, রাজশাহী',
		items: JSON.stringify([
			{
				id: 'prod-sound-deck',
				name: 'AURA Sound Deck',
				price: 1450,
				quantity: 1,
				source: 'Facebook',
				courier: 'Steadfast',
				trackingCode: 'ST-925100',
				timeAgo: '২ দিন আগে',
				confirmedAt: '২ দিন আগে'
			}
		]),
		total: 1450,
		status: 'delivered'
	},
	{
		id: 'INV-1185',
		customerName: 'রাবেয়া খাতুন',
		customerEmail: '01723456789',
		shippingAddress: 'শাহি ঈদগাহ, সিলেট',
		items: JSON.stringify([
			{
				id: 'prod-wave-earbuds',
				name: 'AURA Wave IEM',
				price: 680,
				quantity: 1,
				source: 'Direct',
				courier: 'Steadfast',
				trackingCode: 'ST-924912',
				timeAgo: '৩ দিন আগে',
				confirmedAt: '৩ দিন আগে'
			}
		]),
		total: 680,
		status: 'delivered'
	},
	{
		id: 'INV-1180',
		customerName: 'আব্দুল্লাহ আল নোমান',
		customerEmail: '01512345670',
		shippingAddress: 'আগ্রাবাদ সি/এ, চট্টগ্রাম',
		items: JSON.stringify([
			{
				id: 'prod-sound-deck',
				name: 'AURA Sound Deck',
				price: 1150,
				quantity: 1,
				source: 'Facebook',
				courier: 'Steadfast',
				trackingCode: 'ST-923841',
				timeAgo: '৩ দিন আগে',
				confirmedAt: '৩ দিন আগে'
			}
		]),
		total: 1150,
		status: 'pending_return'
	},
	{
		id: 'INV-1175',
		customerName: 'ইসমাইল হোসেন',
		customerEmail: '01987654321',
		shippingAddress: 'রূপাতলী, বরিশাল',
		items: JSON.stringify([
			{
				id: 'prod-spectrum-x',
				name: 'AURA Spectrum X',
				price: 920,
				quantity: 1,
				source: 'Facebook',
				courier: 'Pathao',
				trackingCode: 'PT-440120',
				timeAgo: '৪ দিন আগে',
				confirmedAt: '৪ দিন আগে'
			}
		]),
		total: 920,
		status: 'returned'
	},
	{
		id: 'INV-1170',
		customerName: 'কামরুল হাসান',
		customerEmail: '01623456789',
		shippingAddress: 'মিরপুর ১০, ঢাকা',
		items: JSON.stringify([
			{
				id: 'prod-wave-earbuds',
				name: 'AURA Spatial IEMs',
				price: 540,
				quantity: 1,
				source: 'Direct',
				courier: 'Steadfast',
				trackingCode: 'ST-922194',
				timeAgo: '৫ দিন আগে',
				confirmedAt: '৫ দিন আগে'
			}
		]),
		total: 540,
		status: 'cancelled'
	},
	{
		id: 'INV-1165',
		customerName: 'হাসান ইমাম',
		customerEmail: '01734567891',
		shippingAddress: 'মৌলভীবাজার সদর',
		items: JSON.stringify([
			{
				id: 'prod-sound-deck',
				name: 'AURA Sound Deck',
				price: 720,
				quantity: 1,
				source: 'Facebook',
				courier: 'Steadfast',
				trackingCode: 'ST-921008',
				timeAgo: '৬ দিন আগে',
				confirmedAt: '৬ দিন আগে'
			}
		]),
		total: 720,
		status: 'missing'
	}
];

export function normalizeOrderStatus(status: string): string {
	if (status === 'paid') return 'confirmed';
	if (status === 'processing') return 'entry_done';
	if (status === 'dispatched') return 'shipped';
	if (status === 'refunded') return 'cancelled';
	if (status === 'no_response_3') return 'good_no_response';
	return status;
}
