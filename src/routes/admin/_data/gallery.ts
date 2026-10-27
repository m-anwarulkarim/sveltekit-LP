export interface GalleryImage {
	id: string;
	name: string;
	url: string;
	folder: 'products' | 'categories' | 'banners' | 'stickers' | 'general';
	size: string;
	dimensions: string;
	uploadedAt: string;
}

export const INITIAL_GALLERY_IMAGES: GalleryImage[] = [
	{
		id: 'img-paint-pen-1',
		name: 'Car Paint Pen - Single Pen & Nib',
		url: '/images/products/car-paint-pen.svg',
		folder: 'products',
		size: '42 KB',
		dimensions: '800 x 800',
		uploadedAt: 'আজ, ১০:১৫ AM'
	},
	{
		id: 'img-paint-pen-scratch',
		name: 'Car Scratch Repair Demonstration 4-Grid',
		url: '/images/products/car-paint-pen.svg',
		folder: 'products',
		size: '68 KB',
		dimensions: '800 x 800',
		uploadedAt: 'আজ, ১০:২০ AM'
	},
	{
		id: 'img-paint-pen-colors',
		name: 'All Available Car Colors Fan Circular',
		url: '/images/products/car-paint-pen.svg',
		folder: 'products',
		size: '85 KB',
		dimensions: '800 x 800',
		uploadedAt: 'আজ, ১০:২৫ AM'
	},
	{
		id: 'img-window-sticker',
		name: '3D Scenic Window Wall View Decal',
		url: '/images/products/window-sticker.svg',
		folder: 'stickers',
		size: '54 KB',
		dimensions: '800 x 800',
		uploadedAt: 'গতকাল, ০৪:৩০ PM'
	},
	{
		id: 'img-mosquito-lamp-glow',
		name: 'Mosquito Exterminator UV Night Glow',
		url: '/images/products/mosquito-lamp.svg',
		folder: 'products',
		size: '76 KB',
		dimensions: '800 x 800',
		uploadedAt: 'গতকাল, ০৩:১৫ PM'
	},
	{
		id: 'img-mosquito-lamp-desk',
		name: 'Mosquito Exterminator On Working Desk',
		url: '/images/products/mosquito-lamp.svg',
		folder: 'products',
		size: '62 KB',
		dimensions: '800 x 800',
		uploadedAt: 'গতকাল, ০২:৪৫ PM'
	},
	{
		id: 'img-mosquito-lamp-box',
		name: 'Mosquito Lamp Retail Packaging',
		url: '/images/products/mosquito-lamp.svg',
		folder: 'products',
		size: '58 KB',
		dimensions: '800 x 800',
		uploadedAt: 'গতকাল, ০১:১০ PM'
	},
	{
		id: 'img-banner-home',
		name: 'AURA Storefront Mega Hero Banner',
		url: '/images/banners/banner-home.svg',
		folder: 'banners',
		size: '112 KB',
		dimensions: '1920 x 800',
		uploadedAt: '২ দিন আগে'
	},
	{
		id: 'img-banner-combo',
		name: 'Special Combo Discount Banner',
		url: '/images/banners/banner-combo.svg',
		folder: 'banners',
		size: '95 KB',
		dimensions: '1440 x 600',
		uploadedAt: '২ দিন আগে'
	},
	{
		id: 'img-banner-citizens',
		name: 'Senior Citizens Privilege Card Promo',
		url: '/images/banners/banner-citizens.svg',
		folder: 'banners',
		size: '88 KB',
		dimensions: '1440 x 600',
		uploadedAt: '৩ দিন আগে'
	},
	{
		id: 'img-earbuds-wave',
		name: 'AURA Wave Spatial Pro In-Ear',
		url: '/images/earbuds.jpg',
		folder: 'products',
		size: '48 KB',
		dimensions: '800 x 800',
		uploadedAt: '৩ দিন আগে'
	},
	{
		id: 'img-headphones-spectrum',
		name: 'AURA Spectrum X Studio Headphones',
		url: '/images/headphones.jpg',
		folder: 'products',
		size: '52 KB',
		dimensions: '800 x 800',
		uploadedAt: '৪ দিন আগে'
	},
	{
		id: 'img-sound-deck-unit',
		name: 'AURA Creator Deck Studio Console',
		url: '/images/sound-deck.jpg',
		folder: 'products',
		size: '65 KB',
		dimensions: '800 x 800',
		uploadedAt: '৪ দিন আগে'
	},
	{
		id: 'img-cat-automotive',
		name: 'Category: Car Care & Auto Accessories',
		url: '/images/products/car-paint-pen.svg',
		folder: 'categories',
		size: '40 KB',
		dimensions: '500 x 500',
		uploadedAt: '৫ দিন আগে'
	},
	{
		id: 'img-cat-home-decor',
		name: 'Category: 3D Wall Stickers & Home Decor',
		url: '/images/products/window-sticker.svg',
		folder: 'categories',
		size: '44 KB',
		dimensions: '500 x 500',
		uploadedAt: '৫ দিন আগে'
	},
	{
		id: 'img-cat-electronics',
		name: 'Category: Smart Electronic Traps & Gadgets',
		url: '/images/products/mosquito-lamp.svg',
		folder: 'categories',
		size: '46 KB',
		dimensions: '500 x 500',
		uploadedAt: '৫ দিন আগে'
	}
];

// In-memory gallery store to preserve newly uploaded images across client/server
let currentGallery = [...INITIAL_GALLERY_IMAGES];

export function getGalleryImages(): GalleryImage[] {
	return currentGallery;
}

export function addGalleryImage(image: GalleryImage): GalleryImage {
	currentGallery.unshift(image);
	return image;
}

export function deleteGalleryImage(id: string): boolean {
	const initialLen = currentGallery.length;
	currentGallery = currentGallery.filter(img => img.id !== id);
	return currentGallery.length < initialLen;
}

