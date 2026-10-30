<script lang="ts">
	import {
		Globe,
		Search,
		PhoneCall,
		MessageCircle,
		Video,
		Share2,
		Sparkles
	} from 'lucide-svelte';

	interface Props {
		source?: string | null;
		class?: string;
		showIcon?: boolean;
	}

	let {
		source = 'Website',
		class: className = '',
		showIcon = true
	}: Props = $props();

	// Source metadata analyzer
	let meta = $derived.by(() => {
		const s = (source || '').toLowerCase().trim();

		if (s.includes('facebook') || s.includes('fb')) {
			return {
				label: 'Facebook',
				tag: 'Facebook Ad',
				bg: 'bg-blue-50 text-blue-700 border-blue-200/80 hover:bg-blue-100/70',
				iconBg: 'bg-blue-600 text-white',
				icon: 'facebook'
			};
		}

		if (s.includes('google')) {
			return {
				label: 'Google Search',
				tag: 'Google Ads',
				bg: 'bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100/70',
				iconBg: 'bg-amber-500 text-white',
				icon: 'google'
			};
		}

		if (s.includes('whatsapp') || s.includes('wp')) {
			return {
				label: 'WhatsApp',
				tag: 'WhatsApp Order',
				bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100/70',
				iconBg: 'bg-emerald-500 text-white',
				icon: 'whatsapp'
			};
		}

		if (s.includes('manual') || s.includes('call') || s.includes('phone') || s.includes('offline')) {
			return {
				label: 'Phone / Manual',
				tag: 'Manual Entry',
				bg: 'bg-purple-50 text-purple-800 border-purple-200/80 hover:bg-purple-100/70',
				iconBg: 'bg-purple-600 text-white',
				icon: 'phone'
			};
		}

		if (s.includes('tiktok')) {
			return {
				label: 'TikTok',
				tag: 'TikTok Ads',
				bg: 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200/80',
				iconBg: 'bg-slate-900 text-white',
				icon: 'tiktok'
			};
		}

		// Default fallback is Website / Direct Checkout
		return {
			label: source && source !== 'Direct' && source !== 'Storefront Checkout' ? source : 'ওয়েবসাইট',
			tag: 'Storefront',
			bg: 'bg-indigo-50 text-[#5845eb] border-indigo-200/80 hover:bg-indigo-100/70',
			iconBg: 'bg-[#5845eb] text-white',
			icon: 'globe'
		};
	});
</script>

<span
	class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors shadow-2xs select-none {meta.bg} {className}"
	title="অর্ডার সোর্স: {meta.label} ({meta.tag})"
>
	{#if showIcon}
		{#if meta.icon === 'facebook'}
			<!-- Facebook SVG Icon -->
			<svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
				<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
			</svg>
		{:else if meta.icon === 'google'}
			<!-- Google SVG Icon -->
			<svg class="w-3.5 h-3.5" viewBox="0 0 24 24">
				<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
				<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
				<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
				<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
			</svg>
		{:else if meta.icon === 'whatsapp'}
			<MessageCircle class="w-3.5 h-3.5" />
		{:else if meta.icon === 'phone'}
			<PhoneCall class="w-3.5 h-3.5" />
		{:else if meta.icon === 'tiktok'}
			<Video class="w-3.5 h-3.5" />
		{:else}
			<Globe class="w-3.5 h-3.5" />
		{/if}
	{/if}

	<span>{meta.label}</span>
</span>
