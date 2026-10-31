import type { RequestHandler } from './$types';
import { R2Service, R2_DEFAULT_PUBLIC_URL } from '#lib/server/services/r2.service';

export const GET: RequestHandler = async ({ params, platform }) => {
	const key = params.key;
	if (!key) {
		return new Response('Not Found', { status: 404 });
	}

	const bucket = R2Service.getBucket(platform);

	if (bucket && typeof bucket.get === 'function') {
		try {
			const obj = await bucket.get(key);
			if (obj) {
				const headers = new Headers();
				if (typeof obj.writeHttpMetadata === 'function') {
					obj.writeHttpMetadata(headers);
				}
				if (obj.httpEtag) {
					headers.set('etag', obj.httpEtag);
				}
				headers.set('cache-control', 'public, max-age=31536000');
				return new Response(obj.body, { headers });
			}
		} catch (e) {
			console.error('Error fetching local R2 object:', e);
		}
	}

	// If not found in local miniflare bucket, fallback to real Cloudflare R2 public CDN
	return Response.redirect(`${R2_DEFAULT_PUBLIC_URL}/${key}`, 302);
};
