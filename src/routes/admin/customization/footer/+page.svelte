<script lang="ts">
	import {
		Button,
		Input,
		Textarea,
		Card,
		CardContent,
		Switch,
		Badge,
		Alert,
		AlertDescription
	} from '#lib/components/ui';
	import {
		Save,
		CheckCircle2,
		Flame,
		Phone,
		Mail,
		MapPin,
		Clock,
		Share2,
		Smartphone,
		CreditCard,
		Truck,
		Eye
	} from 'lucide-svelte';

	// Footer State
	let brandName = $state('AURA');
	let brandTagline = $state('Next-Gen E-Commerce');
	let aboutText = $state('AURA is a next-generation e-commerce platform offering premium lifestyle, audio, and home essentials delivered safely to your door.');
	let phoneHotline = $state('01602867954');
	let workingHours = $state('9:00 AM – 11:00 PM (Everyday)');
	let supportEmail = $state('support@aura-store.com');
	let officeAddress = $state('House-23, Road-12, Dhanmondi, Dhaka-1209, Bangladesh');

	// Social Links
	let facebookUrl = $state('https://facebook.com');
	let twitterUrl = $state('https://x.com');
	let youtubeUrl = $state('https://youtube.com');
	let instagramUrl = $state('https://instagram.com');

	// App Download Links
	let googlePlayUrl = $state('https://play.google.com');
	let appStoreUrl = $state('https://apple.com/app-store');

	// Payment Badges Toggles
	let acceptBkash = $state(true);
	let acceptNagad = $state(true);
	let acceptRocket = $state(true);
	let acceptVisa = $state(true);
	let acceptMastercard = $state(true);
	let acceptAmex = $state(true);

	// Delivery Partners Toggles
	let partnerPathao = $state(true);
	let partnerSteadfast = $state(true);
	let partnerRedx = $state(true);
	let partnerIex = $state(true);

	// Copyright & Credits
	let copyrightText = $state('© 2026 AURA Inc. All rights reserved.');
	let designerCredit = $state('Design by Borbila');

	let toastMessage = $state<string | null>(null);

	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => {
			toastMessage = null;
		}, 3000);
	}

	function handleSave() {
		showToast('ফুটার কাস্টমাইজেশন সফলভাবে সংরক্ষিত হয়েছে!');
	}
</script>

<svelte:head>
	<title>Footer Customization | Admin</title>
</svelte:head>

