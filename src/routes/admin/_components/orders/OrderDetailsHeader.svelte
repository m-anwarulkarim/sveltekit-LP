<script lang="ts">
	import { Button, Badge } from '#lib/components/ui';
	import {
		ArrowLeft,
		CheckCircle2,
		Printer,
		Truck,
		Trash2,
		Clock,
		AlertTriangle,
		Save
	} from 'lucide-svelte';

	interface Props {
		orderId: string;
		orderNumber?: string;
		status: string;
		title?: string;
		isNewOrder?: boolean;
		createdAt?: any;
		isSaving?: boolean;
		onStatusChange: (newStatus: string) => void;
		onConfirm: () => void;
		onCancel: () => void;
		onSave: () => void;
		onPrint: () => void;
		onSendToCourier: () => void;
	}

	let {
		orderId,
		orderNumber,
		status = $bindable(),
		title,
		isNewOrder = false,
		createdAt,
		isSaving = false,
		onStatusChange,
		onConfirm,
		onCancel,
		onSave,
		onPrint,
		onSendToCourier
	}: Props = $props();

	const STATUS_CONFIG: Record<string, { label: string; color: string; badgeVariant: any }> = {
		pending: { label: 'পেন্ডিং', color: 'text-amber-700 bg-amber-50 border-amber-200', badgeVariant: 'warning' },
		incomplete: { label: 'ইনকমপ্লিট', color: 'text-orange-700 bg-orange-50 border-orange-200', badgeVariant: 'outline' },
		no_response: { label: 'নো রেসপন্স', color: 'text-slate-700 bg-slate-100 border-slate-200', badgeVariant: 'outline' },
		good_no_response: { label: 'গুড বাট নো রেসপন্স', color: 'text-sky-700 bg-sky-50 border-sky-200', badgeVariant: 'secondary' },
		busy: { label: 'বিজি', color: 'text-purple-700 bg-purple-50 border-purple-200', badgeVariant: 'purple' },
		hold: { label: 'হোল্ড', color: 'text-indigo-700 bg-indigo-50 border-indigo-200', badgeVariant: 'purple' },
		recall: { label: 'রি-কল', color: 'text-yellow-700 bg-yellow-50 border-yellow-200', badgeVariant: 'warning' },
		processing: { label: 'প্রসেসিং', color: 'text-blue-700 bg-blue-50 border-blue-200', badgeVariant: 'primary' },
		confirmed: { label: 'কনফার্মড', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', badgeVariant: 'success' },
		shipped: { label: 'শিপড / ট্রানজিট', color: 'text-cyan-700 bg-cyan-50 border-cyan-200', badgeVariant: 'primary' },
		delivered: { label: 'ডেলিভারড', color: 'text-emerald-800 bg-emerald-100 border-emerald-300', badgeVariant: 'success' },
		cancelled: { label: 'বাতিল', color: 'text-rose-700 bg-rose-50 border-rose-200', badgeVariant: 'destructive' }
	};

	let currentConfig = $derived(STATUS_CONFIG[status] || { label: status, color: 'text-slate-700 bg-slate-50 border-slate-200', badgeVariant: 'outline' });

	function formatTimeAgo(dateInput: any) {
		if (!dateInput) return '১০ মিনিট আগে';
		try {
			const d = new Date(dateInput);
			const diffMins = Math.floor((Date.now() - d.getTime()) / (1000 * 60));
			if (diffMins < 1) return 'এইমাত্র';
			if (diffMins < 60) return `${diffMins} মিনিট আগে`;
			const diffHours = Math.floor(diffMins / 60);
			if (diffHours < 24) return `${diffHours} ঘণ্টা আগে`;
			return d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' });
		} catch {
			return 'কিছুক্ষণ আগে';
		}
	}
</script>

<div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-200/80">
	<!-- Left Side: Back Navigation & Order Meta -->
	<div class="flex flex-wrap items-center gap-3">
		<Button
			variant="outline"
			size="sm"
			href="/admin/orders"
			class="h-9 gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#5845eb] hover:bg-indigo-50/50 border-slate-200 shadow-2xs"
		>
			<ArrowLeft class="w-4 h-4" />
			<span>অর্ডার্স তালিকা</span>
		</Button>

		<div class="h-5 w-px bg-slate-200 hidden sm:block"></div>

		<!-- Order Title & Status -->
		<div class="flex items-center gap-2.5">
			<h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono">
				{#if title}
					{title} <span class="text-[#5845eb]">#{orderNumber || orderId.slice(0, 8)}</span>
				{:else if isNewOrder}
					New Order: <span class="text-[#5845eb]">#{orderNumber || orderId.slice(0, 8)}</span>
				{:else}
					Order: <span class="text-[#5845eb]">#{orderNumber || orderId.slice(0, 8)}</span>
				{/if}
			</h1>

			<!-- Status Selector Dropdown -->
			<div class="relative inline-flex items-center">
				<select
					bind:value={status}
					onchange={(e) => onStatusChange((e.target as HTMLSelectElement).value)}
					class="text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer shadow-2xs {currentConfig.color} focus:outline-none focus:ring-2 focus:ring-[#5845eb]/30"
				>
					<option value="pending">পেন্ডিং (Pending)</option>
					<option value="incomplete">ইনকমপ্লিট (Incomplete)</option>
					<option value="no_response">নো রেসপন্স (No Response)</option>
					<option value="good_no_response">গুড বাট নো রেসপন্স</option>
					<option value="busy">বিজি (Busy)</option>
					<option value="hold">হোল্ড (Hold)</option>
					<option value="recall">রি-কল (Recall)</option>
					<option value="processing">প্রসেসিং (Processing)</option>
					<option value="confirmed">কনফার্মড (Confirmed)</option>
					<option value="shipped">শিপড (Shipped)</option>
					<option value="delivered">ডেলিভারড (Delivered)</option>
					<option value="cancelled">বাতিল (Cancelled)</option>
				</select>
			</div>

			<!-- Time Ago / Status Badge -->
			<span class="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/60">
				<Clock class="w-3 h-3 text-slate-400" />
				<span>{isNewOrder ? 'নতুন খসড়া (Draft)' : formatTimeAgo(createdAt)}</span>
			</span>
		</div>
	</div>

	<!-- Right Side: Action Suite -->
	<div class="flex flex-wrap items-center gap-2">
		<!-- Save Changes Button -->
		<Button
			type="button"
			variant="outline"
			size="sm"
			onclick={onSave}
			disabled={isSaving}
			class="h-9 gap-1.5 text-xs font-bold border-indigo-200 text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100 shadow-2xs"
		>
			<Save class="w-3.5 h-3.5" />
			<span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : (isNewOrder ? 'অর্ডার তৈরি করুন' : 'সেভ করুন')}</span>
		</Button>

		<!-- Print Invoice Button (only on existing orders) -->
		{#if !isNewOrder}
			<Button
				type="button"
				variant="outline"
				size="sm"
				onclick={onPrint}
				class="h-9 gap-1.5 text-xs font-bold border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-2xs"
				title="চালান / ইনভয়েস প্রিন্ট"
			>
				<Printer class="w-3.5 h-3.5" />
				<span class="hidden sm:inline">চালান প্রিন্ট</span>
			</Button>
		{/if}

		<!-- Send to Courier Button (only on existing orders) -->
		{#if !isNewOrder}
			<Button
				type="button"
				variant="outline"
				size="sm"
				onclick={onSendToCourier}
				class="h-9 gap-1.5 text-xs font-bold border-blue-200 text-blue-700 hover:bg-blue-50 shadow-2xs"
				title="Steadfast বা Pathao কুরিয়ারে এন্ট্রি"
			>
				<Truck class="w-3.5 h-3.5" />
				<span>কুরিয়ার এন্ট্রি</span>
			</Button>
		{/if}

		<!-- Quick Confirm Button -->
		{#if status !== 'confirmed'}
			<Button
				type="button"
				size="sm"
				onclick={onConfirm}
				class="h-9 gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
			>
				<CheckCircle2 class="w-3.5 h-3.5" />
				<span>{isNewOrder ? 'অর্ডার তৈরি ও কনফার্ম' : 'কনফার্ম অর্ডার'}</span>
			</Button>
		{/if}

		<!-- Cancel / Back Button -->
		<Button
			type="button"
			variant="ghost"
			size="sm"
			onclick={onCancel}
			class="h-9 gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50"
			title={isNewOrder ? 'বাতিল করে ফিরে যান' : 'অর্ডারটি বাতিল করুন'}
		>
			<Trash2 class="w-3.5 h-3.5" />
			<span class="hidden sm:inline">{isNewOrder ? 'বাতিল' : 'বাতিল'}</span>
		</Button>
	</div>
</div>

