<script lang="ts">
	import type { Product } from '#lib/modules/products/types.ts';
	import {
		Tabs,
		TabsList,
		TabsTrigger,
		TabsContent,
		Button
	} from '#lib/components/ui';
	import {
		FileText,
		Sliders,
		MessageSquare,
		Truck,
		Star,
		CheckCircle2,
		ShieldCheck
	} from 'lucide-svelte';

	interface Props {
		product: Product;
	}

	let { product }: Props = $props();

	type TabId = 'description' | 'specifications' | 'reviews' | 'shipping';
	let activeTab = $state<TabId>('description');

	const mockReviews = [
		{
			id: '1',
			name: 'তানভীর আহমেদ',
			city: 'ঢাকা',
			rating: 5,
			date: '৩ দিন আগে',
			comment: '১০০% অরিজিনাল প্রডাক্ট পেয়েছি! প্যাকেজিং খুবই ভালো ছিল এবং একদিনের মধ্যেই ডেলিভারি পেয়েছি। ধন্যবাদ!'
		},
		{
			id: '2',
			name: 'আরিফুল ইসলাম',
			city: 'চট্টগ্রাম',
			rating: 5,
			date: '১ সপ্তাহ আগে',
			comment: 'দাম এবং কোয়ালিটি দুটোই অসাধারণ। সরাসরি অথেনটিক সিল দেওয়া ছিল। অবশ্যই রিকমেন্ড করব।'
		},
		{
			id: '3',
			name: 'মেহেদী হাসান',
			city: 'সিলেট',
			rating: 4,
			date: '২ সপ্তাহ আগে',
			comment: 'খুবই দ্রুত সার্ভিস। প্রডাক্টের রেজাল্ট ভালো পাচ্ছি। ক্যাশ অন ডেলিভারিতে চেক করে নিতে পেরেছি।'
		}
	];
</script>

