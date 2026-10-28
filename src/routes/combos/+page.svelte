<script lang="ts">
	import { StoreLayout } from '#lib';
	import { Button, Card, CardContent, Badge } from '#lib/components/ui';
	import { cart } from '#lib/modules/cart/cart.svelte';
	import { Flame, ShoppingCart, Sparkles, Check } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const combos = [
		{
			id: 'combo-1',
			title: 'ছাদবাগান স্পেশাল সবজি কম্বো',
			badge: 'বেস্টসেলার',
			price: 499,
			originalPrice: 650,
			items: [
				'উন্নত হাইব্রিড কাঁচা মরিচ বীজ',
				'বারোমাসি বেগুন বীজ',
				'দেশি শসা বীজ',
				'পুষ্টিকর লাল শাক ও পালং শাক বীজ',
				'১টি প্রিমিয়াম সিড ট্রে উপহার'
			]
		},
		{
			id: 'combo-2',
			title: 'শীতকালীন শাক-সবজি প্যাকেজ',
			badge: 'হট ডিল',
			price: 599,
			originalPrice: 780,
			items: [
				'মুলা ও শালগম বীজ',
				'টমেটো হাইব্রিড ফ্লেভার বীজ',
				'সিম ও বরবটি বীজ',
				'ধনেপাতা ও পুদিনা বীজ',
				'ভার্মিকম্পোস্ট সার (১ কেজি ফ্রি)'
			]
		},
		{
			id: 'combo-3',
			title: 'ফল ও ফুলের রঙিন বাগান কম্বো',
			badge: 'নিউ রিলিজ',
			price: 699,
			originalPrice: 920,
			items: [
				'রঙিন গাঁদা ও ডালিয়া ফুলের বীজ',
				'সূর্যমুখী বীজ',
				'বারোমাসি পেঁপে বীজ',
				'১টি স্প্রেয়ার বোতল ফ্রি'
			]
		}
	];
</script>

<svelte:head>
	<title>কম্বো অফার ও প্যাকেজ (Combos Products) | AURA</title>
</svelte:head>

<StoreLayout user={data.user}>
	<div class="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-16 space-y-10 font-['Anek_Bangla',sans-serif]">
		
		<div class="text-center space-y-2 max-w-2xl mx-auto">
			<Badge variant="outline" class="bg-indigo-50 text-[#5845eb] border-indigo-200">
				Special Savings
			</Badge>
			<h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
				স্পেশাল কম্বো প্যাকেজসমূহ (Combos Products)
			</h1>
			<p class="text-xs sm:text-sm text-slate-500">
				একসাথে বেশি বীজ ও সার কিনুন আকর্ষণীয় ছাড়ে, সঙ্গে পাচ্ছেন ফ্রি গিফট আইটেম!
			</p>
		</div>

		<!-- Combos Grid -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			{#each combos as combo}
				<Card class="border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
					<CardContent class="p-6 space-y-4">
						<div class="flex items-center justify-between">
							<Badge class="bg-indigo-50 text-[#5845eb] border border-indigo-200 font-bold text-[10px]">
								{combo.badge}
							</Badge>
							<div class="flex items-baseline gap-1.5">
								<span class="text-lg font-black text-[#5845eb]">৳{combo.price}</span>
								<span class="text-xs text-slate-400 line-through">৳{combo.originalPrice}</span>
							</div>
						</div>

						<h3 class="text-base font-bold text-slate-900 leading-snug">
							{combo.title}
						</h3>

						<div class="space-y-2 pt-2 border-t border-slate-100">
							<span class="text-[11px] font-bold text-slate-500">প্যাকেজে যা যা পাচ্ছেন:</span>
							<ul class="space-y-1.5 text-xs text-slate-600">
								{#each combo.items as item}
									<li class="flex items-start gap-2">
										<Check class="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
										<span>{item}</span>
									</li>
								{/each}
							</ul>
						</div>

						<div class="pt-4">
							<Button
								onclick={() => cart.toggleCart()}
								class="w-full bg-[#5845eb] hover:bg-[#4936d6] text-white rounded-xl h-11 text-xs font-bold gap-2 cursor-pointer shadow-sm shadow-indigo-600/30"
							>
								<ShoppingCart class="w-4 h-4" />
								<span>কার্টে যোগ করুন</span>
							</Button>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>

	</div>
</StoreLayout>
