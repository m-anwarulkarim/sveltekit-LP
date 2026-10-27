<script lang="ts">
	import { Button, Card, Input, Switch } from '#lib/components/ui';
	import { ArrowLeft, CheckCircle2, Check, BookOpen } from 'lucide-svelte';

	let isSaved = $state(false);
	let saveMessage = $state('Blog Settings Saved!');

	let enableBlog = $state(true);
	let postsPerPage = $state(9);
	let enableComments = $state(true);
	let autoApproveComments = $state(false);
	let blogTitle = $state('The Color Light - Articles & Tips');

	function triggerSave(msg = 'Blog Settings Saved!') {
		isSaved = true;
		saveMessage = msg;
		setTimeout(() => (isSaved = false), 3000);
	}
</script>

<svelte:head>
	<title>Blog Settings | AURA Enterprise</title>
</svelte:head>

<div class="space-y-6 max-w-2xl mx-auto p-4 sm:p-6">
	{#if isSaved}
		<div class="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
			<CheckCircle2 class="w-4 h-4" />
			<span>{saveMessage}</span>
		</div>
	{/if}

	<div class="flex items-center justify-between gap-4 pb-2">
		<a href="/admin/settings">
			<Button variant="outline" size="sm" class="gap-2">
				<ArrowLeft class="w-4 h-4" />
				<span>Back to Settings</span>
			</Button>
		</a>

		<Button
			type="button"
			onclick={() => triggerSave()}
			class="gap-1.5 bg-[#1d6ee5] hover:bg-[#1557b0] text-white font-bold"
		>
			<Check class="w-4 h-4" />
			<span>Save Settings</span>
		</Button>
	</div>

	<Card class="p-6 space-y-6 bg-white border border-slate-200/90 shadow-2xs rounded-3xl">
		<div class="flex items-center gap-3 pb-3 border-b border-slate-100">
			<div class="w-10 h-10 rounded-full bg-[#1d6ee5] flex items-center justify-center text-white">
				<BookOpen class="w-5 h-5" />
			</div>
			<div>
				<h3 class="text-base font-bold text-slate-900">Blog Settings</h3>
				<p class="text-xs text-slate-500">ব্লগ সেকশন সক্রিয়করণ, মন্তব্য মডারেশন ও পেজিনেশন সেটিংস</p>
			</div>
		</div>

		<div class="space-y-4">
			<div class="flex items-center justify-between p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
				<div>
					<h4 class="text-xs font-bold text-slate-900">স্টোরে ব্লগ সেকশন চালু রাখুন</h4>
					<p class="text-[11px] text-slate-500">এসইও ট্র্যাফিক বৃদ্ধির জন্য প্রোডাক্ট টিপস ও আর্টিকেল পাবলিশ</p>
				</div>
				<Switch bind:checked={enableBlog} />
			</div>

			<div class="space-y-1.5">
				<label class="text-xs font-bold text-slate-700">ব্লগ পেজের প্রধান শিরোনাম</label>
				<Input type="text" bind:value={blogTitle} class="text-sm font-semibold" />
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700">প্রতি পেজে পোস্ট সংখ্যা</label>
					<Input type="number" bind:value={postsPerPage} class="font-mono text-sm" />
				</div>
				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700">গ্রাহকের মন্তব্য অনুমোদন</label>
					<div class="pt-2">
						<Switch bind:checked={enableComments} />
					</div>
				</div>
			</div>
		</div>

		<Button
			type="button"
			onclick={() => triggerSave()}
			class="w-full bg-[#1d6ee5] hover:bg-[#1557b0] text-white font-bold"
		>
			ব্লগ সেটিংস সংরক্ষণ
		</Button>
	</Card>
</div>
