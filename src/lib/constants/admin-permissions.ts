export interface AdminMenuItem {
	id: string;
	name: string;
	englishName: string;
	path: string;
	desc: string;
	icon: string;
	isOwnerOnly?: boolean;
}

export const ADMIN_MENU_LIST: AdminMenuItem[] = [
	{
		id: 'dashboard',
		name: 'ড্যাশবোর্ড',
		englishName: 'Dashboard',
		path: '/admin',
		desc: 'ওভারভিউ, লাইভ রেভিনিউ চার্ট ও সেলস পরিসংখ্যান',
		icon: 'LayoutDashboard'
	},
	{
		id: 'orders',
		name: 'অর্ডারস',
		englishName: 'Orders',
		path: '/admin/orders',
		desc: 'নতুন অর্ডার, ওয়েব অর্ডার, ইনকমপ্লিট ও ট্র্যাশ অর্ডার',
		icon: 'ShoppingBag'
	},
	{
		id: 'products',
		name: 'প্রোডাক্টস',
		englishName: 'Products',
		path: '/admin/products',
		desc: 'পণ্য তৈরি, মূল্য নির্ধারণ, এডিট ও ইনভেন্টরি স্টক',
		icon: 'Package'
	},
	{
		id: 'customization',
		name: 'কাস্টমাইজেশন',
		englishName: 'Customization',
		path: '/admin/customization/carousel',
		desc: 'ওয়েবসাইট ক্যারোসেল, ব্যানার, পপআপ ও থিম লুক',
		icon: 'Palette'
	},
	{
		id: 'catalog',
		name: 'ক্যাটালগ',
		englishName: 'Catalog',
		path: '/admin/catalog/categories',
		desc: 'ক্যাটাগরি, সাব-ক্যাটাগরি, চাইল্ড ক্যাটাগরি, ব্র্যান্ড ও ট্যাগ',
		icon: 'Layers'
	},
	{
		id: 'landing-pages',
		name: 'ল্যান্ডিং পেজ',
		englishName: 'Landing Pages',
		path: '/admin/landing-pages',
		desc: 'সিঙ্গেল প্রোডাক্ট সেলস ফানেল ও কাস্টম ল্যান্ডিং পেজ বিল্ডার',
		icon: 'Globe'
	},
	{
		id: 'daily-target',
		name: 'ডেইলি টার্গেট',
		englishName: 'Daily Target',
		path: '/admin/daily-target',
		desc: 'দৈনিক সেলস গোল ট্র্যাকিং ও পারফরম্যান্স এনালাইসিস',
		icon: 'Target'
	},
	{
		id: 'coupons',
		name: 'কুপনস',
		englishName: 'Coupons',
		path: '/admin/coupons',
		desc: 'ডিসকাউন্ট কুপন তৈরি, লিমিট ও কুপন কোড ম্যানেজমেন্ট',
		icon: 'Percent'
	},
	{
		id: 'customers',
		name: 'কাস্টমার্স',
		englishName: 'Customers',
		path: '/admin/customers',
		desc: 'কাস্টমার তথ্য, কেনাকাটার হিস্ট্রি ও কাস্টমার এনগেজমেন্ট',
		icon: 'Users'
	},
	{
		id: 'reports',
		name: 'রিপোর্টস',
		englishName: 'Reports',
		path: '/admin/reports',
		desc: 'দৈনিক বিজনেস সামারি ও মোট অ্যাসেট ভ্যালুয়েশন রিপোর্ট',
		icon: 'FileText'
	},
	{
		id: 'settings',
		name: 'সেটিংস',
		englishName: 'Settings',
		path: '/admin/settings/courier',
		desc: 'Steadfast/Pathao কুরিয়ার, পেমেন্ট গেটওয়ে, ফেসবুক পিক্সেল',
		icon: 'Settings'
	},
	{
		id: 'ip-block',
		name: 'আইপি সেন্টিনেল',
		englishName: 'IP Sentinel',
		path: '/admin/ip-block',
		desc: 'বট ট্রাফিক মনিটরিং ও ক্ষতিকর আইপি অ্যাড্রেস ব্লকলিস্ট',
		icon: 'ShieldAlert'
	},
	{
		id: 'gallery',
		name: 'গ্যালারি',
		englishName: 'Media Gallery',
		path: '/admin/gallery',
		desc: 'প্রোডাক্ট ছবি, মিডিয়া অ্যাসেটস ও ফাইল ম্যানেজার',
		icon: 'Image'
	},
	{
		id: 'database',
		name: 'ডাটাবেজ',
		englishName: 'Database',
		path: '/admin/database',
		desc: 'ক্লাউডফ্লেয়ার D1 ডাটাবেজ টেবিল, ব্যাকআপ ও লাইভ রেকর্ডস',
		icon: 'Database'
	},
	{
		id: 'admin-control',
		name: 'অ্যাডমিন কন্ট্রোল',
		englishName: 'Admin Control',
		path: '/admin/admin-control',
		desc: 'টিম মেম্বারদের রোল, মেনু অ্যাক্সেস ও পাসওয়ার্ড কন্ট্রোল',
		icon: 'ShieldCheck',
		isOwnerOnly: true
	}
];