<div class="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden font-['Anek_Bangla',sans-serif]">
	<Tabs bind:value={activeTab} defaultValue="description" class="w-full">
		<!-- Tab Bar using shadcn TabsList and TabsTrigger -->
		<TabsList class="w-full justify-start h-auto p-0 bg-slate-50/70 border-b border-slate-200/80 rounded-none overflow-x-auto no-scrollbar px-2 sm:px-4">
			<TabsTrigger
				value="description"
				class="px-4 py-3 sm:py-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 rounded-none transition-all cursor-pointer shrink-0 data-[state=active]:border-[#2563eb] data-[state=active]:text-[#2563eb] data-[state=active]:bg-white data-[state=active]:rounded-t-xl data-[state=active]:shadow-2xs {activeTab === 'description' ? 'border-[#2563eb] text-[#2563eb] bg-white rounded-t-xl shadow-2xs' : 'border-transparent text-slate-600 hover:text-slate-900 bg-transparent shadow-none'}"
			>
				<FileText class="w-4 h-4" />
				<span>পণ্য বিবরণী</span>
			</TabsTrigger>

			<TabsTrigger
				value="specifications"
				class="px-4 py-3 sm:py-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 rounded-none transition-all cursor-pointer shrink-0 data-[state=active]:border-[#2563eb] data-[state=active]:text-[#2563eb] data-[state=active]:bg-white data-[state=active]:rounded-t-xl data-[state=active]:shadow-2xs {activeTab === 'specifications' ? 'border-[#2563eb] text-[#2563eb] bg-white rounded-t-xl shadow-2xs' : 'border-transparent text-slate-600 hover:text-slate-900 bg-transparent shadow-none'}"
			>
				<Sliders class="w-4 h-4" />
				<span>স্পেসিফিকেশন</span>
			</TabsTrigger>

			<TabsTrigger
				value="reviews"
				class="px-4 py-3 sm:py-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 rounded-none transition-all cursor-pointer shrink-0 data-[state=active]:border-[#2563eb] data-[state=active]:text-[#2563eb] data-[state=active]:bg-white data-[state=active]:rounded-t-xl data-[state=active]:shadow-2xs {activeTab === 'reviews' ? 'border-[#2563eb] text-[#2563eb] bg-white rounded-t-xl shadow-2xs' : 'border-transparent text-slate-600 hover:text-slate-900 bg-transparent shadow-none'}"
			>
				<MessageSquare class="w-4 h-4" />
				<span>রিভিউ ও রেটিং ({product.reviewsCount})</span>
			</TabsTrigger>

			<TabsTrigger
				value="shipping"
				class="px-4 py-3 sm:py-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 rounded-none transition-all cursor-pointer shrink-0 data-[state=active]:border-[#2563eb] data-[state=active]:text-[#2563eb] data-[state=active]:bg-white data-[state=active]:rounded-t-xl data-[state=active]:shadow-2xs {activeTab === 'shipping' ? 'border-[#2563eb] text-[#2563eb] bg-white rounded-t-xl shadow-2xs' : 'border-transparent text-slate-600 hover:text-slate-900 bg-transparent shadow-none'}"
			>
				<Truck class="w-4 h-4" />
				<span>ডেলিভারি ও রিটার্ন</span>
			</TabsTrigger>
		</TabsList>

		<!-- Tab Contents using shadcn TabsContent -->
		<div class="p-5 sm:p-8">
			<!-- 1. Description Tab -->
			<TabsContent value="description" class="mt-0">
				<div class="space-y-5 max-w-4xl">
					<div class="space-y-3">
						<h3 class="text-base sm:text-lg font-bold text-slate-900">
							{product.name} সম্পর্কে বিস্তারিত:
						</h3>
						<div class="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed font-['Anek_Bangla',sans-serif]">
							{#if product.description}
								{@html product.description}
							{:else}
								<p>
									{product.name} হলো একটি ১০০% অথেনটিক এবং প্রিমিয়াম কোয়ালিটি পণ্য। এটি আপনার দৈনন্দিন ব্যবহারে সর্বোত্তম ফলাফল নিশ্চিত করার জন্য পরীক্ষিত ও বিশেষভাবে প্রস্তুতকৃত।
								</p>
							{/if}
						</div>
					</div>

					<!-- Key Highlights -->
					{#if product.features && product.features.length > 0}
						<div class="space-y-2 pt-2">
							<h4 class="text-sm font-bold text-slate-800">মূল বৈশিষ্ট্য ও সুবিধাসমূহ:</h4>
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
								{#each product.features as feature}
									<div class="flex items-start gap-2 text-xs sm:text-sm text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
										<CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
										<span>{feature}</span>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- How to use / Benefits Box -->
					<div class="p-4 rounded-2xl bg-blue-50/60 border border-blue-150 space-y-1.5">
						<h4 class="text-xs sm:text-sm font-bold text-[#2563eb] flex items-center gap-1.5">
							<ShieldCheck class="w-4 h-4" />
							<span>সঠিক ব্যবহারের নিয়ম ও পরামর্শ:</span>
						</h4>
						<p class="text-xs text-slate-600 leading-relaxed">
							পণ্যটি ব্যবহারের পূর্বে লেবেলে উল্লেখিত নির্দেশিকা ভালোভাবে পড়ুন। শুষ্ক ও শীতল স্থানে সংরক্ষণ করুন। কোনো ধরনের সমস্যা বা জিজ্ঞাসার জন্য আমাদের সাপোর্ট নম্বরে যোগাযোগ করুন।
						</p>
					</div>
				</div>
			</TabsContent>

			<!-- 2. Specifications Tab -->
			<TabsContent value="specifications" class="mt-0">
				<div class="max-w-3xl space-y-4">
					<h3 class="text-base font-bold text-slate-900">টেকনিক্যাল স্পেসিফিকেশন:</h3>
					
					<div class="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs sm:text-sm">
						<div class="grid grid-cols-3 p-3 bg-slate-50/50">
							<span class="font-bold text-slate-500">পণ্য ক্যাটাগরি</span>
							<span class="col-span-2 text-slate-800 font-semibold">{product.categoryLabel}</span>
						</div>
						<div class="grid grid-cols-3 p-3">
							<span class="font-bold text-slate-500">প্রোডাক্ট কোড / SKU</span>
							<span class="col-span-2 text-slate-800 font-mono font-semibold">{product.id.toUpperCase()}</span>
						</div>
						<div class="grid grid-cols-3 p-3 bg-slate-50/50">
							<span class="font-bold text-slate-500">স্টক অবস্থা</span>
							<span class="col-span-2 text-emerald-600 font-bold">ইন স্টক (সরাসরি রেডি টু শিপ)</span>
						</div>
						<div class="grid grid-cols-3 p-3">
							<span class="font-bold text-slate-500">ডেলিভারি সময়সীমা</span>
							<span class="col-span-2 text-slate-800 font-semibold">{product.deliveryTime || '১২-২৪ ঘণ্টা (সুপার ফাস্ট)'}</span>
						</div>
						<div class="grid grid-cols-3 p-3 bg-slate-50/50">
							<span class="font-bold text-slate-500">অথেনটিসিটি</span>
							<span class="col-span-2 text-slate-800 font-semibold">১০০% অরিজিনাল ব্র্যান্ড ইমপোর্টেড</span>
						</div>
						<div class="grid grid-cols-3 p-3">
							<span class="font-bold text-slate-500">রিটার্ন সুবিধা</span>
							<span class="col-span-2 text-slate-800 font-semibold">৭ দিনের সহজ রিটার্ন বা এক্সচেঞ্জ পলিসি</span>
						</div>
					</div>
				</div>
			</TabsContent>

			<!-- 3. Reviews Tab -->
			<TabsContent value="reviews" class="mt-0">
				<div class="space-y-6 max-w-4xl">
					<!-- Rating Breakdown Header -->
					<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
						<div class="flex items-center gap-4">
							<div class="text-4xl sm:text-5xl font-black text-slate-900 font-['Outfit']">
								{product.rating}.0
							</div>
							<div class="space-y-1">
								<div class="flex text-amber-400 gap-1">
									{#each Array(5) as _}
										<Star class="w-4 h-4 fill-amber-400 text-amber-400" />
									{/each}
								</div>
								<div class="text-xs text-slate-500 font-medium">
									{product.reviewsCount} জন ক্রেতার রেটিং এর ভিত্তিতে
								</div>
							</div>
						</div>

						<Button
							type="button"
							variant="default"
							class="h-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
						>
							রিভিউ লিখুন
						</Button>
					</div>

					<!-- Customer Review List -->
					<div class="space-y-3 pt-2">
						{#each mockReviews as rev}
							<div class="p-4 rounded-xl border border-slate-100 bg-white shadow-2xs space-y-2">
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-2">
										<div class="w-8 h-8 rounded-full bg-blue-100 text-[#2563eb] font-bold text-xs flex items-center justify-center">
											{rev.name.charAt(0)}
										</div>
										<div>
											<span class="text-xs font-bold text-slate-800 block">{rev.name}</span>
											<span class="text-[10px] text-slate-400">{rev.city} • {rev.date}</span>
										</div>
									</div>
									<div class="flex text-amber-400 gap-0.5">
										{#each Array(rev.rating) as _}
											<Star class="w-3 h-3 fill-amber-400 text-amber-400" />
										{/each}
									</div>
								</div>
								<p class="text-xs text-slate-600 leading-relaxed">
									"{rev.comment}"
								</p>
							</div>
						{/each}
					</div>
				</div>
			</TabsContent>

			<!-- 4. Shipping & Returns Tab -->
			<TabsContent value="shipping" class="mt-0">
				<div class="space-y-4 max-w-3xl text-xs sm:text-sm text-slate-700">
					<h3 class="text-base font-bold text-slate-900">ডেলিভারি চার্জ ও নীতিমালা:</h3>
					
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
							<span class="font-bold text-slate-900 block text-sm">ঢাকা সিটির ভিতরে:</span>
							<p class="text-xs text-slate-600">ডেলিভারি চার্জ মাত্র ৳৬০ টাকা। অর্ডার কনফার্মেশনের ১২-২৪ ঘণ্টার মধ্যে হোম ডেলিভারি।</p>
						</div>

						<div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
							<span class="font-bold text-slate-900 block text-sm">ঢাকা সিটির বাইরে সারাদেশে:</span>
							<p class="text-xs text-slate-600">ডেলিভারি চার্জ মাত্র ৳১২০ টাকা। ২৪-৪৮ ঘণ্টার মধ্যে দ্রুততম কুরিয়ার হোম ডেলিভারি।</p>
						</div>
					</div>

					<div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-1 mt-3">
						<span class="font-bold block">৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি:</span>
						<p class="text-xs text-emerald-700">
							পণ্য হাতে পাওয়ার পর কোনো ত্রুটি বা মিসম্যাচ দেখা দিলে কোনো বাড়তি খরচ ছাড়াই ৭ দিনের মধ্যে রিপ্লেসমেন্ট বা ফুল রিফান্ড প্রদান করা হবে।
						</p>
					</div>
				</div>
			</TabsContent>
		</div>
	</Tabs>
</div>
