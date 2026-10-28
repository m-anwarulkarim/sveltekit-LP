<script lang="ts">
	import {
		Bold,
		Italic,
		Underline,
		Strikethrough,
		List,
		ListOrdered,
		AlignLeft,
		AlignCenter,
		AlignRight,
		AlignJustify,
		Link2,
		Palette,
		Highlighter,
		Heading1,
		Heading2,
		Heading3,
		Type,
		Code,
		Eye,
		Edit3,
		Sparkles,
		Smile,
		Quote,
		Undo2,
		Redo2,
		AlertCircle
	} from 'lucide-svelte';
	import { Button, Badge } from '#lib/components/ui';

	interface Props {
		value: string;
		placeholder?: string;
	}

	let {
		value = $bindable(''),
		placeholder = 'পণ্য সম্পর্কে বিস্তারিত বর্ণনা লিখুন...'
	}: Props = $props();

	let editorRef = $state<HTMLDivElement | null>(null);
	let viewMode = $state<'visual' | 'code' | 'preview'>('visual');
	let isColorMenuOpen = $state(false);
	let isHighlightMenuOpen = $state(false);
	let isHeadingMenuOpen = $state(false);

	// Pre-curated vibrant text colors
	const textColors = [
		{ name: 'Default Dark', color: '#0f172a' },
		{ name: 'Indigo Blue', color: '#4f46e5' },
		{ name: 'Emerald Green', color: '#059669' },
		{ name: 'Crimson Red', color: '#dc2626' },
		{ name: 'Amber Orange', color: '#d97706' },
		{ name: 'Violet Purple', color: '#7c3aed' },
		{ name: 'Sky Blue', color: '#0284c7' },
		{ name: 'Rose Pink', color: '#e11d48' },
		{ name: 'Slate Gray', color: '#64748b' }
	];

	// Background highlight colors
	const highlightColors = [
		{ name: 'None', color: 'transparent' },
		{ name: 'Yellow Glow', color: '#fef08a' },
		{ name: 'Mint Green', color: '#bbf7d0' },
		{ name: 'Soft Blue', color: '#bae6fd' },
		{ name: 'Warm Peach', color: '#fed7aa' },
		{ name: 'Soft Pink', color: '#fbcfe8' },
		{ name: 'Lavender', color: '#e9d5ff' }
	];

	const emojis = ['🌸', '✨', '🌿', '📦', '💡', '✅', '🔥', '⭐', '❤️', '🚚', '💯', '🎯', '⚡'];

	// Initialize editor innerHTML
	$effect(() => {
		if (editorRef && viewMode === 'visual') {
			if (editorRef.innerHTML !== value) {
				editorRef.innerHTML = value || '';
			}
		}
	});

	function handleInput() {
		if (editorRef) {
			value = editorRef.innerHTML;
		}
	}

	function exec(command: string, arg: string | undefined = undefined) {
		if (!editorRef) return;
		editorRef.focus();
		document.execCommand(command, false, arg);
		handleInput();
	}

	function applyTextColor(color: string) {
		exec('foreColor', color);
		isColorMenuOpen = false;
	}

	function applyHighlight(color: string) {
		exec('hiliteColor', color);
		isHighlightMenuOpen = false;
	}

	function applyBlockFormat(tag: string) {
		exec('formatBlock', `<${tag}>`);
		isHeadingMenuOpen = false;
	}

	function insertLink() {
		const url = prompt('ওয়েবসাইট বা প্রোডাক্ট লিংক প্রবেশ করান (URL):', 'https://');
		if (url && url !== 'https://') {
			exec('createLink', url);
		}
	}

	function insertEmoji(emoji: string) {
		exec('insertText', ` ${emoji} `);
	}

	function insertCalloutBox(type: 'tip' | 'warning' | 'deal') {
		if (!editorRef) return;
		let html = '';
		if (type === 'tip') {
			html = `<div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 8px; margin: 12px 0;"><strong>💡 বিশেষ টিপস:</strong> আসল পণ্য চিনতে প্যাকেটের বারকোড ও সিল দেখে নিন।</div><p></p>`;
		} else if (type === 'warning') {
			html = `<div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 8px; margin: 12px 0;"><strong>⚠️ সতর্কতা:</strong> সরাসরি সূর্যের আলো থেকে দূরে রাখুন এবং শিশুদের নাগালের বাইরে রাখুন।</div><p></p>`;
		} else if (type === 'deal') {
			html = `<div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 8px; margin: 12px 0;"><strong>🔥 বিশেষ অফার:</strong> সীমিত সময়ের জন্য ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!</div><p></p>`;
		}
		exec('insertHTML', html);
	}
