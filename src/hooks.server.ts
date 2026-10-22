import type { Handle } from '@sveltejs/kit/hooks';
import { building } from '$app/env';
import { createAuth } from '#lib/server/auth.ts';
import { svelteKitHandler } from 'better-auth/svelte-kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Skip middleware entirely for static assets or favicon
	if (event.url.pathname === '/favicon.ico' || event.url.pathname.startsWith('/images/')) {
		return resolve(event);
	}

	try {
		if (event.platform?.env?.DB) {
			const secret = event.platform.env.BETTER_AUTH_SECRET || 'aura_acoustics_production_jwt_sec_99881122';
			const baseURL = event.platform.env.ORIGIN || event.url.origin;
			const auth = createAuth(event.platform.env.DB, secret, baseURL);

			if (auth) {
				event.locals.auth = auth;

				// Only check session if the auth cookie is present
				const hasSessionCookie = event.cookies.get('better-auth.session_token') || event.request.headers.get('cookie')?.includes('better-auth.session_token');
				if (hasSessionCookie) {
					try {
						const session = await auth.api.getSession({ headers: event.request.headers });
						if (session) {
							event.locals.session = session.session;
							event.locals.user = session.user;
						}
					} catch (e) {
						console.warn('Session verification notice:', e);
					}
				}

				// Handle Better Auth API endpoints
				if (event.url.pathname.startsWith('/api/auth')) {
					return await svelteKitHandler({ event, resolve, auth, building });
				}
			}
		}
	} catch (error) {
		console.error('Handled Better Auth middleware exception:', error);
	}

	// Safe fallback so the application never crashes with Error 1101
	return resolve(event);
};
