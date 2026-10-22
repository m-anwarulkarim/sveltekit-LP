<script lang="ts">
	import { cart } from '../cart.svelte';
	import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, ShieldCheck, Sparkles } from 'lucide-svelte';

	interface Props {
		onCheckout: () => void;
	}

	let { onCheckout }: Props = $props();
	let couponInput = $state('');

	function handleApplyCoupon() {
		cart.applyCoupon(couponInput);
	}

	function formatPrice(cents: number) {
		return `$${(cents / 100).toFixed(2)}`;
	}
</script>

{#if cart.isOpen}
	<!-- Backdrop -->
	<div
		onclick={() => cart.closeCart()}
		class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity"
		aria-hidden="true"
	></div>

	<!-- Drawer Container -->
	<aside
		class="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0e101a] border-l border-white/10 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300"
		aria-label="Shopping Cart Drawer"
	>
		<!-- Header -->
		<div class="p-6 border-b border-white/10 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<div class="p-2 rounded-xl bg-violet-600/20 text-cyan-400">
					<ShoppingBag class="w-5 h-5" />
				</div>
				<div>
					<h3 class="text-base font-bold text-white font-heading">Your Audio Bag</h3>
					<span class="text-xs text-slate-400">{cart.count} {cart.count === 1 ? 'item' : 'items'} selected</span>
				</div>
			</div>

			<button
				onclick={() => cart.closeCart()}
				class="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
				aria-label="Close cart"
			>
				<X class="w-5 h-5" />
			</button>
		</div>

		<!-- Free Express Shipping Goal Banner -->
		<div class="px-6 py-3 bg-violet-950/40 border-b border-violet-500/20 text-xs text-slate-300 flex items-center gap-2">
			<Sparkles class="w-4 h-4 text-cyan-400 shrink-0" />
			<span><strong>Free Global Express Shipping</strong> applied on all orders today!</span>
		</div>

		<!-- Items List -->
		<div class="flex-1 overflow-y-auto p-6 space-y-4">
			{#if cart.items.length === 0}
				<div class="text-center py-16 flex flex-col items-center gap-3">
					<ShoppingBag class="w-12 h-12 text-slate-600" />
					<div class="text-base font-bold text-white">Your bag is empty</div>
					<p class="text-xs text-slate-400 max-w-xs">Discover our flagship Planar headphones and acoustic studio hardware.</p>
					<button
						onclick={() => cart.closeCart()}
						class="mt-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors"
					>
						Explore Products
					</button>
				</div>
			{:else}
				{#each cart.items as item (item.id)}
					<div class="p-4 rounded-2xl bg-white/5 border border-white/10 flex gap-4 items-center">
						<img
							src={item.image}
							alt={item.name}
							class="w-16 h-16 rounded-xl object-cover border border-white/10 bg-black/40 shrink-0"
						/>
						<div class="flex-1 min-w-0">
							<div class="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">{item.category}</div>
							<h4 class="text-sm font-bold text-white truncate font-heading">{item.name}</h4>
							<div class="text-xs font-bold text-white mt-1">{formatPrice(item.price)}</div>

							<!-- Quantity Adjusters -->
							<div class="flex items-center gap-3 mt-2">
								<div class="flex items-center rounded-lg bg-black/50 border border-white/10">
									<button
										onclick={() => cart.updateQuantity(item.id, -1)}
										class="p-1 text-slate-400 hover:text-white"
										aria-label="Decrease quantity"
									>
										<Minus class="w-3.5 h-3.5" />
									</button>
									<span class="px-2 text-xs font-bold text-white">{item.quantity}</span>
									<button
										onclick={() => cart.updateQuantity(item.id, 1)}
										class="p-1 text-slate-400 hover:text-white"
										aria-label="Increase quantity"
									>
										<Plus class="w-3.5 h-3.5" />
									</button>
								</div>

								<button
									onclick={() => cart.removeItem(item.id)}
									class="text-slate-500 hover:text-rose-400 p-1 transition-colors"
									title="Remove item"
								>
									<Trash2 class="w-3.5 h-3.5" />
								</button>
							</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>

		<!-- Footer Summary & Actions -->
		{#if cart.items.length > 0}
			<div class="p-6 border-t border-white/10 bg-[#090a0f]/80 backdrop-blur-md space-y-4">
				
				<!-- Coupon Input -->
				<div class="flex gap-2">
					<div class="relative flex-1">
						<Tag class="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
						<input
							type="text"
							placeholder="Discount code (try AURA20)"
							bind:value={couponInput}
							class="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 uppercase focus:border-cyan-400 outline-none"
						/>
					</div>
					<button
						onclick={handleApplyCoupon}
						class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors"
					>
						Apply
					</button>
				</div>

				{#if cart.couponMessage}
					<div class="text-[11px] {cart.discountPercent > 0 ? 'text-emerald-400' : 'text-rose-400'}">
						{cart.couponMessage}
					</div>
				{/if}

				<!-- Price Line items -->
				<div class="space-y-1.5 text-xs">
					<div class="flex justify-between text-slate-400">
						<span>Subtotal</span>
						<span class="text-white font-medium">{formatPrice(cart.subtotal)}</span>
					</div>

					{#if cart.discountAmount > 0}
						<div class="flex justify-between text-emerald-400 font-medium">
							<span>Launch Promo ({cart.discountPercent}%)</span>
							<span>-{formatPrice(cart.discountAmount)}</span>
						</div>
					{/if}

					<div class="flex justify-between text-slate-400">
						<span>Estimated Shipping</span>
						<span class="text-cyan-400 font-medium">FREE</span>
					</div>

					<div class="flex justify-between text-base font-extrabold text-white pt-2 border-t border-white/10">
						<span>Total Due</span>
						<span class="text-cyan-400 font-heading">{formatPrice(cart.total)}</span>
					</div>
				</div>

				<!-- Checkout Button -->
				<button
					onclick={() => {
						cart.closeCart();
						onCheckout();
					}}
					id="cart-checkout-btn"
					class="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-violet-600/30 transition-transform hover:scale-[1.01] active:scale-[0.99]"
				>
					<span>Secure Checkout</span>
					<ArrowRight class="w-4 h-4" />
				</button>

				<div class="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
					<ShieldCheck class="w-3.5 h-3.5 text-emerald-400" />
					<span>256-Bit SSL Encrypted & 30-Day Money Back</span>
				</div>
			</div>
		{/if}
	</aside>
{/if}
