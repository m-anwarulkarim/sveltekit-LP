<script lang="ts">
	import { Star, CheckCircle, MessageSquarePlus, Sparkles } from 'lucide-svelte';

	interface Review {
		id: string;
		author: string;
		role: string;
		avatar: string;
		rating: number;
		title: string;
		content: string;
		verified: boolean;
		date: string;
	}

	let reviewsList = $state<Review[]>([
		{
			id: 'rev-1',
			author: 'Marcus Vance',
			role: 'Grammy-Nominated Mixing Engineer',
			avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
			rating: 5,
			title: 'Replaced my $2,000 studio reference monitors on the road.',
			content: 'The transient accuracy of the 50mm planar drivers is uncanny. I can hear compressor release tails and subtle reverb artifacts that dynamic drivers completely mask. The 96kHz lossless wireless has zero perceivable lag.',
			verified: true,
			date: '2 days ago'
		},
		{
			id: 'rev-2',
			author: 'Elena Rostova',
			role: 'Film Score Composer & Sound Designer',
			avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
			rating: 5,
			title: 'The head-tracking spatial audio is revolutionary for Atmos mixing.',
			content: 'I mix cinematic soundscapes for VR and film. The 6-axis spatial anchor feels completely natural—it is the first pair of headphones where sound truly appears outside your skull in physical space.',
			verified: true,
			date: '1 week ago'
		},
		{
			id: 'rev-3',
			author: 'David Chen',
			role: 'Tech Lead & Daily Commuter',
			avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
			rating: 5,
			title: 'ANC completely destroys subway rumble. Battery easily lasts all week.',
			content: 'Bought both the Spectrum X and the Zenith earbuds. The ANC is vastly superior to my previous Sony XM5s—it cancels voices and train screech without that uncomfortable inner-ear cabin pressure.',
			verified: true,
			date: '2 weeks ago'
		}
	]);

	let isReviewModalOpen = $state(false);
	let newAuthor = $state('');
	let newRole = $state('Audio Enthusiast');
	let newTitle = $state('');
	let newContent = $state('');
	let newRating = $state(5);
	let filterRating = $state<number | 'all'>('all');
	let submissionSuccess = $state(false);

	const filteredReviews = $derived(
		filterRating === 'all'
			? reviewsList
			: reviewsList.filter((r) => r.rating === filterRating)
	);

	function submitReview(e: Event) {
		e.preventDefault();
		if (!newAuthor || !newTitle || !newContent) return;

		reviewsList = [
			{
				id: `rev-${Date.now()}`,
				author: newAuthor,
				role: newRole || 'Verified Customer',
				avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
				rating: newRating,
				title: newTitle,
				content: newContent,
				verified: true,
				date: 'Just now'
			},
			...reviewsList
		];

		submissionSuccess = true;
		setTimeout(() => {
			isReviewModalOpen = false;
			submissionSuccess = false;
			newAuthor = '';
			newTitle = '';
			newContent = '';
		}, 1500);
	}
</script>

