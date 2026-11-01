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

		if (envUrl) {
			return envUrl.replace(/\/+$/, '');
		}

		// In local development or when public domain isn't attached, route via local proxy
		const isLocal =
			dev ||
			(typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') ||
			!platform?.env?.R2_PUBLIC_URL;

		if (isLocal) {
			return '/api/r2-local';
		}

		return R2_DEFAULT_PUBLIC_URL.replace(/\/+$/, '');
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

		// Clean the filename to be meaningful and readable
		let baseName = rawName.replace(/\.[^/.]+$/, '');
		const ext = rawName.includes('.') ? rawName.split('.').pop()?.toLowerCase() || 'png' : 'png';

		const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(baseName);
		if (isUuid || !baseName || ['image', 'blob', 'file', 'photo'].includes(baseName.toLowerCase())) {
			baseName = folder === 'avatars' ? 'profile-avatar' : `${folder}-asset`;
		}

		const cleanSlug = baseName
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9_-]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.slice(0, 36) || 'asset';

		const shortRand = Math.random().toString(36).substring(2, 6);
		const fileName = `${cleanSlug}-${shortRand}.${ext}`;
		const key = `${folder}/${fileName}`;
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
			return {
				key,
				url: `${baseUrl}/${key}`,
				sizeBytes
			};
		}

		// Fallback for local Vite dev if R2 binding isn't directly attached:
		// Save file to static/uploads/ so it has a real persistent URL without inflating D1!
		try {
			if (typeof process !== 'undefined') {
				const fs = await import('node:fs');
				const path = await import('node:path');
				const uploadDir = path.resolve('static/uploads', folder);
				if (!fs.existsSync(uploadDir)) {
					fs.mkdirSync(uploadDir, { recursive: true });
				}
				const filePath = path.resolve(uploadDir, fileName);
				const uint8 = data instanceof Uint8Array ? data : new Uint8Array(data);
				fs.writeFileSync(filePath, uint8);
				const localUrl = `/uploads/${folder}/${path.basename(filePath)}`;
				return {
					key,
					url: localUrl,
					sizeBytes
				};
			}
		} catch (localErr) {
			console.error('Failed to write local upload file:', localErr);
		}

		// Fallback only if filesystem is not writable
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

	/**
	 * Deletes an object from Cloudflare R2 and/or local filesystem
	 */
	static async deleteObject(keyOrUrl: string, platform?: any): Promise<boolean> {
		if (!keyOrUrl) return false;

		let key = keyOrUrl;
		if (key.includes('/api/r2-local/')) {
			key = key.split('/api/r2-local/')[1];
		} else if (key.startsWith('http://') || key.startsWith('https://')) {
			try {
				const parsed = new URL(key);
				key = parsed.pathname.replace(/^\/+/, '');
			} catch {
				// ignore
			}
		} else if (key.startsWith('/uploads/')) {
			try {
				if (typeof process !== 'undefined') {
					const fs = await import('node:fs');
					const path = await import('node:path');
					const localPath = path.resolve('static', key.replace(/^\/+/, ''));
					if (fs.existsSync(localPath)) {
						fs.unlinkSync(localPath);
					}
				}
			} catch (e) {
				console.error('Failed to unlink local upload:', e);
			}
			return true;
		}

		key = key.replace(/^\/+/, '');

		// 1. Delete from R2 bucket binding
		const bucket = this.getBucket(platform);
		if (bucket && typeof bucket.delete === 'function') {
			try {
				await bucket.delete(key);
			} catch (err) {
				console.error(`Failed to delete key ${key} from R2:`, err);
			}
		}

		// 2. Also delete from local static/uploads if file was saved there
		try {
			if (typeof process !== 'undefined') {
				const fs = await import('node:fs');
				const path = await import('node:path');
				const localPath = path.resolve('static/uploads', key);
				if (fs.existsSync(localPath)) {
					fs.unlinkSync(localPath);
				}
			}
		} catch {
			// ignore
		}

		return true;
	}
}
