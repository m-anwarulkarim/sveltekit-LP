import { createAuthClient } from 'better-auth/svelte';
import { oneTapClient } from 'better-auth/client/plugins';

interface TriggerOptions {
	clientId: string;
	callbackURL?: string;
	context?: 'signin' | 'signup' | 'use';
}

/**
 * Loads the Google One-Tap flow. Because the Google client ID comes from the admin's D1 settings
 * at runtime (not at build time), we construct a dedicated auth client here instead of baking
 * oneTapClient into the shared `authClient`. On page unload / navigation away the prompt closes
 * automatically; nothing persists.
 */
export async function triggerGoogleOneTap({ clientId, callbackURL, context = 'signin' }: TriggerOptions) {
	if (typeof window === 'undefined' || !clientId) return;

	try {
		const client = createAuthClient({
			baseURL: window.location.origin,
			plugins: [oneTapClient({ clientId })]
		});

		await client.oneTap({
			callbackURL: callbackURL || '/account',
			context,
			// If the user dismisses or FedCM denies, we silently stop — the normal login form stays as a fallback.
			onPromptNotification: () => {}
		});
	} catch (err) {
		console.warn('Google One-Tap failed to initialize:', err);
	}
}
