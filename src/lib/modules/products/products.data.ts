import type { Product } from './types';

export const productsData: Product[] = [
	{
		id: 'aura-spectrum-x',
		name: 'AURA Spectrum X',
		slug: 'aura-spectrum-x',
		tagline: 'Flagship Spatial Planar Magnetic Headphones',
		category: 'headphones',
		categoryLabel: 'Spatial Headphones',
		price: 34900,
		originalPrice: 42900,
		rating: 4.9,
		reviewsCount: 1420,
		image: '/images/headphones.jpg',
		badge: 'Flagship Edition',
		badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
		features: [
			'50mm Planar Gold Diaphragm',
			'Neural ANC 2.0 (-48dB)',
			'55hr Battery Endurance',
			'Ultra-Low 12ms RF Wireless'
		],
		description: 'Masterfully crafted with aerospace aluminum gimbals and gold-sputtered planar magnetic diaphragms for unmatched acoustic transparency.',
		inStock: true
	},
	{
		id: 'zenith-pulse-anc',
		name: 'ZENITH Pulse ANC',
		slug: 'zenith-pulse-anc',
		tagline: 'True Wireless Audiophile In-Ears with Telemetry Dock',
		category: 'in-ears',
		categoryLabel: 'Audiophile In-Ears',
		price: 18900,
		originalPrice: 22900,
		rating: 4.8,
		reviewsCount: 890,
		image: '/images/earbuds.jpg',
		badge: 'Bestseller',
		badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
		features: [
			'Dual Hybrid Dynamic Balanced Armature',
			'Smart OLED Telemetry Charging Dock',
			'IPX7 Sweat & Water Resistance',
			'Multipoint Bluetooth 5.4'
		],
		description: 'Pocket acoustic perfection with real-time battery and codec telemetry displayed on the brushed metallic capsule.',
		inStock: true
	},
	{
		id: 'neo-tone-master-deck',
		name: 'NEO-TONE Master Deck',
		slug: 'neo-tone-master-deck',
		tagline: 'Tactile Creator Audio Console & Spatial DSP',
		category: 'studio',
		categoryLabel: 'Studio Hardware',
		price: 49900,
		originalPrice: 59900,
		rating: 5.0,
		reviewsCount: 310,
		image: '/images/sound-deck.jpg',
		badge: 'Studio Pro',
		badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
		features: [
			'Motorized Optical Touch Faders',
			'Rotary RGB Endless Encoders',
			'Hardware DSP Spatial Matrix',
			'USB-C Dual PC Host Routing'
		],
		description: 'The ultimate tactile broadcast, streaming, and music command console designed for professional audio engineers.',
		inStock: true
	},
	{
		id: 'aura-soundscape-vst',
		name: 'AURA Atmos Suite VST3',
		slug: 'aura-soundscape-vst',
		tagline: 'Binaural Convolution & Spatial VST3/AU Plugin',
		category: 'digital',
		categoryLabel: 'Digital Software',
		price: 9900,
		originalPrice: 14900,
		rating: 4.9,
		reviewsCount: 650,
		image: '/images/headphones.jpg',
		badge: 'Instant Digital License',
		badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
		features: [
			'120+ Spatial Impulses & Soundscapes',
			'AU, VST3, AAX Native Support',
			'Zero-Latency Convolution Engine',
			'Lifetime Free Algorithmic Updates'
		],
		description: 'Binaural spatial room acoustics plugin suite compatible with Ableton Live, Logic Pro, Pro Tools, and Studio One.',
		inStock: true
	}
];
