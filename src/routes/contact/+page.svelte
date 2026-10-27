<script lang="ts">
	import { StoreLayout } from '#lib';
	import { Button, Input, Textarea, Card, CardContent, Badge, Alert, AlertDescription } from '#lib/components/ui';
	import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, MessageSquare } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let name = $state('');
	let phone = $state('');
	let email = $state('');
	let message = $state('');
	let isSubmitted = $state(false);

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!name || !phone || !message) return;
		isSubmitted = true;
	}
</script>

<svelte:head>
	<title>যোগাযোগ করুন (Contact Us) | AURA</title>
</svelte:head>

<StoreLayout user={data.user}>
	<div class="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-16 space-y-10 font-['Hind_Siliguri',sans-serif]">
		
		<!-- Header -->
		<div class="text-center space-y-2 max-w-2xl mx-auto">
			<Badge variant="outline" class="bg-indigo-50 text-[#5845eb] border-indigo-200">
				Customer Support
			</Badge>
			<h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
				আমাদের সাথে যোগাযোগ করুন (Contact Us)
			</h1>
			<p class="text-xs sm:text-sm text-slate-500">
				বীজ নির্বাচন, অর্ডার সংক্রান্ত প্রশ্ন বা পরামর্শের জন্য আমাদের কাস্টমার কেয়ার প্রতিনিধির সাথে সরাসরি কথা বলুন।
			</p>
		</div>

		<!-- Grid: Left Info & Right Form -->
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
			
			<!-- Left Column: Contact Cards -->
			<div class="lg:col-span-5 space-y-4">
				<!-- Hotline Card -->
				<Card class="border-slate-200/90 shadow-2xs">
					<CardContent class="p-5 flex items-start gap-4">
						<div class="w-10 h-10 rounded-2xl bg-indigo-50 text-[#5845eb] flex items-center justify-center shrink-0 border border-indigo-100">
							<Phone class="w-5 h-5" />
						</div>
						<div class="space-y-1">
							<span class="text-xs font-semibold text-slate-500">কাস্টমার কেয়ার হটলাইন</span>
							<h3 class="text-base font-black text-slate-900">09678 123 456</h3>
							<p class="text-xs text-slate-500 flex items-center gap-1">
								<Clock class="w-3.5 h-3.5 text-slate-400" />
								সকাল ৯:০০টা - রাত ১১:০০টা (প্রতিদিন খোলা)
							</p>
						</div>
					</CardContent>
				</Card>

				<!-- Email Card -->
				<Card class="border-slate-200/90 shadow-2xs">
					<CardContent class="p-5 flex items-start gap-4">
						<div class="w-10 h-10 rounded-2xl bg-indigo-50 text-[#5845eb] flex items-center justify-center shrink-0 border border-indigo-100">
							<Mail class="w-5 h-5" />
						</div>
						<div class="space-y-1">
							<span class="text-xs font-semibold text-slate-500">ইমেইল সাপোর্ট</span>
							<h3 class="text-base font-bold text-slate-900">support@seedshop.com.bd</h3>
							<p class="text-xs text-slate-500">যেকোনো প্রশ্ন বা ব্যবসায়িক অনুসন্ধানে লিখুন</p>
						</div>
					</CardContent>
				</Card>

				<!-- Address Card -->
				<Card class="border-slate-200/90 shadow-2xs">
					<CardContent class="p-5 flex items-start gap-4">
						<div class="w-10 h-10 rounded-2xl bg-indigo-50 text-[#5845eb] flex items-center justify-center shrink-0 border border-indigo-100">
							<MapPin class="w-5 h-5" />
						</div>
						<div class="space-y-1">
							<span class="text-xs font-semibold text-slate-500">প্রধান কার্যালয়</span>
							<h3 class="text-sm font-bold text-slate-900">AURA Head Office</h3>
							<p class="text-xs text-slate-600 leading-relaxed">
								হাউজ-২৩, রোড-১২, ধানমন্ডি, ঢাকা-১২০৯, বাংলাদেশ
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<!-- Right Column: Interactive Message Form -->
			<div class="lg:col-span-7">
				<Card class="border-slate-200/90 shadow-xs">
					<CardContent class="p-6 sm:p-8 space-y-5">
						<div class="flex items-center gap-2 pb-3 border-b border-slate-100">
							<MessageSquare class="w-5 h-5 text-[#5845eb]" />
							<div>
								<h2 class="text-lg font-black text-slate-900">আমাদের মেসেজ পাঠান</h2>
								<p class="text-xs text-slate-500">ফর্মটি পূরণ করুন, আমরা দ্রুতই আপনার সাথে যোগাযোগ করব।</p>
							</div>
						</div>

						{#if isSubmitted}
							<Alert class="bg-emerald-50 border-emerald-200 text-emerald-800 p-5">
								<CheckCircle2 class="w-5 h-5 text-emerald-600" />
								<AlertDescription class="font-bold text-sm">
									ধন্যবাদ {name}! আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে। আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন।
								</AlertDescription>
							</Alert>
						{:else}
							<form onsubmit={handleSubmit} class="space-y-4">
								<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div class="space-y-1.5">
										<label for="contact-name" class="text-xs font-bold text-slate-700">আপনার পুরো নাম *</label>
										<Input
											id="contact-name"
											bind:value={name}
											required
											placeholder="যেমন: আব্দুর রহমান"
											class="rounded-xl h-11 text-xs"
										/>
									</div>
									<div class="space-y-1.5">
										<label for="contact-phone" class="text-xs font-bold text-slate-700">মোবাইল নম্বর *</label>
										<Input
											id="contact-phone"
											bind:value={phone}
											required
											placeholder="যেমন: 01712-345678"
											class="rounded-xl h-11 text-xs"
										/>
									</div>
								</div>

								<div class="space-y-1.5">
									<label for="contact-email" class="text-xs font-bold text-slate-700">ইমেইল এড্রেস (ঐচ্ছিক)</label>
									<Input
										id="contact-email"
										type="email"
										bind:value={email}
										placeholder="যেমন: example@gmail.com"
										class="rounded-xl h-11 text-xs"
									/>
								</div>

								<div class="space-y-1.5">
									<label for="contact-msg" class="text-xs font-bold text-slate-700">আপনার প্রশ্ন বা মতামত *</label>
									<Textarea
										id="contact-msg"
										bind:value={message}
										required
										rows={4}
										placeholder="আপনার মতামত বিস্তারিত লিখুন..."
										class="rounded-xl text-xs"
									/>
								</div>

								<Button
									type="submit"
									class="w-full bg-[#5845eb] hover:bg-[#4936d6] text-white rounded-xl h-11 font-bold gap-2 shadow-sm shadow-indigo-600/30 cursor-pointer"
								>
									<Send class="w-4 h-4" />
									<span>বার্তা পাঠান</span>
								</Button>
							</form>
						{/if}
					</CardContent>
				</Card>
			</div>

		</div>

	</div>
</StoreLayout>
