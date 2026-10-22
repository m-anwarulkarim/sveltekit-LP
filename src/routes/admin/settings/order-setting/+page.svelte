<script lang="ts">
	import { Button, Card, Badge, Input, Textarea, Switch } from '#lib/components/ui';
	import {
		ArrowLeft,
		CheckCircle2,
		Check,
		Info,
		Bold,
		Italic,
		Underline,
		Link,
		List
	} from 'lucide-svelte';

	let isSaved = $state(false);
	let saveMessage = $state('Order Settings Saved Successfully!');

	function triggerSave(msg = 'Order Settings Saved Successfully!') {
		isSaved = true;
		saveMessage = msg;
		setTimeout(() => (isSaved = false), 3000);
	}

	// 1. General Options
	let enableOrderNote = $state(true);
	let enableIncompleteOrder = $state(true);
	let enablePrescriptionOrder = $state(false);
	let enableCheckoutOrderModal = $state(false);
	let swapPaymentAndOrderItem = $state(true);

	// 2. Admin Customization
	let enableSL = $state(true);
	let enableProductSKU = $state(true);
	let enableProductName = $state(true);
	let enablePrevOrderCount = $state(true);
	let showDashboardProfitCard = $state(true);
	let enableHRM = $state(false);

	// 3. Security & Validation
	let fakeOrderProtection = $state(true);
	let enableOrderOTP = $state(false);
	let enablePhoneValidation = $state(true);
	let phoneMinLength = $state(11);
	let phoneMaxLength = $state(11);
	let blockSingleIP = $state(false);
	let ipWiseOrderLimit = $state(false);

	// 4. Order Notification
	let enableSMSNotification = $state(true);
	let enableEmailNotification = $state(true);
	let usePersonalSMTP = $state(false);

	// 5. Delivery Settings
	let deliveryBookingType = $state<'division' | 'city' | 'sub_area' | 'district'>('city');
	let deliveryOptionTitle = $state('শর্তাবলী: ১। অর্ডারকৃত পণ্য গ্রহণ করার সময় দেখে নিবেন');
	let insideDhakaCustomText = $state('Inside Dhaka 70TK');
	let outsideDhakaCustomText = $state('Outside Dhaka 120TK');

	// 6. Success Page Custom Message
	let successTitle = $state('THANK YOU\nYOUR ORDER IS PLACED');
	let successMessageBody = $state(
		'THANK YOU\nYOUR ORDER IS PLACED\nWe received your order and will begin processing it soon. Your order information appears below:\nYour order Number: {{orderId}}'
	);

	// 7. Custom Order Statuses
	let enableCustomStatusWorkflow = $state(false);

	// 8. Address Settings
	let requireFullAddress = $state(true);
	let showDistrictDropdown = $state(true);
</script>

<svelte:head>
	<title>Order Setting | AURA Enterprise</title>
</svelte:head>