export interface RolePreset {
	role: string;
	label: string;
	description: string;
	badgeClass: string;
	permissions: string[];
}

export const ROLE_PRESETS: RolePreset[] = [
	{
		role: 'Owner',
		label: 'ওনার (Owner)',
		description: 'সর্বোচ্চ ক্ষমতা ও সম্পূর্ণ সকল মেনুর পূর্ণ নিয়ন্ত্রণ',
		badgeClass: 'bg-black text-pink-400 border-pink-500/40',
		permissions: ['*']
	},
	{
		role: 'Super Admin',
		label: 'সুপার অ্যাডমিন (Super Admin)',
		description: 'অ্যাডমিন কন্ট্রোল ব্যতিরেকে সকল ডিপার্টমেন্টের অ্যাক্সেস',
		badgeClass: 'bg-indigo-600 text-white border-indigo-400',
		permissions: [
			'dashboard',
			'orders',
			'products',
			'customization',
			'catalog',
			'landing-pages',
			'daily-target',
			'coupons',
			'customers',
			'reports',
			'settings',
			'ip-block',
			'gallery',
			'database'
		]
	},
	{
		role: 'Order Manager',
		label: 'অর্ডার ম্যানেজার (Order Manager)',
		description: 'শুধুমাত্র অর্ডার হ্যান্ডলিং, ডেলিভারি স্ট্যাটাস ও গ্রাহক তথ্য',
		badgeClass: 'bg-emerald-600 text-white border-emerald-400',
		permissions: ['dashboard', 'orders', 'customers']
	},
	{
		role: 'Product Specialist',
		label: 'প্রোডাক্ট স্পেশালিস্ট (Product Specialist)',
		description: 'প্রোডাক্ট আপলোড, স্টক আপডেট, ক্যাটালগ ও ছবি গ্যালারি',
		badgeClass: 'bg-violet-600 text-white border-violet-400',
		permissions: ['products', 'catalog', 'gallery']
	},
	{
		role: 'Support Staff',
		label: 'সাপোর্ট স্টাফ (Support Staff)',
		description: 'অর্ডার অনুসন্ধান ও কাস্টমার কেয়ার সাপোর্ট',
		badgeClass: 'bg-amber-600 text-white border-amber-400',
		permissions: ['orders', 'customers']
	},
	{
		role: 'Custom',
		label: 'কাস্টম রোল (Custom)',
		description: 'ওনার নিজের প্রয়োজন অনুযায়ী নির্দিষ্ট মেনু টিক করে দেবেন',
		badgeClass: 'bg-slate-700 text-slate-200 border-slate-500',
		permissions: []
	}
];

/**
 * Parses raw JSON string or string array into a clean string array of menu IDs
 */
export function normalizePermissions(raw: any): string[] {
	if (!raw) return ['*'];
	if (Array.isArray(raw)) return raw;
	if (typeof raw === 'string') {
		try {
			const parsed = JSON.parse(raw);
			return Array.isArray(parsed) ? parsed : [raw];
		} catch {
			return raw.split(',').map((s) => s.trim()).filter(Boolean);
		}
	}
	return ['*'];
}

/**
 * Checks whether an admin user's permissions allow access to a specific menu key
 */
export function hasMenuAccess(
	permissions: string[] | string | null | undefined,
	menuId: string
): boolean {
	const list = normalizePermissions(permissions);
	if (list.includes('*')) return true;
	return list.includes(menuId);
}

/**
 * Returns human-readable Bengali label for a menu ID
 */
export function getMenuLabel(menuId: string): string {
	if (menuId === '*') return 'সকল মেনু (Full Access)';
	const found = ADMIN_MENU_LIST.find((m) => m.id === menuId);
	return found ? found.name : menuId;
}

/**
 * Maps a URL pathname to its corresponding Admin Menu ID
 */
export function getMenuIdFromPath(pathname: string): string | null {
	if (pathname === '/admin' || pathname.startsWith('/admin/my-activity') || pathname.startsWith('/admin/bot-activity')) {
		return 'dashboard';
	}
	if (pathname.startsWith('/admin/orders')) return 'orders';
	if (pathname.startsWith('/admin/products')) return 'products';
	if (pathname.startsWith('/admin/customization')) return 'customization';
	if (pathname.startsWith('/admin/catalog')) return 'catalog';
	if (pathname.startsWith('/admin/landing-pages')) return 'landing-pages';
	if (pathname.startsWith('/admin/daily-target')) return 'daily-target';
	if (pathname.startsWith('/admin/coupons')) return 'coupons';
	if (pathname.startsWith('/admin/customers')) return 'customers';
	if (pathname.startsWith('/admin/reports')) return 'reports';
	if (pathname.startsWith('/admin/settings')) return 'settings';
	if (pathname.startsWith('/admin/ip-block')) return 'ip-block';
	if (pathname.startsWith('/admin/gallery')) return 'gallery';
	if (pathname.startsWith('/admin/database')) return 'database';
	if (pathname.startsWith('/admin/admin-control')) return 'admin-control';
	return null;
}
