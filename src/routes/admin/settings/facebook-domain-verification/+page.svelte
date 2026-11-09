<script lang="ts">
	import { Button } from '#lib/components/ui/button';
	import { ArrowLeft, Save, Headphones, Loader2, ExternalLink, LayoutList } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	let { data }: { data: any } = $props();

	let facebookDomainToken = $state(data?.facebookDomainToken ?? '');
	let isSaving = $state(false);

	$effect(() => {
		if (data?.facebookDomainToken !== undefined) {
			facebookDomainToken = data.facebookDomainToken ?? '';
		}
	});
</script>

<svelte:head>
	<title>Facebook Domain Verification - Settings - AURA Admin</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8 space-y-7 max-w-5xl mx-auto font-['Anek_Bangla',sans-serif]">
	<!-- Top Sub-Header Bar -->
	<div class="flex items-center justify-between gap-4 pb-2">
		<div>
			<h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Facebook Domain Verification</h1>
		</div>

		<div class="flex items-center gap-2">
			<a
				href="https://wa.me/880156007230"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#5845eb] hover:bg-[#4936d6] text-white text-xs font-bold shadow-xs transition-colors"
			>
				<Headphones class="w-3.5 h-3.5" />
				<span>header.support</span>
			</a>
		</div>
	</div>

	<!-- Back to Settings Button -->
	<div>
		<a
			href="/admin/settings"
			class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-all"
		>
			<ArrowLeft class="w-4 h-4 text-slate-500" />
			<span>Back to Settings</span>
		</a>
	</div>

	<!-- Section Header -->
	<div class="space-y-0.5">
		<h2 class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
			ডোমেইন ভেরিফিকেশন সেটআপ
		</h2>
		<p class="text-xs text-slate-500">
			Meta Business Manager থেকে আপনার ডোমেইন ভেরিফাই করুন
		</p>
	</div>

	<!-- Main Form -->
	<form
		method="POST"
		action="?/saveToken"
		use:enhance={() => {
			isSaving = true;
			return async ({ result, update }) => {
				isSaving = false;
				if (result.type === 'success') {
					toast.success('Facebook Domain Verification Token সফলভাবে সংরক্ষিত হয়েছে');
				} else {
					toast.error('সংরক্ষণ ব্যর্থ হয়েছে');
				}
				await update();
			};
		}}
		class="space-y-6 max-w-2xl"
	>
		<!-- CARD 1: Token Input -->
		<div class="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-5">
			<!-- Header with Facebook icon -->
			<div class="flex items-start gap-3.5">
				<div class="w-9 h-9 rounded-full bg-[#1877f2] flex items-center justify-center text-white shrink-0 shadow-xs">
					<svg class="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
						<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
					</svg>
				</div>
				<div>
					<h3 class="text-xs sm:text-sm font-bold text-slate-900">
						Domain Verification Token
					</h3>
					<p class="text-[11px] sm:text-xs text-slate-500 mt-0.5">
						Meta Business Manager → Brand Safety → Domains থেকে verification token কপি করে পেস্ট করুন
					</p>
				</div>
			</div>

			<!-- Floating Label Outlined Input Box -->
			<div class="space-y-1">
				<div class="relative rounded-xl border border-slate-300 hover:border-slate-400 focus-within:border-[#1877f2] focus-within:ring-2 focus-within:ring-[#1877f2]/10 bg-white transition-all">
					<span class="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-bold text-slate-500 select-none">
						Verification Token
					</span>
					<input
						type="text"
						name="facebookDomainToken"
						bind:value={facebookDomainToken}
						placeholder="plv96s2j2iycf9vg2f5jswtx72mm58"
						class="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-transparent rounded-xl focus:outline-none font-mono"
					/>
				</div>
				<p class="text-[10px] text-slate-400 pl-1">
					শুধু content="" এর ভেতরের value পেস্ট করুন, পুরো meta-tag নয়। পুরো tag পেস্ট করলেও আমরা অটো এক্সট্র্যাক্ট করে নেব।
				</p>
			</div>

			<!-- Save Button -->
			<div>
				<Button
					type="submit"
					disabled={isSaving}
					class="w-full bg-[#1877f2] hover:bg-[#1565c0] text-white font-bold h-10 px-5 rounded-xl shadow-xs text-xs gap-2 cursor-pointer transition-all inline-flex items-center justify-center"
				>
					{#if isSaving}
						<Loader2 class="w-4 h-4 animate-spin" />
						<span>সংরক্ষণ হচ্ছে...</span>
					{:else}
						<Save class="w-4 h-4" />
						<span>সংরক্ষণ করুন</span>
					{/if}
				</Button>
			</div>
		</div>

		<!-- CARD 2: Setup Guide -->
		<div class="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-4">
			<div class="flex items-center gap-2">
				<div class="w-5 h-5 rounded flex items-center justify-center text-[#1877f2]">
					<LayoutList class="w-4 h-4" />
				</div>
				<h3 class="text-xs font-bold text-slate-900">
					কীভাবে ডোমেইন ভেরিফাই করবেন
				</h3>
			</div>

			<!-- Step 1 -->
			<div class="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 space-y-1 transition-colors hover:bg-slate-50">
				<div class="text-xs font-bold text-[#1877f2]">
					ধাপ ১: Meta Business Manager এ যান
				</div>
				<p class="text-xs text-slate-600">
					Business Settings → Brand Safety → Domains এ গিয়ে আপনার ডোমেইন যোগ করুন।
				</p>
				<div>
					<a
						href="https://business.facebook.com/settings/owned-domains"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1 text-xs font-bold text-[#1877f2] hover:underline pt-0.5"
					>
						<span>Meta Business Manager</span>
						<ExternalLink class="w-3.5 h-3.5" />
					</a>
				</div>
			</div>

			<!-- Step 2 -->
			<div class="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 space-y-1 transition-colors hover:bg-slate-50">
				<div class="text-xs font-bold text-[#1877f2]">
					ধাপ ২: Verification Token কপি করুন
				</div>
				<p class="text-xs text-slate-600">
					"Meta-tag Verification" অপশন সিলেক্ট করুন। Meta আপনাকে একটি meta tag দেবে — শুধু content="" এর ভেতরের token কপি করুন।
				</p>
			</div>

			<!-- Step 3 -->
			<div class="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 space-y-1 transition-colors hover:bg-slate-50">
				<div class="text-xs font-bold text-[#1877f2]">
					ধাপ ৩: উপরের ফিল্ডে পেস্ট করে সেভ করুন
				</div>
				<p class="text-xs text-slate-600">
					Token পেস্ট করে সেভ করার পর ২-৩ মিনিট অপেক্ষা করুন (ডিপ্লয় হতে)। তারপর Meta Business Manager এ গিয়ে "Verify" বাটনে ক্লিক করুন।
				</p>
			</div>
		</div>
	</form>
</div>