<div class="space-y-6 max-w-7xl mx-auto">
	<!-- Toast Message -->
	{#if isSaved}
		<div class="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
			<CheckCircle2 class="w-4 h-4" />
			<span>{saveMessage}</span>
		</div>
	{/if}

	<!-- Top Action Bar (Back to Settings + Save Changes) -->
	<div class="flex items-center justify-between gap-4 pb-2">
		<a href="/admin/settings">
			<Button variant="outline" size="sm" class="gap-2">
				<ArrowLeft class="w-4 h-4" />
				<span>Back to Settings</span>
			</Button>
		</a>

		<Button
			type="button"
			onclick={() => triggerSave('Order Settings Saved Successfully!')}
			class="gap-1.5 bg-[#5845eb] hover:bg-[#4936d6] text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-indigo-500/20"
		>
			<Check class="w-4 h-4" />
			<span>Save Changes</span>
		</Button>
	</div>

	<!-- Main Content Grid: 3 Cols on Left, 1 Sticky Col on Right for Navigation -->
	<div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
		
		<!-- Left 3-Columns: All Order Settings Segments -->
		<div class="lg:col-span-3 space-y-6">

			<!-- 1. General Options -->
			<Card id="general-options" class="p-6 bg-white border border-slate-200/90 shadow-2xs rounded-2xl space-y-5 scroll-mt-24">
				<div class="border-b border-slate-100 pb-3">
					<h3 class="text-base font-bold text-slate-900">General Options</h3>
					<p class="text-xs text-slate-500 mt-0.5">Control basic order-related options and checkout configuration</p>
				</div>

				<div class="space-y-4">
					<!-- 1. Enable Order Note -->
					<div class="flex items-center justify-between gap-4">
						<div>
							<h4 class="text-sm font-bold text-slate-900">Enable Order Note</h4>
							<p class="text-xs text-slate-500 mt-0.5">Allow customers to add custom notes/instructions during order checkout</p>
						</div>
						<Switch bind:checked={enableOrderNote} />
					</div>

					<!-- 2. Enable Incomplete Order -->
					<div class="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
						<div>
							<h4 class="text-sm font-bold text-slate-900">Enable Incomplete Order</h4>
							<p class="text-xs text-slate-500 mt-0.5">Track and save orders that were abandoned mid-checkout</p>
						</div>
						<Switch bind:checked={enableIncompleteOrder} />
					</div>

					<!-- 3. Enable Prescription Order -->
					<div class="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
						<div>
							<h4 class="text-sm font-bold text-slate-900">Enable Prescription Order</h4>
							<p class="text-xs text-slate-500 mt-0.5">Allow uploading doctor prescriptions during the order flow</p>
						</div>
						<Switch bind:checked={enablePrescriptionOrder} />
					</div>

					<!-- 4. Enable Checkout Order Modal -->
					<div class="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
						<div>
							<h4 class="text-sm font-bold text-slate-900">Enable Checkout Order Modal</h4>
							<p class="text-xs text-slate-500 mt-0.5">Open a quick checkout form/modal directly upon clicking Order Now</p>
						</div>
						<Switch bind:checked={enableCheckoutOrderModal} />
					</div>

					<!-- 5. Swap Payment And Order Item -->
					<div class="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
						<div>
							<h4 class="text-sm font-bold text-slate-900">Swap Payment And Order Item</h4>
							<p class="text-xs text-slate-500 mt-0.5">Swap the payment options section and the order items summary on checkout page</p>
						</div>
						<Switch bind:checked={swapPaymentAndOrderItem} />
					</div>
				</div>
			</Card>

			<!-- 2. Admin Customization -->
			<Card id="admin-customization" class="p-6 bg-white border border-slate-200/90 shadow-2xs rounded-2xl space-y-5 scroll-mt-24">
				<div class="border-b border-slate-100 pb-3">
					<h3 class="text-base font-bold text-slate-900">Admin Customization</h3>
					<p class="text-xs text-slate-500 mt-0.5">Customize columns and information displayed on the order listing and admin dashboard</p>
				</div>

				<div class="space-y-4">
					<!-- 1. Enable SL -->
					<div class="flex items-center justify-between gap-4">
						<div>
							<h4 class="text-sm font-bold text-slate-900">Enable SL</h4>
							<p class="text-xs text-slate-500 mt-0.5">Display serial numbers in the admin orders list table</p>
						</div>
						<Switch bind:checked={enableSL} />
					</div>

					<!-- 2. Enable Product SKU -->
					<div class="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
						<div>
							<h4 class="text-sm font-bold text-slate-900">Enable Product SKU</h4>
							<p class="text-xs text-slate-500 mt-0.5">Display product SKU column in the admin orders list table</p>
						</div>
						<Switch bind:checked={enableProductSKU} />
					</div>

					<!-- 3. Enable Product Name / Success Order ID -->
					<div class="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
						<div>
							<h4 class="text-sm font-bold text-slate-900">Enable Product Name / Success Order ID</h4>
							<p class="text-xs text-slate-500 mt-0.5">Show product name column / success page order IDs in the admin list</p>
						</div>
						<Switch bind:checked={enableProductName} />
					</div>

					<!-- 4. Enable Previous Order Count -->
					<div class="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
						<div>
							<h4 class="text-sm font-bold text-slate-900">Enable Previous Order Count</h4>
							<p class="text-xs text-slate-500 mt-0.5">Show customers historic purchase counts directly on the orders list</p>
						</div>
						<Switch bind:checked={enablePrevOrderCount} />
					</div>

					<!-- 5. Show Dashboard Profit Card -->
					<div class="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
						<div>
							<h4 class="text-sm font-bold text-slate-900">Show Dashboard Profit Card</h4>
							<p class="text-xs text-slate-500 mt-0.5">Display the profit summary card on the admin dashboard</p>
						</div>
						<Switch bind:checked={showDashboardProfitCard} />
					</div>

					<!-- 6. Enable HRM -->
					<div class="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
						<div>
							<h4 class="text-sm font-bold text-slate-900">Enable HRM</h4>
							<p class="text-xs text-slate-500 mt-0.5">Show the HRM menu in the sidebar for employee management and order reports</p>
						</div>
						<Switch bind:checked={enableHRM} />
					</div>
				</div>
			</Card>

			<!-- 3. Security & Validation -->
			<Card id="security-validation" class="p-6 bg-white border border-slate-200/90 shadow-2xs rounded-2xl space-y-5 scroll-mt-24">
				<div class="border-b border-slate-100 pb-3">
					<h3 class="text-base font-bold text-slate-900">Security & Validation</h3>
					<p class="text-xs text-slate-500 mt-0.5">Configure order verification, IP rate-limiting, and phone validation</p>
				</div>

				<div class="space-y-4">
					<!-- 1. Fake Order Protection -->
					<div class="flex items-center justify-between gap-4">
						<div>
							<h4 class="text-sm font-bold text-slate-900">Fake Order Protection (Dynamic Token)</h4>
							<p class="text-xs text-slate-500 mt-0.5">Enable to block fake API requests. Only orders initiated from the website via browser checkout will be allowed</p>
						</div>
						<Switch bind:checked={fakeOrderProtection} />
					</div>

					<!-- 2. Enable Order OTP -->
					<div class="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
						<div>
							<h4 class="text-sm font-bold text-slate-900">Enable Order OTP</h4>
							<p class="text-xs text-slate-500 mt-0.5">Verify customer order placement with a secure one-time passcode</p>
						</div>
						<Switch bind:checked={enableOrderOTP} />
					</div>

					<!-- 3. Enable Phone Validation -->
					<div class="space-y-3 pt-3 border-t border-slate-100">
						<div class="flex items-center justify-between gap-4">
							<div>
								<h4 class="text-sm font-bold text-slate-900">Enable Phone Validation</h4>
								<p class="text-xs text-slate-500 mt-0.5">Enforce character range constraints on checkout phone numbers</p>
							</div>
							<Switch bind:checked={enablePhoneValidation} />
						</div>

						{#if enablePhoneValidation}
							<div class="grid grid-cols-2 gap-4 pt-2">
								<div class="space-y-1">
									<label for="min-len" class="text-[11px] font-bold text-slate-500">Minimum Length</label>
									<Input id="min-len" type="number" bind:value={phoneMinLength} class="h-9 font-mono" />
								</div>
								<div class="space-y-1">
									<label for="max-len" class="text-[11px] font-bold text-slate-500">Maximum Length</label>
									<Input id="max-len" type="number" bind:value={phoneMaxLength} class="h-9 font-mono" />
								</div>
							</div>
						{/if}
					</div>

					<!-- 4. Block Single User IP -->
					<div class="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
						<div>
							<h4 class="text-sm font-bold text-slate-900">Block Single User IP</h4>
							<p class="text-xs text-slate-500 mt-0.5">Allow manual or automatic single IP blocklisting to prevent spam</p>
						</div>
						<Switch bind:checked={blockSingleIP} />
					</div>

					<!-- 5. IP-wise Order Limit & Block -->
					<div class="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
						<div>
							<h4 class="text-sm font-bold text-slate-900">IP-wise Order Limit & Block</h4>
							<p class="text-xs text-slate-500 mt-0.5">Prevent bot attacks by limiting max orders per IP within a window</p>
						</div>
						<Switch bind:checked={ipWiseOrderLimit} />
					</div>
				</div>
			</Card>

			<!-- 4. Order Notification -->
			<Card id="order-notification" class="p-6 bg-white border border-slate-200/90 shadow-2xs rounded-2xl space-y-5 scroll-mt-24">
				<div class="border-b border-slate-100 pb-3">
					<h3 class="text-base font-bold text-slate-900">Order Notification</h3>
					<p class="text-xs text-slate-500 mt-0.5">Configure automated notifications to customers</p>
				</div>

				<div class="space-y-4">
					<!-- 1. Enable SMS Notification -->
					<div class="flex items-center justify-between gap-4">
						<div>
							<h4 class="text-sm font-bold text-slate-900">Enable SMS Notification</h4>
							<p class="text-xs text-slate-500 mt-0.5">Send order status updates to customers via SMS</p>
						</div>
						<Switch bind:checked={enableSMSNotification} />
					</div>

					<!-- 2. Enable Email Notification -->
					<div class="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
						<div>
							<h4 class="text-sm font-bold text-slate-900">Enable Email Notification</h4>
							<p class="text-xs text-slate-500 mt-0.5">Send order confirmation and status invoices to customers via email</p>
						</div>
						<Switch bind:checked={enableEmailNotification} />
					</div>

					<!-- 3. Use Personal SMTP Email -->
					<div class="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
						<div>
							<h4 class="text-sm font-bold text-slate-900">Use Personal SMTP Email</h4>
							<p class="text-xs text-slate-500 mt-0.5">Configure and send notification emails from your custom SMTP credentials</p>
						</div>
						<Switch bind:checked={usePersonalSMTP} />
					</div>
				</div>
			</Card>

			<!-- 5. Delivery Settings -->
			<Card id="delivery-settings" class="p-6 bg-white border border-slate-200/90 shadow-2xs rounded-2xl space-y-5 scroll-mt-24">
				<div class="border-b border-slate-100 pb-3">
					<h3 class="text-base font-bold text-slate-900">Delivery Settings</h3>
					<p class="text-xs text-slate-500 mt-0.5">Set the regional routing options for checkout delivery charges</p>
				</div>

				<!-- 4 Radio Cards -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<!-- Option 1: Division Booking -->
					<button
						type="button"
						onclick={() => (deliveryBookingType = 'division')}
						class="p-4 rounded-xl border text-left transition-all cursor-pointer {deliveryBookingType === 'division' ? 'border-[#5845eb] bg-indigo-50/40 ring-1 ring-[#5845eb]' : 'border-slate-200 hover:bg-slate-50'}"
					>
						<div class="flex items-center gap-2.5">
							<div class="w-4 h-4 rounded-full border flex items-center justify-center {deliveryBookingType === 'division' ? 'border-[#5845eb]' : 'border-slate-300'}">
								{#if deliveryBookingType === 'division'}
									<div class="w-2 h-2 rounded-full bg-[#5845eb]"></div>
								{/if}
							</div>
							<span class="font-bold text-sm text-slate-900">Division Booking</span>
						</div>
						<p class="text-xs text-slate-500 mt-1 pl-6">Calculate shipping charges based on country states / divisions</p>
					</button>

					<!-- Option 2: City-wise Booking (Selected by Default) -->
					<button
						type="button"
						onclick={() => (deliveryBookingType = 'city')}
						class="p-4 rounded-xl border text-left transition-all cursor-pointer {deliveryBookingType === 'city' ? 'border-[#5845eb] bg-indigo-50/40 ring-1 ring-[#5845eb]' : 'border-slate-200 hover:bg-slate-50'}"
					>
						<div class="flex items-center gap-2.5">
							<div class="w-4 h-4 rounded-full border flex items-center justify-center {deliveryBookingType === 'city' ? 'border-[#5845eb]' : 'border-slate-300'}">
								{#if deliveryBookingType === 'city'}
									<div class="w-2 h-2 rounded-full bg-[#5845eb]"></div>
								{/if}
							</div>
							<span class="font-bold text-sm text-slate-900">City-wise Booking</span>
						</div>
						<p class="text-xs text-slate-500 mt-1 pl-6">Calculate shipping charges via simple Inside / Outside Dhaka options</p>
					</button>

					<!-- Option 3: Sub-Area Booking -->
					<button
						type="button"
						onclick={() => (deliveryBookingType = 'sub_area')}
						class="p-4 rounded-xl border text-left transition-all cursor-pointer {deliveryBookingType === 'sub_area' ? 'border-[#5845eb] bg-indigo-50/40 ring-1 ring-[#5845eb]' : 'border-slate-200 hover:bg-slate-50'}"
					>
						<div class="flex items-center gap-2.5">
							<div class="w-4 h-4 rounded-full border flex items-center justify-center {deliveryBookingType === 'sub_area' ? 'border-[#5845eb]' : 'border-slate-300'}">
								{#if deliveryBookingType === 'sub_area'}
									<div class="w-2 h-2 rounded-full bg-[#5845eb]"></div>
								{/if}
							</div>
							<span class="font-bold text-sm text-slate-900">Sub-Area Booking</span>
						</div>
						<p class="text-xs text-slate-500 mt-1 pl-6">Calculate shipping charges via Inside / Sub-Area / Outside city limits</p>
					</button>

					<!-- Option 4: District-wise Booking -->
					<button
						type="button"
						onclick={() => (deliveryBookingType = 'district')}
						class="p-4 rounded-xl border text-left transition-all cursor-pointer {deliveryBookingType === 'district' ? 'border-[#5845eb] bg-indigo-50/40 ring-1 ring-[#5845eb]' : 'border-slate-200 hover:bg-slate-50'}"
					>
						<div class="flex items-center gap-2.5">
							<div class="w-4 h-4 rounded-full border flex items-center justify-center {deliveryBookingType === 'district' ? 'border-[#5845eb]' : 'border-slate-300'}">
								{#if deliveryBookingType === 'district'}
									<div class="w-2 h-2 rounded-full bg-[#5845eb]"></div>
								{/if}
							</div>
							<span class="font-bold text-sm text-slate-900">District-wise Booking</span>
						</div>
						<p class="text-xs text-slate-500 mt-1 pl-6">Calculate shipping charges based on Bangladesh districts</p>
					</button>
				</div>

				<!-- Form Fields for Delivery Options -->
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
					<div class="space-y-1">
						<label for="delivery-title" class="text-[11px] font-bold text-slate-500">Delivery Option Title</label>
						<Input id="delivery-title" type="text" bind:value={deliveryOptionTitle} class="h-10 text-xs" />
					</div>
					<div class="space-y-1">
						<label for="inside-text" class="text-[11px] font-bold text-slate-500">Inside Dhaka Custom Text</label>
						<Input id="inside-text" type="text" bind:value={insideDhakaCustomText} class="h-10 text-xs" />
					</div>
					<div class="space-y-1">
						<label for="outside-text" class="text-[11px] font-bold text-slate-500">Outside Dhaka Custom Text</label>
						<Input id="outside-text" type="text" bind:value={outsideDhakaCustomText} class="h-10 text-xs" />
					</div>
				</div>
			</Card>

			<!-- 6. Success Page Custom Message -->
			<Card id="success-page-message" class="p-6 bg-white border border-slate-200/90 shadow-2xs rounded-2xl space-y-5 scroll-mt-24">
				<div class="border-b border-slate-100 pb-3">
					<h3 class="text-base font-bold text-slate-900">Success Page Custom Message</h3>
					<p class="text-xs text-slate-500 mt-0.5">Customize the message shown to customers after a successful order</p>
				</div>

				<!-- Available Placeholders Alert -->
				<div class="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
					<div class="flex items-center gap-2">
						<Info class="w-4 h-4 text-blue-600 shrink-0" />
						<div>
							<div class="text-xs font-bold text-blue-900">Available Dynamic Placeholders</div>
							<div class="text-[11px] text-blue-700">Click on any placeholder below to insert it into your message</div>
							<button
								type="button"
								onclick={() => (successMessageBody += ' {{orderId}}')}
								class="mt-1.5 px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[11px] font-bold hover:bg-blue-200 transition-colors cursor-pointer"
							>
								&#123;&#123;orderId&#125;&#125;
							</button>
						</div>
					</div>

					<button
						type="button"
						onclick={() => {
							successTitle = 'THANK YOU\nYOUR ORDER IS PLACED';
							successMessageBody = 'THANK YOU\nYOUR ORDER IS PLACED\nWe received your order and will begin processing it soon. Your order information appears below:\nYour order Number: {{orderId}}';
						}}
						class="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
					>
						Insert Sample Message
					</button>
				</div>

				<!-- Formatting Toolbar -->
				<div class="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
					<span class="text-xs font-bold px-2 py-1 text-slate-700 border-r border-slate-200">Normal</span>
					<button type="button" class="p-1 rounded hover:bg-slate-200/60" title="Bold"><Bold class="w-3.5 h-3.5" /></button>
					<button type="button" class="p-1 rounded hover:bg-slate-200/60" title="Italic"><Italic class="w-3.5 h-3.5" /></button>
					<button type="button" class="p-1 rounded hover:bg-slate-200/60" title="Underline"><Underline class="w-3.5 h-3.5" /></button>
					<button type="button" class="p-1 rounded hover:bg-slate-200/60" title="Link"><Link class="w-3.5 h-3.5" /></button>
					<button type="button" class="p-1 rounded hover:bg-slate-200/60" title="List"><List class="w-3.5 h-3.5" /></button>
				</div>

				<!-- Message Inputs -->
				<div class="space-y-3">
					<div class="space-y-1">
						<label for="success-title" class="text-xs font-bold text-slate-700">Order Placed Title</label>
						<Input id="success-title" type="text" bind:value={successTitle} class="h-10 text-xs font-bold" />
					</div>

					<div class="space-y-1">
						<label for="success-body" class="text-xs font-bold text-slate-700">Order Placed Body Message</label>
						<Textarea
							id="success-body"
							rows={4}
							bind:value={successMessageBody}
							class="text-xs leading-relaxed"
						/>
					</div>
				</div>
			</Card>

			<!-- 7. Custom Order Statuses -->
			<Card id="custom-order-statuses" class="p-6 bg-white border border-slate-200/90 shadow-2xs rounded-2xl space-y-5 scroll-mt-24">
				<div class="border-b border-slate-100 pb-3">
					<h3 class="text-base font-bold text-slate-900">Custom Order Statuses</h3>
					<p class="text-xs text-slate-500 mt-0.5">Define custom workflow statuses specific to your shop. They will appear alongside the default statuses in your order list dropdowns, and the storefront.</p>
				</div>

				<div class="flex items-center justify-between gap-4">
					<div>
						<h4 class="text-sm font-bold text-slate-900">Enable Custom Order Status Workflow</h4>
						<p class="text-xs text-slate-500 mt-0.5">Enable this to configure custom order statuses and filter default system statuses</p>
					</div>
					<Switch bind:checked={enableCustomStatusWorkflow} />
				</div>
			</Card>

			<!-- 8. Address Settings -->
			<Card id="address-settings" class="p-6 bg-white border border-slate-200/90 shadow-2xs rounded-2xl space-y-5 scroll-mt-24">
				<div class="border-b border-slate-100 pb-3">
					<h3 class="text-base font-bold text-slate-900">Address Settings</h3>
					<p class="text-xs text-slate-500 mt-0.5">Customize required and optional address fields on the checkout page</p>
				</div>

				<div class="space-y-4">
					<div class="flex items-center justify-between gap-4">
						<div>
							<h4 class="text-sm font-bold text-slate-900">Require Full Delivery Address</h4>
							<p class="text-xs text-slate-500 mt-0.5">Require house number, street, and area details from customer</p>
						</div>
						<Switch bind:checked={requireFullAddress} />
					</div>

					<div class="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
						<div>
							<h4 class="text-sm font-bold text-slate-900">District Selection Dropdown</h4>
							<p class="text-xs text-slate-500 mt-0.5">Show district selection dropdown instead of freeform text input</p>
						</div>
						<Switch bind:checked={showDistrictDropdown} />
					</div>
				</div>
			</Card>

		</div>

		<!-- Right Sticky Navigation Sidebar (Settings Sections) -->
		<div class="lg:col-span-1 sticky top-24 space-y-4">
			<Card class="p-5 bg-white border border-slate-200/90 shadow-2xs rounded-2xl space-y-4">
				<div>
					<h4 class="text-sm font-bold text-slate-900">Settings Sections</h4>
					<p class="text-[11px] text-slate-400 mt-0.5">Quickly scroll to page settings segments</p>
				</div>

				<nav class="space-y-1 text-xs">
					<a
						href="#general-options"
						class="block px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-[#5845eb] hover:bg-slate-50 transition-colors"
					>
						› General Options
					</a>
					<a
						href="#admin-customization"
						class="block px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-[#5845eb] hover:bg-slate-50 transition-colors"
					>
						› Admin Customization
					</a>
					<a
						href="#security-validation"
						class="block px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-[#5845eb] hover:bg-slate-50 transition-colors"
					>
						› Security & Validation
					</a>
					<a
						href="#order-notification"
						class="block px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-[#5845eb] hover:bg-slate-50 transition-colors"
					>
						› Notifications
					</a>
					<a
						href="#delivery-settings"
						class="block px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-[#5845eb] hover:bg-slate-50 transition-colors"
					>
						› Delivery Settings
					</a>
					<a
						href="#success-page-message"
						class="block px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-[#5845eb] hover:bg-slate-50 transition-colors"
					>
						› Success Page Message
					</a>
					<a
						href="#custom-order-statuses"
						class="block px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-[#5845eb] hover:bg-slate-50 transition-colors"
					>
						› Custom Order Statuses
					</a>
					<a
						href="#address-settings"
						class="block px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-[#5845eb] hover:bg-slate-50 transition-colors"
					>
						› Address Settings
					</a>
				</nav>

				<div class="pt-3 border-t border-slate-100">
					<Button
						type="button"
						onclick={() => triggerSave('Order Settings Saved Successfully!')}
						class="w-full gap-1.5 bg-[#5845eb] hover:bg-[#4936d6] text-white font-bold text-xs py-2 rounded-xl shadow-xs"
					>
						<Check class="w-3.5 h-3.5" />
						<span>Save Changes</span>
					</Button>
				</div>
			</Card>
		</div>

	</div>
</div>
