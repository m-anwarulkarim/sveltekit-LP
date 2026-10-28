<script lang="ts">
	interface Props {
		label: string;
		name: string;
		value?: string;
		onChange?: (color: string) => void;
	}

	let { label, name, value = $bindable('#e8007c'), onChange }: Props = $props();

	function handleColorChange(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		onChange?.(value);
	}
</script>

<div class="space-y-1.5">
	<label for={name} class="block text-[11px] font-bold text-slate-600">
		{label}
	</label>

	<div
		class="flex items-center border border-slate-200/90 rounded-2xl p-1.5 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-colors shadow-2xs focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500"
	>
		<!-- Color Swatch Block -->
		<label
			class="relative w-8 h-8 rounded-xl border border-black/10 shadow-inner cursor-pointer shrink-0 overflow-hidden flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
			style="background-color: {value};"
			title="রং নির্বাচন করুন"
		>
			<input
				type="color"
				id={name}
				{name}
				value={value}
				oninput={handleColorChange}
				class="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
			/>
		</label>

		<!-- Uppercase Hex Code Input -->
		<input
			type="text"
			bind:value={value}
			oninput={(e) => {
				let val = e.currentTarget.value.trim();
				if (!val.startsWith('#') && val.length > 0) val = '#' + val;
				value = val;
				onChange?.(value);
			}}
			placeholder="#000000"
			maxlength={7}
			class="w-full bg-transparent px-2.5 text-xs font-mono font-bold text-slate-800 focus:outline-none uppercase"
		/>
	</div>
</div>

