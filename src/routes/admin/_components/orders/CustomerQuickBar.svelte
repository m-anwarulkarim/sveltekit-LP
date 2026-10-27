<script lang="ts">
	import { Card, Input, Button } from '#lib/components/ui';
	import {
		User,
		Phone,
		MapPin,
		PhoneCall,
		MessageSquare,
		Copy,
		Check,
		Plus,
		X
	} from 'lucide-svelte';

	interface Props {
		orderId: string;
		customerName: string;
		customerPhone: string;
		altPhone?: string;
		shippingAddress: string;
		onShowToast: (msg: string) => void;
	}

	let {
		orderId,
		customerName = $bindable(),
		customerPhone = $bindable(),
		altPhone = $bindable(''),
		shippingAddress = $bindable(),
		onShowToast
	}: Props = $props();

	let showAltPhone = $state(!!altPhone);
	let copiedPhone = $state(false);
	let copiedAddress = $state(false);

	function cleanPhoneNumber(phone: string) {
		const digits = (phone || '').replace(/\D/g, '');
		if (digits.startsWith('880')) return digits;
		if (digits.startsWith('0')) return '88' + digits;
		return '880' + digits;
	}

	function handleCopy(text: string, type: 'phone' | 'address') {
		if (!text) return;
		navigator.clipboard?.writeText(text);
		if (type === 'phone') {
			copiedPhone = true;
			setTimeout(() => (copiedPhone = false), 2000);
			onShowToast('ফোন নম্বর কপি করা হয়েছে!');
		} else {
			copiedAddress = true;
			setTimeout(() => (copiedAddress = false), 2000);
			onShowToast('ডেলিভারি ঠিকানা কপি করা হয়েছে!');
		}
	}

	let whatsappUrl = $derived.by(() => {
		const formattedPhone = cleanPhoneNumber(customerPhone);
		const message = encodeURIComponent(
			`আসসালামু আলাইকুম ${customerName || 'গ্রাহক'}, আমরা আপনার AURA অর্ডার (#${orderId}) সংক্রান্ত বিষয়ে যোগাযোগ করছি। আপনার ডেলিভারি কনফার্মেশনের জন্য দয়া করে রিপ্লাই করুন। ধন্যবাদ!`
		);
		return `https://wa.me/${formattedPhone}?text=${message}`;
	});
</script>

<Card class="p-4 bg-white/90 shadow-xs border-slate-200/90">
	<div class="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">
		
		<!-- 1. Customer Name (4 cols) -->
		<div class="md:col-span-3 space-y-1.5">
			<label for="cust-name" class="flex items-center gap-1.5 text-xs font-bold text-slate-700">
				<User class="w-3.5 h-3.5 text-slate-400" />
				<span>কাস্টমার নাম <span class="text-rose-500">*</span></span>
			</label>
			<div class="relative">
				<Input
					id="cust-name"
					type="text"
					bind:value={customerName}
					placeholder="কাস্টমারের নাম লিখুন"
					class="h-10 text-xs font-semibold focus:border-[#5845eb]"
				/>
			</div>
		</div>

		<!-- 2. Customer Phone & Quick Comms (4 cols) -->
		<div class="md:col-span-4 space-y-1.5">
			<div class="flex items-center justify-between">
				<label for="cust-phone" class="flex items-center gap-1.5 text-xs font-bold text-slate-700">
					<Phone class="w-3.5 h-3.5 text-slate-400" />
					<span>ফোন নম্বর <span class="text-rose-500">*</span></span>
				</label>
				{#if !showAltPhone}
					<button
						type="button"
						onclick={() => (showAltPhone = true)}
						class="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer"
					>
						<Plus class="w-3 h-3" />
						<span>বিকল্প নম্বর</span>
					</button>
				{/if}
			</div>

			<div class="flex items-center gap-1.5">
				<div class="relative flex-1">
					<Input
						id="cust-phone"
						type="tel"
						bind:value={customerPhone}
						placeholder="01XXXXXXXXX"
						class="h-10 text-xs font-mono font-bold focus:border-[#5845eb]"
					/>
				</div>

				<!-- Quick Call Action -->
				<a
					href="tel:{customerPhone}"
					class="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-200 transition-colors shadow-2xs"
					title="সরাসরি কল দিন"
				>
					<PhoneCall class="w-4 h-4" />
				</a>

				<!-- WhatsApp Action -->
				<a
					href={whatsappUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white border border-green-200 transition-colors shadow-2xs"
					title="WhatsApp-এ মেসেজ পাঠান"
				>
					<MessageSquare class="w-4 h-4" />
				</a>

				<!-- Copy Phone Action -->
				<button
					type="button"
					onclick={() => handleCopy(customerPhone, 'phone')}
					class="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-200 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
					title="নম্বর কপি করুন"
				>
					{#if copiedPhone}
						<Check class="w-4 h-4 text-emerald-600" />
					{:else}
						<Copy class="w-4 h-4" />
					{/if}
				</button>
			</div>

			<!-- Optional Alt Phone Input -->
			{#if showAltPhone}
				<div class="flex items-center gap-1.5 mt-2 animate-in fade-in duration-150">
					<Input
						type="tel"
						bind:value={altPhone}
						placeholder="বিকল্প ফোন নম্বর (01...)"
						class="h-8 text-xs font-mono"
					/>
					<button
						type="button"
						onclick={() => {
							altPhone = '';
							showAltPhone = false;
						}}
						class="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
						title="মুছে ফেলুন"
					>
						<X class="w-3.5 h-3.5" />
					</button>
				</div>
			{/if}
		</div>

		<!-- 3. Shipping Address (5 cols) -->
		<div class="md:col-span-5 space-y-1.5">
			<div class="flex items-center justify-between">
				<label for="cust-address" class="flex items-center gap-1.5 text-xs font-bold text-slate-700">
					<MapPin class="w-3.5 h-3.5 text-slate-400" />
					<span>ডেলিভারি ঠিকানা <span class="text-rose-500">*</span></span>
				</label>
				<button
					type="button"
					onclick={() => handleCopy(shippingAddress, 'address')}
					class="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
				>
					{#if copiedAddress}
						<Check class="w-3 h-3 text-emerald-600" />
						<span class="text-emerald-600">কপি হয়েছে</span>
					{:else}
						<Copy class="w-3 h-3" />
						<span>কপি</span>
					{/if}
				</button>
			</div>
			
			<div class="relative">
				<Input
					id="cust-address"
					type="text"
					bind:value={shippingAddress}
					placeholder="বাড়ি নং, রোড, থানা, জেলা লিখুন..."
					class="h-10 text-xs font-semibold focus:border-[#5845eb]"
				/>
			</div>
		</div>

	</div>
</Card>

