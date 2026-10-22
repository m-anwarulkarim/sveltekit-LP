import type { Handle } from '@sveltejs/kit/hooks';
import { building } from '$app/env';
import { createAuth } from '#lib/server/auth.ts';
import { svelteKitHandler } from 'better-auth/svelte-kit';

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	// If D1 is bound (via Cloudflare Pages or Wrangler), initialize Better Auth
	if (event.platform?.env?.DB) {
		event.locals.auth = createAuth(event.platform.env.DB);
		const { auth } = event.locals;
		try {
			const session = await auth.api.getSession({ headers: event.request.headers });
			if (session) {
				event.locals.session = session.session;
				event.locals.user = session.user;
			}
		} catch (e) {
			console.warn('Session verification notice:', e);
		}
		return svelteKitHandler({ event, resolve, auth, building });
	}

	// Graceful fallback for local development without active D1 binding
	return resolve(event);
};

export const handle: Handle = handleBetterAuth;
