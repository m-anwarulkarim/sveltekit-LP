import type { RequestHandler } from './$types';
import { createAuth, resolveAuthOptions } from '#lib/server/auth';
import { getAuthSecret } from '#lib/server/secrets';
import { env as cfEnv } from 'cloudflare:workers';

const handler: RequestHandler = async (event) => {
	const secret = getAuthSecret();
	const d1 = (event.platform as any)?.env?.DB || (cfEnv as any)?.DB;
	if (!secret || !d1) {
		return new Response(JSON.stringify({ error: 'Auth service unavailable' }), {
			status: 503,
			headers: { 'content-type': 'application/json' }
		});
	}

	const authOptions = await resolveAuthOptions(d1);
	const auth = createAuth(d1, secret, event.url.origin, authOptions);
	if (!auth) {
		return new Response(JSON.stringify({ error: 'Auth initialization failed' }), {
			status: 503,
			headers: { 'content-type': 'application/json' }
		});
	}

	return auth.handler(event.request);
};

export const GET = handler;
export const POST = handler;
