<script lang="ts">
	import type { Product } from '#lib/modules/products/types.ts';
	import {
		Tabs,
		TabsList,
		TabsTrigger,
		TabsContent,
		Button,
		Input,
		Textarea
	} from '#lib/components/ui';
	import {
		FileText,
		Sliders,
		MessageSquare,
		Truck,
		Star,
		CheckCircle2,
		ShieldCheck,
		Send,
		UserCheck
	} from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { toast } from '#lib/components/ui';

	interface ReviewItem {
		id: string;
		name: string;
		city: string;
		rating: number;
		title?: string;
		comment: string;
		verified?: boolean;
		date: string;
	}

	interface Props {
		product: Product;
		reviews?: ReviewItem[];
	}

	let { product, reviews = [] }: Props = $props();

	type TabId = 'description' | 'specifications' | 'reviews' | 'shipping';
	let activeTab = $state<TabId>('description');
	let isWritingReview = $state(false);
	let newRating = $state(5);
	let isSubmitting = $state(false);
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
									{reviews.length > 0 ? `${reviews.length} জন ক্রেতার রিয়েল রিভিউ` : 'এখনও কোনো রিভিউ যুক্ত হয়নি'}
								</div>
							</div>
						</div>

						<Button
							type="button"
							variant="default"
							onclick={() => (isWritingReview = !isWritingReview)}
							class="h-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
						>
							{isWritingReview ? 'বাতিল করুন' : 'রিভিউ লিখুন'}
						</Button>
					</div>

					<!-- Inline Add Review Form -->
					{#if isWritingReview}
						<form
							method="POST"
							action="?/addReview"
							use:enhance={() => {
								isSubmitting = true;
								return async ({ result, update }) => {
									isSubmitting = false;
									if (result.type === 'success') {
										toast.success('আপনার রিভিউ সফলভাবে প্রকাশ করা হয়েছে!');
										isWritingReview = false;
										await update();
									} else {
										toast.error('রিভিউ সেভ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
									}
								};
							}}
							class="p-5 rounded-2xl border border-indigo-100 bg-indigo-50/40 space-y-4 animate-in fade-in"
						>
							<input type="hidden" name="productId" value={product.id} />
							<input type="hidden" name="rating" value={newRating} />

							<div class="flex items-center justify-between">
								<span class="text-xs font-bold text-slate-900">আপনার রেটিং নির্বাচন করুন:</span>
								<div class="flex items-center gap-1">
									{#each [1, 2, 3, 4, 5] as star}
										<button
											type="button"
											onclick={() => (newRating = star)}
											class="p-1 hover:scale-110 transition-transform cursor-pointer"
											aria-label="{star} Star"
										>
											<Star
												class="w-5 h-5 {star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}"
											/>
										</button>
									{/each}
								</div>
							</div>

							<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div>
									<label class="block text-xs font-semibold text-slate-700 mb-1">আপনার নাম *</label>
									<Input name="author" placeholder="যেমন: রাশেদ করিম" required class="bg-white rounded-xl text-xs" />
								</div>
								<div>
									<label class="block text-xs font-semibold text-slate-700 mb-1">শিরোনাম (ঐচ্ছিক)</label>
									<Input name="title" placeholder="যেমন: দারুণ পণ্য ও ফাস্ট ডেলিভারি" class="bg-white rounded-xl text-xs" />
								</div>
							</div>

							<div>
								<label class="block text-xs font-semibold text-slate-700 mb-1">আপনার মতামত ও অভিজ্ঞতা *</label>
								<Textarea
									name="content"
									rows={3}
									placeholder="পণ্যের গুণগত মান ও আপনার অভিজ্ঞতা সম্পর্কে বিস্তারিত লিখুন..."
									required
									class="bg-white rounded-xl text-xs resize-none"
								/>
							</div>

							<div class="flex justify-end gap-2 pt-1">
								<Button
									type="button"
									variant="ghost"
									onclick={() => (isWritingReview = false)}
									class="text-xs h-auto py-2"
								>
									বাতিল
								</Button>
								<Button
									type="submit"
									disabled={isSubmitting}
									class="bg-[#5845eb] hover:bg-[#4936d6] text-white text-xs h-auto py-2 px-5 rounded-xl font-bold gap-1.5"
								>
									<Send class="w-3.5 h-3.5" />
									<span>{isSubmitting ? 'পাঠানো হচ্ছে...' : 'রিভিউ প্রকাশ করুন'}</span>
								</Button>
							</div>
						</form>
					{/if}

					<!-- Customer Review List -->
					<div class="space-y-3 pt-2">
						{#if reviews.length > 0}
							{#each reviews as rev}
								<div class="p-4 rounded-xl border border-slate-100 bg-white shadow-2xs space-y-2">
									<div class="flex items-center justify-between">
										<div class="flex items-center gap-2">
											<div class="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-[#5845eb] font-bold text-xs flex items-center justify-center">
												{rev.name ? rev.name.charAt(0) : 'U'}
											</div>
											<div>
												<div class="flex items-center gap-1.5">
													<span class="text-xs font-bold text-slate-800 block">{rev.name}</span>
													{#if rev.verified}
														<span class="inline-flex items-center gap-0.5 text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.2 rounded-full font-bold">
															<CheckCircle2 class="w-2.5 h-2.5" /> ভেরিফাইড
														</span>
													{/if}
												</div>
												<span class="text-[10px] text-slate-400">{rev.city || 'ক্রেতা'} • {rev.date}</span>
											</div>
										</div>
										<div class="flex text-amber-400 gap-0.5">
											{#each Array(rev.rating || 5) as _}
												<Star class="w-3 h-3 fill-amber-400 text-amber-400" />
											{/each}
										</div>
									</div>
									{#if rev.title}
										<div class="text-xs font-bold text-slate-800">{rev.title}</div>
									{/if}
									<p class="text-xs text-slate-600 leading-relaxed">
										"{rev.comment}"
									</p>
								</div>
							{/each}
						{:else}
							<div class="text-center py-10 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
								<MessageSquare class="w-8 h-8 text-slate-300 mx-auto" />
								<p class="text-sm font-bold text-slate-700">এই পণ্যে এখনও কোনো রিভিউ দেওয়া হয়নি</p>
								<p class="text-xs text-slate-500 max-w-sm mx-auto">
									আপনি কি পণ্যটি কিনেছেন? আপনার মূল্যবান অভিজ্ঞতা জানিয়ে প্রথম রিভিউটি আপনি দিন।
								</p>
								<Button
									type="button"
									variant="outline"
									onclick={() => (isWritingReview = true)}
									class="text-xs font-bold mt-2 rounded-xl border-slate-300"
								>
									প্রথম রিভিউ দিন
								</Button>
							</div>
						{/if}
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
