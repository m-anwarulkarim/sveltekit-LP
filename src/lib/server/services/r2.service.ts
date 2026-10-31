import { env as cfEnv } from 'cloudflare:workers';
import { DEV as dev } from 'esm-env';

export interface UploadOptions {
	platform?: any;
	folder?: string;
	filename?: string;
	mimeType?: string;
}

export const R2_DEFAULT_PUBLIC_URL = 'https://pub-fe7043cdba5e4550a7e594df8db06129.r2.dev';

export class R2Service {
	/**
	 * Resolves the active Cloudflare R2 bucket binding
	 */
	static getBucket(platform?: any): any {
		return (
			platform?.env?.R2 ||
			platform?.R2 ||
			(cfEnv as any)?.R2 ||
			(globalThis as any).__DEV_R2__ ||
			null
		);
	}

	/**
	 * Resolves the public CDN URL for the R2 bucket
	 */
	static getPublicBaseUrl(platform?: any): string {
		const envUrl =
			platform?.env?.R2_PUBLIC_URL ||
			(typeof process !== 'undefined' && process.env?.R2_PUBLIC_URL) ||
			(cfEnv as any)?.R2_PUBLIC_URL;
		return (envUrl || R2_DEFAULT_PUBLIC_URL).replace(/\/+$/, '');
	}

	/**
	 * Upload binary array buffer or stream to Cloudflare R2
	 */
	static async uploadBuffer(
		data: ArrayBuffer | Uint8Array,
		options: UploadOptions = {}
	): Promise<{ key: string; url: string; sizeBytes: number }> {
		const folder = (options.folder || 'products').replace(/^\/+|\/+$/g, '');
		const rawName = options.filename || `image-${Date.now()}.png`;
		const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');
		const key = `${folder}/${Date.now()}-${safeName}`;
		const mimeType = options.mimeType || 'image/webp';
		const sizeBytes = data.byteLength;

		const bucket = this.getBucket(options.platform);
		const baseUrl = this.getPublicBaseUrl(options.platform);

		if (bucket && typeof bucket.put === 'function') {
			await bucket.put(key, data, {
				httpMetadata: {
					contentType: mimeType,
					cacheControl: 'public, max-age=31536000, immutable'
				}
			});
			const finalUrl = dev ? `/api/r2-local/${key}` : `${baseUrl}/${key}`;
			return {
				key,
				url: finalUrl,
				sizeBytes
			};
		}

		// Fallback for local Vite dev if R2 binding isn't directly attached:
		// Convert buffer to dataUrl so local preview works seamlessly
		const uint8 = data instanceof Uint8Array ? data : new Uint8Array(data);
		const base64 = Buffer.from(uint8).toString('base64');
		const dataUrl = `data:${mimeType};base64,${base64}`;
		return {
			key,
			url: dataUrl,
			sizeBytes
		};
	}

	/**
	 * Converts Base64 data URI to binary and uploads directly to R2
	 */
	static async uploadBase64(
		dataUri: string,
		options: UploadOptions = {}
	): Promise<{ key: string; url: string; sizeBytes: number }> {
		if (!dataUri.startsWith('data:')) {
			// Already an external or public URL
			return { key: '', url: dataUri, sizeBytes: 0 };
		}

		const match = dataUri.match(/^data:([^;]+);base64,(.*)$/);
		if (!match) {
			throw new Error('Invalid base64 data URI format');
		}

		const mimeType = match[1];
		const base64Str = match[2];
		const buffer = Buffer.from(base64Str, 'base64');

		return this.uploadBuffer(buffer, {
			...options,
			mimeType: options.mimeType || mimeType
		});
	}
}