<div class="space-y-6 max-w-6xl mx-auto pb-16 font-['Anek_Bangla',sans-serif]">
	
	<!-- Header Banner -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
		<div>
			<div class="flex items-center gap-2 mb-1">
				<Badge variant="outline" class="bg-indigo-50 text-[#5845eb] border-indigo-200">
					Storefront Footer
				</Badge>
				<span class="text-xs text-slate-500 font-medium">Footer Info, Payments & Couriers</span>
			</div>
			<h1 class="text-2xl font-black text-slate-900 tracking-tight">
				ফুটার কাস্টমাইজেশন (Footer Customization)
			</h1>
			<p class="text-xs text-slate-500 mt-0.5">
				কাস্টমার সার্ভিস লিংক, পেমেন্ট পার্টনার লোগো, কুরিয়ার পার্টনার, অ্যাপ ডাউনলোড ও সোশাল লিংক নিয়ন্ত্রণ করুন।
			</p>
		</div>

		<Button
			onclick={handleSave}
			class="bg-[#5845eb] hover:bg-[#4936d6] text-white gap-2 shadow-sm shadow-indigo-600/30 rounded-xl px-5 h-11"
		>
			<Save class="w-4 h-4" />
			<span>পরিবর্তন সংরক্ষণ করুন</span>
		</Button>
	</div>

	<!-- Toast Message -->
	{#if toastMessage}
		<Alert class="bg-emerald-50 border-emerald-200 text-emerald-800 animate-in fade-in slide-in-from-top-2">
			<CheckCircle2 class="w-4 h-4 text-emerald-600" />
			<AlertDescription class="font-bold text-xs">
				{toastMessage}
			</AlertDescription>
		</Alert>
	{/if}

	<!-- Live Visual Preview of Footer -->
	<Card class="border-slate-200/90 shadow-2xs overflow-hidden">
		<div class="p-4 bg-slate-50 border-b border-slate-200/90 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<Eye class="w-4 h-4 text-[#5845eb]" />
				<span class="text-xs font-bold text-slate-800">লাইভ প্রিভিউ (Live Footer Preview)</span>
			</div>
			<span class="text-[11px] text-slate-500 font-medium">ডেস্কটপ ভিউ</span>
		</div>
		<CardContent class="p-0">
			<!-- Mini Mock Footer -->
			<div class="bg-white p-6 border-b border-slate-100 text-xs">
				<div class="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6">
					<!-- Col 1 -->
					<div class="space-y-2">
						<div class="flex items-center gap-2">
							<div class="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#5845eb] to-[#9333ea] flex items-center justify-center text-white">
								<Flame class="w-3.5 h-3.5" />
							</div>
							<span class="font-black text-sm text-slate-900">{brandName}</span>
						</div>
						<p class="text-[11px] text-slate-500 leading-relaxed line-clamp-3">{aboutText}</p>
						<div class="text-[11px] text-slate-600 space-y-1 pt-1 font-medium">
							<div>📞 {phoneHotline}</div>
							<div>✉️ {supportEmail}</div>
						</div>
					</div>

					<!-- Col 2 -->
					<div class="space-y-2">
						<h4 class="font-bold text-slate-900">Customer Service</h4>
						<div class="w-8 h-0.5 bg-[#5845eb] rounded-full"></div>
						<div class="space-y-1 text-slate-500 text-[11px]">
							<div>› Contact Us</div>
							<div>› Track Order</div>
							<div>› Return & Exchange</div>
							<div>› Privacy Policy</div>
						</div>
					</div>

					<!-- Col 3 -->
					<div class="space-y-2">
						<h4 class="font-bold text-slate-900">Useful Links</h4>
						<div class="w-8 h-0.5 bg-[#5845eb] rounded-full"></div>
						<div class="space-y-1 text-slate-500 text-[11px]">
							<div>› All Products</div>
							<div>› Combos Products</div>
							<div>› My Account</div>
							<div>› About Us</div>
						</div>
					</div>

					<!-- Col 4 -->
					<div class="space-y-2">
						<h4 class="font-bold text-slate-900">Follow Us</h4>
						<div class="flex items-center gap-2">
							<span class="w-6 h-6 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[10px] font-bold">f</span>
							<span class="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">X</span>
							<span class="w-6 h-6 rounded-full bg-[#FF0000] text-white flex items-center justify-center text-[10px] font-bold">▶</span>
						</div>
					</div>
				</div>

				<!-- Middle Strip -->
				<div class="py-3 px-4 bg-slate-50 rounded-xl flex items-center justify-between text-[11px]">
					<div class="flex items-center gap-2">
						<span class="font-bold text-slate-700">We Accept:</span>
						<span class="px-2 py-0.5 rounded bg-white border border-slate-200 text-[#E2136E] font-bold text-[10px]">bKash</span>
						<span class="px-2 py-0.5 rounded bg-white border border-slate-200 text-[#F7941D] font-bold text-[10px]">নগদ</span>
						<span class="px-2 py-0.5 rounded bg-white border border-slate-200 text-[#1A1F71] font-bold text-[10px]">VISA</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="font-bold text-slate-700">Delivery:</span>
						<span class="px-2 py-0.5 rounded bg-white border border-slate-200 text-[#E83431] font-bold text-[10px]">pathao</span>
						<span class="px-2 py-0.5 rounded bg-white border border-slate-200 text-[#F1592A] font-bold text-[10px]">Steadfast</span>
					</div>
				</div>

				<!-- Bottom Bar -->
				<div class="mt-3 bg-gradient-to-r from-[#4936d6] to-[#7c3aed] text-white p-2 rounded-lg flex items-center justify-between text-[10px]">
					<span>{copyrightText}</span>
					<span>{designerCredit}</span>
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- Settings Grid -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		
		<!-- 1. Contact & Company Info -->
		<Card class="border-slate-200/90 shadow-2xs">
			<CardContent class="p-6 space-y-4">
				<div class="flex items-center gap-2 pb-3 border-b border-slate-100">
					<Phone class="w-4 h-4 text-[#5845eb]" />
					<h3 class="text-base font-extrabold text-slate-900">যোগাযোগ ও অফিস তথ্য (Contact & Location)</h3>
				</div>

				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700" for="ft-desc">সংক্ষিপ্ত বিবরণ (About Short Text)</label>
					<Textarea id="ft-desc" bind:value={aboutText} rows={3} class="rounded-xl text-xs" />
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1.5">
						<label class="text-xs font-bold text-slate-700" for="ft-phone">হটলাইন নম্বর</label>
						<Input id="ft-phone" bind:value={phoneHotline} class="rounded-xl h-10 text-xs" />
					</div>
					<div class="space-y-1.5">
						<label class="text-xs font-bold text-slate-700" for="ft-email">সাপোর্ট ইমেইল</label>
						<Input id="ft-email" bind:value={supportEmail} class="rounded-xl h-10 text-xs" />
					</div>
				</div>

				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700" for="ft-hours">কর্মঘণ্টা (Support Hours)</label>
					<Input id="ft-hours" bind:value={workingHours} class="rounded-xl h-10 text-xs" />
				</div>

				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700" for="ft-addr">অফিসের ঠিকানা</label>
					<Input id="ft-addr" bind:value={officeAddress} class="rounded-xl h-10 text-xs" />
				</div>
			</CardContent>
		</Card>

		<!-- 2. Social Links & App Download -->
		<Card class="border-slate-200/90 shadow-2xs">
			<CardContent class="p-6 space-y-4">
				<div class="flex items-center gap-2 pb-3 border-b border-slate-100">
					<Share2 class="w-4 h-4 text-[#5845eb]" />
					<h3 class="text-base font-extrabold text-slate-900">সোশাল ও অ্যাপ ডাউনলোড লিংক (Social & App Links)</h3>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1.5">
						<label class="text-xs font-bold text-slate-700" for="soc-fb">Facebook URL</label>
						<Input id="soc-fb" bind:value={facebookUrl} class="rounded-xl h-10 text-xs" />
					</div>
					<div class="space-y-1.5">
						<label class="text-xs font-bold text-slate-700" for="soc-x">X / Twitter URL</label>
						<Input id="soc-x" bind:value={twitterUrl} class="rounded-xl h-10 text-xs" />
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1.5">
						<label class="text-xs font-bold text-slate-700" for="soc-yt">YouTube URL</label>
						<Input id="soc-yt" bind:value={youtubeUrl} class="rounded-xl h-10 text-xs" />
					</div>
					<div class="space-y-1.5">
						<label class="text-xs font-bold text-slate-700" for="soc-ig">Instagram URL</label>
						<Input id="soc-ig" bind:value={instagramUrl} class="rounded-xl h-10 text-xs" />
					</div>
				</div>

				<div class="pt-2 border-t border-slate-100 space-y-3">
					<div class="space-y-1.5">
						<label class="text-xs font-bold text-slate-700" for="app-gp">Google Play Store URL</label>
						<Input id="app-gp" bind:value={googlePlayUrl} class="rounded-xl h-10 text-xs" />
					</div>
					<div class="space-y-1.5">
						<label class="text-xs font-bold text-slate-700" for="app-as">Apple App Store URL</label>
						<Input id="app-as" bind:value={appStoreUrl} class="rounded-xl h-10 text-xs" />
					</div>
				</div>
			</CardContent>
		</Card>

		<!-- 3. Payment Methods & Delivery Partners -->
		<Card class="border-slate-200/90 shadow-2xs">
			<CardContent class="p-6 space-y-4">
				<div class="flex items-center gap-2 pb-3 border-b border-slate-100">
					<CreditCard class="w-4 h-4 text-[#5845eb]" />
					<h3 class="text-base font-extrabold text-slate-900">পেমেন্ট ও কুরিয়ার পার্টনার্স (Payment & Delivery)</h3>
				</div>

				<!-- Payments -->
				<div class="space-y-2">
					<span class="text-xs font-bold text-slate-700">অনুমোদিত পেমেন্ট গেটওয়ে (We Accept):</span>
					<div class="grid grid-cols-3 gap-2.5">
						<label class="flex items-center justify-between p-2 rounded-xl border border-slate-200 text-xs font-semibold">
							<span>bKash</span>
							<Switch bind:checked={acceptBkash} />
						</label>
						<label class="flex items-center justify-between p-2 rounded-xl border border-slate-200 text-xs font-semibold">
							<span>Nagad</span>
							<Switch bind:checked={acceptNagad} />
						</label>
						<label class="flex items-center justify-between p-2 rounded-xl border border-slate-200 text-xs font-semibold">
							<span>Rocket</span>
							<Switch bind:checked={acceptRocket} />
						</label>
						<label class="flex items-center justify-between p-2 rounded-xl border border-slate-200 text-xs font-semibold">
							<span>VISA</span>
							<Switch bind:checked={acceptVisa} />
						</label>
						<label class="flex items-center justify-between p-2 rounded-xl border border-slate-200 text-xs font-semibold">
							<span>Mastercard</span>
							<Switch bind:checked={acceptMastercard} />
						</label>
						<label class="flex items-center justify-between p-2 rounded-xl border border-slate-200 text-xs font-semibold">
							<span>AMEX</span>
							<Switch bind:checked={acceptAmex} />
						</label>
					</div>
				</div>

				<!-- Couriers -->
				<div class="space-y-2 pt-2 border-t border-slate-100">
					<span class="text-xs font-bold text-slate-700">ডেলিভারি পার্টনার্স (Delivery Partners):</span>
					<div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
						<label class="flex items-center justify-between p-2 rounded-xl border border-slate-200 text-xs font-semibold">
							<span>Pathao</span>
							<Switch bind:checked={partnerPathao} />
						</label>
						<label class="flex items-center justify-between p-2 rounded-xl border border-slate-200 text-xs font-semibold">
							<span>Steadfast</span>
							<Switch bind:checked={partnerSteadfast} />
						</label>
						<label class="flex items-center justify-between p-2 rounded-xl border border-slate-200 text-xs font-semibold">
							<span>REDX</span>
							<Switch bind:checked={partnerRedx} />
						</label>
						<label class="flex items-center justify-between p-2 rounded-xl border border-slate-200 text-xs font-semibold">
							<span>iEX</span>
							<Switch bind:checked={partnerIex} />
						</label>
					</div>
				</div>
			</CardContent>
		</Card>

		<!-- 4. Copyright & Credits -->
		<Card class="border-slate-200/90 shadow-2xs">
			<CardContent class="p-6 space-y-4">
				<div class="flex items-center gap-2 pb-3 border-b border-slate-100">
					<Flame class="w-4 h-4 text-[#5845eb]" />
					<h3 class="text-base font-extrabold text-slate-900">কপিরাইট ও ক্রেডিট (Copyright Bar)</h3>
				</div>

				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700" for="ft-cp">কপিরাইট টেক্সট</label>
					<Input id="ft-cp" bind:value={copyrightText} class="rounded-xl h-10 text-xs" />
				</div>

				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700" for="ft-des">ডিজাইনার ক্রেডিট / ইঞ্জিন</label>
					<Input id="ft-des" bind:value={designerCredit} class="rounded-xl h-10 text-xs" />
				</div>
			</CardContent>
		</Card>

	</div>
</div>
