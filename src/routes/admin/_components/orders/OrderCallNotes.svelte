<script lang="ts">
	import { Card, Input, Button } from '#lib/components/ui';
	import {
		PhoneCall,
		Plus,
		Clock,
		Send,
		UserCheck,
		MessageSquareText
	} from 'lucide-svelte';

	export interface CallNote {
		id: string;
		note: string;
		author: string;
		time: string;
	}

	interface Props {
		notes: CallNote[];
		onAddNote: (noteText: string) => void;
	}

	let {
		notes = $bindable([]),
		onAddNote
	}: Props = $props();

	let newNoteText = $state('');

	const QUICK_REMARKS = [
		'কল রিসিভড & কনফার্ম',
		'ফোন বাজছে, ধরে নাই',
		'ফোন ব্যস্ত (Busy)',
		'ফোন বন্ধ পাওয়া গেছে',
		'শুক্রবার ডেলিভারি চায়'
	];

	function handleAdd() {
		if (!newNoteText.trim()) return;
		onAddNote(newNoteText.trim());
		newNoteText = '';
	}

	function handleQuickRemark(remark: string) {
		newNoteText = remark;
		handleAdd();
	}
</script>

<Card class="p-4 bg-white/90 shadow-xs border-slate-200/90 space-y-3">
	<!-- Header -->
	<div class="flex items-center justify-between pb-2 border-b border-slate-100">
		<div class="flex items-center gap-2">
			<PhoneCall class="w-4 h-4 text-[#5845eb]" />
			<h3 class="text-xs font-black text-slate-900 uppercase tracking-wider">
				কল রেকর্ড ও মার্চেন্ট নোটস
			</h3>
		</div>
		<span class="text-[10px] font-bold text-slate-400">
			{notes.length} টি রেকর্ড
		</span>
	</div>

	<!-- Quick Remark Pills -->
	<div class="flex flex-wrap gap-1">
		{#each QUICK_REMARKS as remark}
			<button
				type="button"
				onclick={() => handleQuickRemark(remark)}
				class="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-[#5845eb] text-slate-600 transition-colors cursor-pointer border border-slate-200/60"
			>
				+ {remark}
			</button>
		{/each}
	</div>

	<!-- Add Note Input Box -->
	<div class="flex items-center gap-1.5 pt-1">
		<Input
			type="text"
			bind:value={newNoteText}
			placeholder="কলের মন্তব্য বা নোট লিখুন..."
			class="h-9 text-xs focus:border-[#5845eb]"
			onkeydown={(e) => {
				if (e.key === 'Enter') {
					e.preventDefault();
					handleAdd();
				}
			}}
		/>
		<Button
			type="button"
			size="sm"
			onclick={handleAdd}
			class="h-9 px-3 bg-[#5845eb] hover:bg-indigo-700 text-white shrink-0"
			title="নোট যুক্ত করুন"
		>
			<Send class="w-3.5 h-3.5" />
		</Button>
	</div>

	<!-- Notes Timeline List -->
	<div class="space-y-2 pt-1 max-h-48 overflow-y-auto pr-1">
		{#if notes.length === 0}
			<div class="py-6 text-center text-slate-400">
				<MessageSquareText class="w-6 h-6 mx-auto text-slate-300 stroke-1 mb-1" />
				<p class="text-[11px] font-medium">এই নম্বরে কোনো পূর্ববর্তী কল রেকর্ড নেই</p>
			</div>
		{:else}
			{#each notes as item}
				<div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1">
					<p class="font-bold text-slate-800 leading-relaxed">
						{item.note}
					</p>
					<div class="flex items-center justify-between text-[10px] text-slate-400 font-medium">
						<span class="flex items-center gap-1">
							<UserCheck class="w-3 h-3 text-indigo-500" />
							<span>{item.author}</span>
						</span>
						<span class="flex items-center gap-1">
							<Clock class="w-3 h-3" />
							<span>{item.time}</span>
						</span>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</Card>

