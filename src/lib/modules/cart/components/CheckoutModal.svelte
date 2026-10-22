<script lang="ts">
	import { cart } from '../cart.svelte';
	import { CheckCircle2, ShieldCheck, CreditCard, Lock, Sparkles, PackageCheck, ArrowRight } from 'lucide-svelte';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen, onClose }: Props = $props();

	let name = $state('');
	let email = $state('');
	let address = $state('');
	let city = $state('');
	let postalCode = $state('');
	let isSubmitting = $state(false);
	let isSuccess = $state(false);
	let orderId = $state('');

	function formatPrice(cents: number) {
		return `$${(cents / 100).toFixed(2)}`;
	}

	async function handleCheckoutSubmit(e: Event) {
		e.preventDefault();
		if (!name || !email || !address) return;

		isSubmitting = true;

		// Mock network request & database record simulation
		await new Promise((r) => setTimeout(r, 1200));

		orderId = `AUR-${Math.floor(100000 + Math.random() * 900000)}`;
		isSubmitting = false;
		isSuccess = true;
		cart.clear();
	}

	function resetAndClose() {
		isSuccess = false;
		name = '';
		email = '';
		address = '';
		city = '';
		postalCode = '';
		onClose();
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
		<div class="relative w-full max-w-2xl bg-[#0f111c] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
			
			<button
				onclick={resetAndClose}
				class="absolute top-5 right-5 text-slate-400 hover:text-white p-2"
				aria-label="Close modal"
			>
				✕
			</button>

			{#if isSuccess}
				<div class="text-center py-10 flex flex-col items-center gap-4">
					<div class="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-bounce">
						<PackageCheck class="w-8 h-8" />
					</div>
					<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold">
						<Sparkles class="w-3.5 h-3.5" />
						Payment Confirmed & Verified
					</div>
					<h3 class="text-2xl sm:text-3xl font-extrabold text-white font-heading">
						Thank You for Your Order!
					</h3>
					<p class="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
						Order <strong class="text-cyan-400 font-mono">{orderId}</strong> has been logged to the Cloudflare D1 database. A confirmation email with tracking telemetry has been dispatched to <strong>{email}</strong>.
					</p>

					<div class="p-4 rounded-2xl bg-white/5 border border-white/10 w-full max-w-md text-left text-xs space-y-2 mt-2">
						<div class="flex justify-between text-slate-400">
							<span>Estimated Delivery:</span>
							<span class="text-white font-semibold">2-3 Business Days (Express Air)</span>
						</div>
						<div class="flex justify-between text-slate-400">
							<span>Acoustic Warranty:</span>
							<span class="text-white font-semibold">2-Year Full Replacement Plan</span>
						</div>
					</div>

					<button
						onclick={resetAndClose}
						class="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg transition-transform hover:scale-105"
					>
						Back to Store
					</button>
				</div>
			{:else}
				<div class="flex items-center gap-3 mb-6">
					<div class="p-2.5 rounded-xl bg-violet-600/20 text-cyan-400">
						<Lock class="w-5 h-5" />
					</div>
					<div>
						<h3 class="text-xl font-bold text-white font-heading">Express Checkout</h3>
						<p class="text-xs text-slate-400">Complete your order with instant order verification.</p>
					</div>
				</div>

				<form onsubmit={handleCheckoutSubmit} class="space-y-4">
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label for="checkout-name" class="block text-xs font-medium text-slate-300 mb-1">Full Legal Name</label>
							<input
								id="checkout-name"
								type="text"
								required
								bind:value={name}
								placeholder="Sarah Connor"
								class="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-cyan-400 outline-none"
							/>
						</div>

						<div>
							<label for="checkout-email" class="block text-xs font-medium text-slate-300 mb-1">Email Address (Order Tracking)</label>
							<input
								id="checkout-email"
								type="email"
								required
								bind:value={email}
								placeholder="sarah@example.com"
								class="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-cyan-400 outline-none"
							/>
						</div>
					</div>

					<div>
						<label for="checkout-address" class="block text-xs font-medium text-slate-300 mb-1">Street Shipping Address</label>
						<input
							id="checkout-address"
							type="text"
							required
							bind:value={address}
							placeholder="742 Evergreen Terrace, Suite 400"
							class="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-cyan-400 outline-none"
						/>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="checkout-city" class="block text-xs font-medium text-slate-300 mb-1">City / Region</label>
							<input
								id="checkout-city"
								type="text"
								required
								bind:value={city}
								placeholder="San Francisco, CA"
								class="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-cyan-400 outline-none"
							/>
						</div>

						<div>
							<label for="checkout-postal" class="block text-xs font-medium text-slate-300 mb-1">Postal / ZIP Code</label>
							<input
								id="checkout-postal"
								type="text"
								required
								bind:value={postalCode}
								placeholder="94107"
								class="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-cyan-400 outline-none"
							/>
						</div>
					</div>

					<!-- Payment Gateway Tokenization -->
					<div class="p-4 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between text-xs">
						<div class="flex items-center gap-3 text-slate-300">
							<CreditCard class="w-5 h-5 text-cyan-400" />
							<div>
								<div class="font-bold text-white">Apple Pay / Visa / Mastercard / Crypto</div>
								<div class="text-[11px] text-slate-400">Encrypted 256-bit tokenized gateway</div>
							</div>
						</div>
						<div class="text-right">
							<div class="text-[10px] text-slate-400">Total Charged</div>
							<div class="text-base font-black text-cyan-400 font-heading">{formatPrice(cart.total)}</div>
						</div>
					</div>

					<!-- Submit Button -->
					<button
						type="submit"
						disabled={isSubmitting}
						class="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
					>
						{#if isSubmitting}
							<div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
							<span>Verifying Acoustic Dispatch...</span>
						{:else}
							<span>Authorize & Confirm Order ({formatPrice(cart.total)})</span>
							<ArrowRight class="w-4 h-4" />
						{/if}
					</button>

					<div class="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
						<ShieldCheck class="w-3.5 h-3.5 text-emerald-400" />
						<span>Includes 30-day trial & no-questions-asked return policy</span>
					</div>
				</form>
			{/if}

		</div>
	</div>
{/if}
