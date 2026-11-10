<script lang="ts">
	import {
		PhoneCall,
		MessageCircle,
		ShieldCheck,
		RotateCcw,
		Truck,
		HelpCircle,
		ChevronDown
	} from 'lucide-svelte';

	let openFaq = $state<number | null>(0);

	function toggleFaq(index: number) {
		openFaq = openFaq === index ? null : index;
	}

	const FAQS = [
		{
			q: 'ডেলিভারি পেতে কতদিন সময় লাগে?',
			a: 'ঢাকা সিটির ভেতরে সাধারণত ২৪ থেকে ৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে ৩ থেকে ৫ কর্মদিবসের মধ্যে কুরিয়ারের মাধ্যমে ডেলিভারি সম্পন্ন হয়।'
		},
		{
			q: 'পণ্য অপছন্দ বা ক্ষতিগ্রস্ত হলে কীভাবে রিটার্ন করব?',
			a: 'ডেলিভারির সময় বা পণ্য পাওয়ার ৭ দিনের মধ্যে আমাদের কাস্টমার কেয়ারে কল করে অথবা হোয়াটসঅ্যাপে পণ্যের ছবি পাঠিয়ে সহজেই রিপ্লেসমেন্ট বা রিটার্ন করতে পারেন।'
		},
		{
			q: 'আমি কি ডেলিভারির সময় পণ্য দেখে টাকা দিতে পারব?',
			a: 'হ্যাঁ, আমাদের প্রতিটি অর্ডারে নিরাপদ ক্যাশ অন ডেলিভারি (COD) সুবিধা রয়েছে। আপনি কুরিয়ার রাইডারের সামনে পার্সেল দেখে তারপর মূল্য পরিশোধ করতে পারবেন।'
		},
		{
			q: 'অর্ডার ট্র্যাক করার নিয়ম কী?',
			a: 'আপনার একাউন্টের "আমার অর্ডারসমূহ" ট্যাব থেকে যেকোনো সময় আপনার পার্সেলের লাইভ ট্র্যাকিং স্ট্যাটাস ও কুরিয়ার ট্র্যাকিং লিঙ্ক দেখতে পাবেন।'
		}
	];
</script>

<div class="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
	<!-- Customer Care & Helpline Header -->
	<div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-4">
		<div class="flex items-center gap-3">
			<div class="w-10 h-10 rounded-2xl bg-indigo-50 text-[#5845eb] flex items-center justify-center shrink-0">
				<PhoneCall class="w-5 h-5 stroke-[2.2]" />
			</div>
			<div>
				<h2 class="text-base sm:text-lg font-black text-slate-900 tracking-tight">
					কাস্টমার সাপোর্ট ও পলিসি (Help & Policies)
				</h2>
				<p class="text-xs text-slate-500 font-medium">
					যেকোনো অর্ডার সংক্রান্ত জিজ্ঞাসা বা সহায়তায় আমাদের টিম সবসময় পাশে আছে
				</p>
			</div>
		</div>

		<!-- Direct Contact Channels -->
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
			<!-- Hotline Call -->
			<a
				href="tel:0156007230"
				class="p-5 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/80 hover:border-indigo-200 transition-all flex items-center gap-4 group cursor-pointer"
			>
				<div class="w-12 h-12 rounded-xl bg-white text-[#5845eb] shadow-2xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
					<PhoneCall class="w-6 h-6" />
				</div>
				<div>
					<div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">সরাসরি হটলাইন</div>
					<div class="text-base sm:text-lg font-black text-slate-900 font-mono mt-0.5">0156007230</div>
					<div class="text-[11px] text-emerald-600 font-medium mt-0.5">সকাল ৯টা - রাত ১০টা (সপ্তাহের ৭ দিন)</div>
				</div>
			</a>

			<!-- WhatsApp Chat -->
			<a
				href="https://wa.me/880156007230"
				target="_blank"
				rel="noopener noreferrer"
				class="p-5 rounded-2xl bg-emerald-50/60 hover:bg-emerald-100/60 border border-emerald-200 transition-all flex items-center gap-4 group cursor-pointer"
			>
				<div class="w-12 h-12 rounded-xl bg-white text-emerald-600 shadow-2xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
					<MessageCircle class="w-6 h-6" />
				</div>
				<div>
					<div class="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">হোয়াটসঅ্যাপ সাপোর্ট</div>
					<div class="text-base sm:text-lg font-black text-emerald-900 font-mono mt-0.5">WhatsApp Chat</div>
					<div class="text-[11px] text-emerald-700 font-medium mt-0.5">তাৎক্ষণিক মেসেজ ও ছবি পাঠান</div>
				</div>
			</a>
		</div>
	</div>

	<!-- Guarantee & Policy Highlights (Daraz Trust Badges) -->
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		<div class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs text-center space-y-2">
			<div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
				<RotateCcw class="w-5 h-5 stroke-[2.2]" />
			</div>
			<h4 class="text-xs font-bold text-slate-900">৭ দিনের সহজ রিটার্ন</h4>
			<p class="text-[11px] text-slate-500 leading-relaxed">
				কোনো ত্রুটি বা অমিল থাকলে কোনো রকম ঝামেলা ছাড়াই রিপ্লেসমেন্ট পাবেন।
			</p>
		</div>

		<div class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs text-center space-y-2">
			<div class="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
				<Truck class="w-5 h-5 stroke-[2.2]" />
			</div>
			<h4 class="text-xs font-bold text-slate-900">দ্রুত ও নিরাপদ ডেলিভারি</h4>
			<p class="text-[11px] text-slate-500 leading-relaxed">
				Steadfast ও Pathao কুরিয়ারের মাধ্যমে দেশজুড়ে দ্রুত হোম ডেলিভারি।
			</p>
		</div>

		<div class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs text-center space-y-2">
			<div class="w-10 h-10 rounded-2xl bg-indigo-50 text-[#5845eb] flex items-center justify-center mx-auto">
				<ShieldCheck class="w-5 h-5 stroke-[2.2]" />
			</div>
			<h4 class="text-xs font-bold text-slate-900">১০০% আসল বীজের নিশ্চয়তা</h4>
			<p class="text-[11px] text-slate-500 leading-relaxed">
				সর্বোচ্চ অঙ্কুরোদগম ক্ষমতাসম্পন্ন ও সঠিক জাতের প্রিমিয়াম বীজ।
			</p>
		</div>
	</div>

	<!-- FAQ Accordion -->
	<div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-4">
		<div class="flex items-center gap-2 pb-2 border-b border-slate-100">
			<HelpCircle class="w-4 h-4 text-[#5845eb]" />
			<h3 class="text-sm font-bold text-slate-900">সাধারণ কিছু জিজ্ঞাসা (FAQs)</h3>
		</div>

		<div class="divide-y divide-slate-100">
			{#each FAQS as faq, i}
				{@const isOpen = openFaq === i}
				<div class="py-3.5 first:pt-0 last:pb-0">
					<button
						type="button"
						onclick={() => toggleFaq(i)}
						class="w-full text-left flex items-center justify-between gap-3 text-xs font-bold text-slate-800 hover:text-[#5845eb] transition-colors cursor-pointer"
					>
						<span>{faq.q}</span>
						<ChevronDown class="w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 {isOpen ? 'rotate-180 text-[#5845eb]' : ''}" />
					</button>
					{#if isOpen}
						<p class="mt-2 text-xs text-slate-600 leading-relaxed animate-in fade-in duration-150 pl-1">
							{faq.a}
						</p>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>

