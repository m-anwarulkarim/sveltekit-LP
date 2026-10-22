import type { Handle } from '@sveltejs/kit/hooks';
import { building } from '$app/env';
import { createAuth } from '#lib/server/auth.ts';
import { svelteKitHandler } from 'better-auth/svelte-kit';

export const handle: Handle = async ({ event, resolve }) => {
	try {
		// If D1 is bound (via Cloudflare Pages or Wrangler), initialize Better Auth
		if (event.platform?.env?.DB) {
			const secret = event.platform.env.BETTER_AUTH_SECRET;
			const baseURL = event.platform.env.ORIGIN || event.url.origin;
			const auth = createAuth(event.platform.env.DB, secret, baseURL);

			if (auth) {
				event.locals.auth = auth;
				try {
					const session = await auth.api.getSession({ headers: event.request.headers });
					if (session) {
						event.locals.session = session.session;
						event.locals.user = session.user;
					}
				} catch (e) {
					console.warn('Session verification notice:', e);
				}

				return await svelteKitHandler({ event, resolve, auth, building });
			}
		}
	} catch (error) {
		console.error('Handled Better Auth middleware exception:', error);
	}

	// Safe fallback so the application never crashes with Error 1101
	return resolve(event);
};