<section id="reviews" class="py-24 relative">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		
		<!-- Section Header & Overall Rating Breakdown -->
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
			
			<div class="lg:col-span-6">
				<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
					<Sparkles class="w-3.5 h-3.5" />
					Creator Tested & Approved
				</div>
				<h2 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-heading mb-4">
					Loved by over <br />
					<span class="bg-gradient-to-r from-amber-400 via-orange-300 to-rose-400 bg-clip-text text-transparent">
						3,400+ World Creators
					</span>
				</h2>
				<p class="text-slate-400 text-sm sm:text-base leading-relaxed">
					Read genuine feedback from master engineers, musicians, and everyday audiophiles who demand uncompromising acoustics.
				</p>

				<div class="pt-6">
					<button
						onclick={() => isReviewModalOpen = true}
						class="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 text-xs font-semibold hover:border-violet-500/40 transition-all"
					>
						<MessageSquarePlus class="w-4 h-4 text-violet-400" />
						<span>Write a Creator Review</span>
					</button>
				</div>
			</div>

			<!-- Rating Score Card -->
			<div class="lg:col-span-6 glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
				<div class="flex items-center gap-6 pb-6 border-b border-white/10">
					<div class="text-5xl sm:text-6xl font-black text-white font-heading">4.9</div>
					<div>
						<div class="flex text-amber-400 mb-1">
							{#each Array(5) as _}
								<Star class="w-5 h-5 fill-amber-400 text-amber-400" />
							{/each}
						</div>
						<div class="text-xs text-slate-300 font-medium">Based on 3,420 Verified Creator Reviews</div>
						<div class="text-[11px] text-emerald-400 font-semibold mt-0.5">99.4% Recommend AURA Gear</div>
					</div>
				</div>

				<!-- Rating Breakdown Bars -->
				<div class="space-y-2.5 pt-6 text-xs">
					<div class="flex items-center gap-3">
						<span class="w-12 text-slate-400">5 Stars</span>
						<div class="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
							<div class="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full w-[92%]"></div>
						</div>
						<span class="w-10 text-right text-slate-300 font-semibold">92%</span>
					</div>
					<div class="flex items-center gap-3">
						<span class="w-12 text-slate-400">4 Stars</span>
						<div class="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
							<div class="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full w-[6%]"></div>
						</div>
						<span class="w-10 text-right text-slate-300 font-semibold">6%</span>
					</div>
					<div class="flex items-center gap-3">
						<span class="w-12 text-slate-400">3 Stars</span>
						<div class="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
							<div class="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full w-[2%]"></div>
						</div>
						<span class="w-10 text-right text-slate-300 font-semibold">2%</span>
					</div>
				</div>
			</div>

		</div>

		<!-- Reviews Cards Grid -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			{#each filteredReviews as review (review.id)}
				<div class="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
					<div>
						<!-- Stars & Date -->
						<div class="flex items-center justify-between mb-3">
							<div class="flex text-amber-400">
								{#each Array(review.rating) as _}
									<Star class="w-4 h-4 fill-amber-400 text-amber-400" />
								{/each}
							</div>
							<span class="text-[11px] text-slate-500">{review.date}</span>
						</div>

						<h3 class="text-base font-bold text-white mb-2 font-heading">
							"{review.title}"
						</h3>

						<p class="text-xs text-slate-300 leading-relaxed mb-6">
							{review.content}
						</p>
					</div>

					<!-- Author info -->
					<div class="flex items-center gap-3 pt-4 border-t border-white/10">
						<img
							src={review.avatar}
							alt={review.author}
							class="w-10 h-10 rounded-full object-cover border border-white/10"
						/>
						<div>
							<div class="flex items-center gap-1.5">
								<span class="text-xs font-bold text-white">{review.author}</span>
								{#if review.verified}
									<CheckCircle class="w-3.5 h-3.5 text-cyan-400" />
								{/if}
							</div>
							<div class="text-[11px] text-slate-400 truncate">{review.role}</div>
						</div>
					</div>

				</div>
			{/each}
		</div>

	</div>

	<!-- Review Submission Modal -->
	{#if isReviewModalOpen}
		<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
			<div class="w-full max-w-lg bg-[#11131f] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
				<button
					onclick={() => isReviewModalOpen = false}
					class="absolute top-5 right-5 text-slate-400 hover:text-white"
					aria-label="Close review dialog"
				>
					✕
				</button>

				{#if submissionSuccess}
					<div class="text-center py-8 flex flex-col items-center gap-3">
						<CheckCircle class="w-12 h-12 text-emerald-400 animate-bounce" />
						<div class="text-xl font-bold text-white">Thank You for Your Feedback!</div>
						<p class="text-xs text-slate-400">Your review has been verified and added to the store.</p>
					</div>
				{:else}
					<h3 class="text-xl font-bold text-white font-heading mb-1">Write a Creator Review</h3>
					<p class="text-xs text-slate-400 mb-6">Share your acoustic impressions with the AURA community.</p>

					<form onsubmit={submitReview} class="space-y-4">
						<div class="grid grid-cols-2 gap-3">
							<div>
								<label for="review-author" class="block text-xs font-medium text-slate-300 mb-1">Your Name</label>
								<input
									id="review-author"
									type="text"
									required
									bind:value={newAuthor}
									placeholder="e.g. Alex Morgan"
									class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-cyan-400 outline-none"
								/>
							</div>
							<div>
								<label for="review-role" class="block text-xs font-medium text-slate-300 mb-1">Profession / Role</label>
								<input
									id="review-role"
									type="text"
									bind:value={newRole}
									placeholder="e.g. Sound Designer"
									class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-cyan-400 outline-none"
								/>
							</div>
						</div>

						<div>
							<span class="block text-xs font-medium text-slate-300 mb-1">Rating</span>
							<div class="flex items-center gap-2">
								{#each [1, 2, 3, 4, 5] as star}
									<button
										type="button"
										onclick={() => newRating = star}
										class="p-1 hover:scale-110 transition-transform"
									>
										<Star class="w-6 h-6 {newRating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}" />
									</button>
								{/each}
							</div>
						</div>

						<div>
							<label for="review-title" class="block text-xs font-medium text-slate-300 mb-1">Headline</label>
							<input
								id="review-title"
								type="text"
								required
								bind:value={newTitle}
								placeholder="e.g. Beyond anything I've heard in 10 years"
								class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-cyan-400 outline-none"
							/>
						</div>

						<div>
							<label for="review-content" class="block text-xs font-medium text-slate-300 mb-1">Review Details</label>
							<textarea
								id="review-content"
								required
								rows="3"
								bind:value={newContent}
								placeholder="Describe the sound stage, comfort, ANC, or battery..."
								class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-cyan-400 outline-none"
							></textarea>
						</div>

						<button
							type="submit"
							class="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg transition-transform hover:scale-[1.01]"
						>
							Publish Review
						</button>
					</form>
				{/if}
			</div>
		</div>
	{/if}
</section>
