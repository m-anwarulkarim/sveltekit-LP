<script lang="ts">
	import { Button, Badge } from '#lib/components/ui';
	import { ChevronDown, HelpCircle } from 'lucide-svelte';

	interface FAQItem {
		q: string;
		a: string;
	}

	const faqs: FAQItem[] = [
		{
			q: 'ডেলিভারি পেতে কতদিন সময় লাগবে?',
			a: 'ঢাকা সিটির ভেতরে অর্ডার কনফার্মের ১২ থেকে ২৪ ঘণ্টার মধ্যে এবং ঢাকা সিটির বাইরে দেশের যেকোনো প্রান্তে ২৪ থেকে ৪৮ ঘণ্টার মধ্যে বিশ্বস্ত কুরিয়ার সার্ভিসের মাধ্যমে হোম ডেলিভারি পৌঁছে দেওয়া হয়।'
		},
		{
			q: 'আমি কি ক্যাশ অন ডেলিভারিতে (COD) পণ্য চেক করে নিতে পারব?',
			a: 'হ্যাঁ, আমাদের প্রতিটি অর্ডারে ক্যাশ অন ডেলিভারি সুবিধা রয়েছে। ডেলিভারি ম্যানের উপস্থিতিতে পার্সেল চেক করে নিশ্চিন্তে মূল্য পরিশোধ করতে পারবেন।'
		},
		{
			q: 'পণ্য পছন্দ না হলে বা ত্রুটি থাকলে রিটার্ন করার নিয়ম কী?',
			a: 'পণ্য হাতে পাওয়ার ৭ দিনের মধ্যে যদি কোনো ত্রুটি বা অমিল দেখা দেয়, তবে কোনো প্রকার বাড়তি খরচ ছাড়াই দ্রুততম সময়ে ফুল রিফান্ড অথবা ফ্রি রিপ্লেসমেন্ট সুবিধা পাবেন।'
		},
		{
			q: 'অর্ডার করার পর পার্সেল ট্র্যাক করব কীভাবে?',
			a: 'অর্ডার সম্পন্ন হওয়ার পর প্রাপ্ত অর্ডার নম্বর (যেমন: #1001) অথবা আপনার অর্ডারকৃত মোবাইল নম্বর দিয়ে আমাদের "অর্ডার ট্র্যাক" পেজে সার্চ করলেই পার্সেলের বর্তমান অবস্থান ও কুরিয়ার ট্র্যাকিং কোড পেয়ে যাবেন।'
		},
		{
			q: 'আপনাদের পণ্যগুলো কি ১০০% অরিজিনাল?',
			a: 'হ্যাঁ, AURA স্টোরের প্রতিটি পণ্য শতভাগ আসল এবং সর্বোচ্চ কোয়ালিটি যাচাইকৃত। গ্রাহকের সন্তুষ্টি ও নির্ভরতাই আমাদের প্রধান অগ্রাধিকার।'
		}
	];

	let openIndex = $state<number | null>(0);

	function toggle(index: number) {
		openIndex = openIndex === index ? null : index;
	}
</script>

<section id="faq" class="py-24 relative">
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
		
		<div class="text-center mb-16">
			<Badge variant="outline" class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border-violet-500/20 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-4">
				<HelpCircle class="w-3.5 h-3.5" />
				প্রয়োজনীয় প্রশ্নোত্তর
			</Badge>
			<h2 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
				সাধারণ জিজ্ঞাসা ও সমাধান (FAQ)
			</h2>
		</div>

		<div class="space-y-4">
			{#each faqs as faq, i}
				<div class="glass-card rounded-2xl border border-white/10 overflow-hidden transition-all duration-300">
					<Button
						variant="ghost"
						onclick={() => toggle(i)}
						class="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 h-auto hover:bg-white/5 rounded-none font-normal cursor-pointer"
						aria-expanded={openIndex === i}
					>
						<span class="text-sm sm:text-base font-bold text-white font-heading">{faq.q}</span>
						<ChevronDown class="w-5 h-5 text-cyan-400 shrink-0 transition-transform duration-300 {openIndex === i ? 'rotate-180' : ''}" />
					</Button>

					{#if openIndex === i}
						<div class="px-5 pb-6 sm:px-6 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-4 animate-in fade-in">
							{faq.a}
						</div>
					{/if}
				</div>
			{/each}
		</div>

	</div>
</section>