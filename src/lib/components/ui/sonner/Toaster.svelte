<script lang="ts">
	import { Toaster as SonnerToaster } from 'svelte-sonner';

	let { ...restProps } = $props();
</script>

<SonnerToaster
	position="top-right"
	richColors
	closeButton
	class="font-['Anek_Bangla',sans-serif]"
	toastOptions={{
		classes: {
			toast: 'rounded-2xl border border-slate-200/90 shadow-xl text-xs font-semibold py-3 px-4 font-["Anek_Bangla",sans-serif]',
			title: 'text-xs font-bold font-["Anek_Bangla",sans-serif]',
			description: 'text-[11px] font-medium text-slate-500 font-["Anek_Bangla",sans-serif]',
			actionButton: 'bg-[#5845eb] text-white rounded-xl text-xs font-bold px-3 py-1',
			cancelButton: 'bg-slate-100 text-slate-700 rounded-xl text-xs font-bold px-3 py-1',
			closeButton: 'bg-white border border-slate-200 text-slate-400 hover:text-slate-800 rounded-lg'
		}
	}}
	{...restProps}
/>