</script>

<div class="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs focus-within:border-[#5845eb] focus-within:ring-3 focus-within:ring-[#5845eb]/10 transition-all font-['Plus_Jakarta_Sans',sans-serif]">
	
	<!-- Top Controls: Mode Switcher & Tools -->
	<div class="p-2 sm:p-2.5 bg-slate-50/90 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-2">
		
		<!-- View Mode Tabs -->
		<div class="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs">
			<button
				type="button"
				onclick={() => (viewMode = 'visual')}
				class="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer {viewMode === 'visual' ? 'bg-[#5845eb] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
			>
				<Edit3 class="w-3.5 h-3.5" />
				<span>ভিজ্যুয়াল এডিটর</span>
			</button>

			<button
				type="button"
				onclick={() => (viewMode = 'preview')}
				class="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer {viewMode === 'preview' ? 'bg-[#5845eb] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
			>
				<Eye class="w-3.5 h-3.5" />
				<span>লাইভ প্রিভিউ</span>
			</button>

			<button
				type="button"
				onclick={() => (viewMode = 'code')}
				class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer {viewMode === 'code' ? 'bg-[#5845eb] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
				title="HTML Code View"
			>
				<Code class="w-3.5 h-3.5" />
				<span>HTML</span>
			</button>
		</div>

		<!-- Quick Emojis Bar -->
		<div class="hidden md:flex items-center gap-0.5 px-2 py-0.5 bg-white rounded-xl border border-slate-200/80">
			{#each emojis as emoji}
				<button
					type="button"
					onclick={() => insertEmoji(emoji)}
					class="p-1 text-xs hover:scale-125 transition-transform cursor-pointer"
					title="ইমোজি দিন"
				>
					{emoji}
				</button>
			{/each}
		</div>
	</div>

	<!-- Rich Text Formatting Toolbar (Visible in Visual Mode) -->
	{#if viewMode === 'visual'}
		<div class="p-2 bg-white border-b border-slate-100 flex flex-wrap items-center gap-1 text-slate-700 text-xs">
			
			<!-- Headings Dropdown -->
			<div class="relative">
				<button
					type="button"
					onclick={() => { isHeadingMenuOpen = !isHeadingMenuOpen; isColorMenuOpen = false; isHighlightMenuOpen = false; }}
					class="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center gap-1 font-bold text-xs cursor-pointer"
					title="হেডিং স্টাইল"
				>
					<Type class="w-3.5 h-3.5 text-[#5845eb]" />
					<span>হেডিং স্টাইল</span>
				</button>
				{#if isHeadingMenuOpen}
					<div class="absolute top-full left-0 mt-1 z-30 w-40 bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 space-y-1">
						<button
							type="button"
							onclick={() => applyBlockFormat('p')}
							class="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-xs text-slate-700 cursor-pointer"
						>
							সাধারণ লেখা (Normal)
						</button>
						<button
							type="button"
							onclick={() => applyBlockFormat('h2')}
							class="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-sm font-bold text-slate-900 cursor-pointer"
						>
							বড় হেডিং (H2)
						</button>
						<button
							type="button"
							onclick={() => applyBlockFormat('h3')}
							class="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-xs font-bold text-slate-900 cursor-pointer"
						>
							মাঝারি হেডিং (H3)
						</button>
					</div>
				{/if}
			</div>

			<span class="w-[1px] h-4 bg-slate-200 mx-1"></span>

			<!-- Basic Typography Formatting -->
			<button
				type="button"
				onclick={() => exec('bold')}
				class="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer font-bold"
				title="Bold (গাঢ় করুন)"
			>
				<Bold class="w-4 h-4" />
			</button>

			<button
				type="button"
				onclick={() => exec('italic')}
				class="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
				title="Italic (বাঁকা করুন)"
			>
				<Italic class="w-4 h-4" />
			</button>

			<button
				type="button"
				onclick={() => exec('underline')}
				class="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
				title="Underline (নিচে দাগ দিন)"
			>
				<Underline class="w-4 h-4" />
			</button>

			<button
				type="button"
				onclick={() => exec('strikeThrough')}
				class="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
				title="Strikethrough (কেটে দিন)"
			>
				<Strikethrough class="w-4 h-4" />
			</button>

			<span class="w-[1px] h-4 bg-slate-200 mx-1"></span>

			<!-- Text Color Dropdown (Colorful Text!) -->
			<div class="relative">
				<button
					type="button"
					onclick={() => { isColorMenuOpen = !isColorMenuOpen; isHighlightMenuOpen = false; isHeadingMenuOpen = false; }}
					class="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
					title="টেক্সট কালার (রঙিন লেখা)"
				>
					<Palette class="w-4 h-4 text-rose-500" />
					<span class="text-xs font-bold">কালার</span>
				</button>
				{#if isColorMenuOpen}
					<div class="absolute top-full left-0 mt-1 z-30 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 space-y-2">
						<div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">রং পছন্দ করুন</div>
						<div class="grid grid-cols-3 gap-1.5">
							{#each textColors as c}
								<button
									type="button"
									onclick={() => applyTextColor(c.color)}
									class="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-100 text-[11px] font-semibold text-slate-800 cursor-pointer"
									title={c.name}
								>
									<span class="w-3.5 h-3.5 rounded-full border border-slate-200 shrink-0" style="background-color: {c.color}"></span>
									<span class="truncate">{c.name.split(' ')[0]}</span>
								</button>
							{/each}
						</div>
						<div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
							<span class="text-[11px] text-slate-500">কাস্টম কালার:</span>
							<input
								type="color"
								onchange={(e) => applyTextColor((e.target as HTMLInputElement).value)}
								class="w-6 h-6 rounded-md cursor-pointer border border-slate-200 p-0"
							/>
						</div>
					</div>
				{/if}
			</div>

			<!-- Highlight Background Dropdown -->
			<div class="relative">
				<button
					type="button"
					onclick={() => { isHighlightMenuOpen = !isHighlightMenuOpen; isColorMenuOpen = false; isHeadingMenuOpen = false; }}
					class="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
					title="টেক্সট হাইলাইটার"
				>
					<Highlighter class="w-4 h-4 text-amber-500" />
					<span class="text-xs font-bold">হাইলাইট</span>
				</button>
				{#if isHighlightMenuOpen}
					<div class="absolute top-full left-0 mt-1 z-30 w-44 bg-white rounded-2xl border border-slate-200 shadow-xl p-2.5 space-y-1.5">
						<div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">হাইলাইট শেড</div>
						<div class="space-y-1">
							{#each highlightColors as h}
								<button
									type="button"
									onclick={() => applyHighlight(h.color)}
									class="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 text-xs font-medium text-slate-800 cursor-pointer"
								>
									<span class="w-4 h-4 rounded-md border border-slate-300 shrink-0" style="background-color: {h.color}"></span>
									<span>{h.name}</span>
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<span class="w-[1px] h-4 bg-slate-200 mx-1"></span>

			<!-- Lists -->
			<button
				type="button"
				onclick={() => exec('insertUnorderedList')}
				class="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
				title="বুলেট লিস্ট"
			>
				<List class="w-4 h-4" />
			</button>

			<button
				type="button"
				onclick={() => exec('insertOrderedList')}
				class="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
				title="নাম্বার লিস্ট"
			>
				<ListOrdered class="w-4 h-4" />
			</button>

			<span class="w-[1px] h-4 bg-slate-200 mx-1"></span>

			<!-- Alignments -->
			<button
				type="button"
				onclick={() => exec('justifyLeft')}
				class="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
				title="বাম এলাইন"
			>
				<AlignLeft class="w-4 h-4" />
			</button>

			<button
				type="button"
				onclick={() => exec('justifyCenter')}
				class="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
				title="মাঝখানে এলাইন"
			>
				<AlignCenter class="w-4 h-4" />
			</button>

			<button
				type="button"
				onclick={() => exec('justifyRight')}
				class="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
				title="ডান এলাইন"
			>
				<AlignRight class="w-4 h-4" />
			</button>

			<span class="w-[1px] h-4 bg-slate-200 mx-1"></span>

			<!-- Link & Callouts -->
			<button
				type="button"
				onclick={insertLink}
				class="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
				title="ওয়েব লিংক যোগ করুন"
			>
				<Link2 class="w-4 h-4 text-blue-600" />
			</button>

			<!-- Callout Buttons -->
			<button
				type="button"
				onclick={() => insertCalloutBox('tip')}
				class="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
				title="টিপস বক্স যোগ করুন"
			>
				<Sparkles class="w-3.5 h-3.5" />
				<span>টিপস বক্স</span>
			</button>

			<button
				type="button"
				onclick={() => insertCalloutBox('deal')}
				class="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
				title="অফার বক্স যোগ করুন"
			>
				<span>🔥 অফার বক্স</span>
			</button>
		</div>
	{/if}

	<!-- Editor Body -->
	<div class="relative min-h-[220px]">
		{#if viewMode === 'visual'}
			<!-- ContentEditable WYSIWYG surface -->
			<div
				bind:this={editorRef}
				contenteditable="true"
				oninput={handleInput}
				class="w-full min-h-[220px] max-h-[500px] overflow-y-auto p-4 sm:p-5 outline-none text-slate-800 text-sm leading-relaxed prose prose-slate max-w-none focus:outline-hidden font-['Anek_Bangla',sans-serif]"
				style="white-space: pre-wrap;"
			></div>

		{:else if viewMode === 'code'}
			<!-- Raw HTML Code Editor -->
			<textarea
				bind:value
				rows="10"
				class="w-full p-4 font-mono text-xs text-slate-800 bg-slate-50 outline-none resize-y border-none"
				placeholder="HTML কোড এখানে টাইপ বা পেস্ট করুন..."
			></textarea>

		{:else if viewMode === 'preview'}
			<!-- Customer Facing Live Preview -->
			<div class="p-5 bg-slate-50/50 min-h-[220px] overflow-y-auto space-y-2">
				<div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
					কাস্টমার ভিউ (স্টোরফ্রন্টে যেমন দেখাবে):
				</div>
				<div class="prose prose-slate max-w-none text-sm text-slate-800 font-['Anek_Bangla',sans-serif] bg-white p-4 rounded-xl border border-slate-200">
					{#if value}
						{@html value}
					{:else}
						<span class="text-slate-400 italic">কোনো ডেসক্রিপশন লেখা হয়নি।</span>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	<!-- Bottom Character Count & Help Bar -->
	<div class="px-4 py-2 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
		<div class="flex items-center gap-2">
			<span>বোল্ড, বিভিন্ন রং, হেডিং ও হাইলাইট সাপোর্ট করে।</span>
		</div>
		<div class="font-mono">
			{value ? value.replace(/<[^>]*>/g, '').length : 0} অক্ষর
		</div>
	</div>

</div>

