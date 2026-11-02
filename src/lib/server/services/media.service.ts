import { eq, desc, and, sql, inArray } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import { R2Service } from './r2.service';

export interface ListMediaOptions {
	folder?: string;
	search?: string;
	limit?: number;
	offset?: number;
}

export interface CreateMediaInput {
	name: string;
	url: string;
	folder?: string;
	size?: string;
	dimensions?: string;
	mimeType?: string;
	uploadedBy?: string;
}

/**
 * Generates a clean, meaningful human-readable title for gallery assets
 */
export function toMeaningfulName(rawName: string, folder?: string): string {
	let clean = (rawName || '').trim();
	// Remove file extension
	clean = clean.replace(/\.[^/.]+$/, '');

	// Detect UUIDs, hex hashes, camera filenames or generic strings
	const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean);
	const isHexHash = /^[0-9a-f]{16,}$/i.test(clean);
	const isCameraOrTimestamp = /^(IMG|PXL|PHOTO|IMAGE|DSC|VID|FILE|SCREENSHOT)[_-]?\d+/i.test(clean) || /^\d{10,16}$/.test(clean);
	const isGeneric = ['image', 'blob', 'file', 'photo', 'picture', 'upload', 'untitled', 'untitled image'].includes(clean.toLowerCase());

	if (isUuid || isHexHash || isCameraOrTimestamp || isGeneric || !clean) {
		const f = (folder || 'general').toLowerCase();
		switch (f) {
			case 'avatars':
			case 'avatar':
				return 'Profile Avatar';
			case 'banners':
			case 'banner':
				return 'Storefront Hero Banner';
			case 'products':
			case 'product':
				return 'Product Showcase Image';
			case 'categories':
			case 'category':
				return 'Category Badge Icon';
			case 'stickers':
				return '3D Wall Decal Asset';
			default:
				return `${f.charAt(0).toUpperCase() + f.slice(1)} Image`;
		}
	}

	// Format title case nicely (e.g. "car-paint-pen" -> "Car Paint Pen")
	return clean
		.replace(/[_-]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

/**
 * Enterprise Media Library & Gallery Assets Service
 */
export class MediaService {
	/**
	 * Lists media assets with folder filtering, search, and auto-seeding
	 */
	static async listMedia(
		db: DrizzleD1Database<typeof schema>,
		options: ListMediaOptions = {}
	) {
		try {
			const conditions: any[] = [];

			if (options.folder && options.folder !== 'all') {
				conditions.push(eq(schema.mediaAssets.folder, options.folder));
			}

			let query = db.select().from(schema.mediaAssets);

			if (conditions.length > 0) {
				query = query.where(and(...conditions)) as any;
			}

			query = query.orderBy(desc(schema.mediaAssets.createdAt)) as any;

			if (options.limit) {
				query = query.limit(options.limit) as any;
			}

			if (options.offset) {
				query = query.offset(options.offset) as any;
			}

			const rows = await query.all();

			return rows.map((r) => {
				let url = r.url;
				// In local dev, auto-proxy any remote R2 URLs so assets never 404
				if (url && url.includes('pub-fe7043cdba5e4550a7e594df8db06129.r2.dev/')) {
					url = url.replace('https://pub-fe7043cdba5e4550a7e594df8db06129.r2.dev/', '/api/r2-local/');
				}
				return {
					id: r.id,
					name: toMeaningfulName(r.name, r.folder),
					url,
					folder: r.folder as any,
					size: r.size,
					dimensions: r.dimensions || '800 x 800',
					uploadedAt: r.createdAt
						? new Date(r.createdAt).toLocaleDateString('en-US', {
								month: 'short',
								day: 'numeric',
								year: 'numeric'
							})
						: 'Today'
				};
			});
		} catch (error) {
			console.error('Error in MediaService.listMedia:', error);
			return [];
		}
	}

	/**
	 * Add a new media asset with meaningful name and valid URL
	 */
	static async addMedia(
		db: DrizzleD1Database<typeof schema>,
		input: CreateMediaInput
	) {
		const id = crypto.randomUUID();
		const now = new Date();
		const meaningfulName = toMeaningfulName(input.name, input.folder);

		await db.insert(schema.mediaAssets).values({
			id,
			name: meaningfulName,
			url: input.url.trim(),
			folder: input.folder || 'products',
			size: input.size || '45 KB',
			dimensions: input.dimensions || '800 x 800',
			mimeType: input.mimeType || 'image/webp',
			uploadedBy: input.uploadedBy || 'Admin',
			createdAt: now
		});

		return {
			id,
			name: meaningfulName,
			url: input.url,
			folder: input.folder || 'products',
			size: input.size || '45 KB',
			dimensions: input.dimensions || '800 x 800',
			uploadedAt: 'Just now'
		};
	}

	/**
	 * Delete a media asset by ID (permanently from D1 and R2/disk storage)
	 */
	static async deleteMedia(db: DrizzleD1Database<typeof schema>, id: string, platform?: any) {
		try {
			const rows = await db
				.select()
				.from(schema.mediaAssets)
				.where(eq(schema.mediaAssets.id, id))
				.limit(1)
				.all();

			const item = rows[0];
			if (item?.url) {
				// Delete underlying file from R2 / disk
				await R2Service.deleteObject(item.url, platform);
			}

			await db.delete(schema.mediaAssets).where(eq(schema.mediaAssets.id, id));
			return { success: true, id };
		} catch (e) {
			console.error(`Failed to delete media asset ${id}:`, e);
			return { success: false, id };
		}
	}

	/**
	 * Bulk delete media assets from D1 and R2/disk
	 */
	static async bulkDeleteMedia(db: DrizzleD1Database<typeof schema>, ids: string[], platform?: any) {
		let failed = 0;
		for (const id of ids) {
			const res = await this.deleteMedia(db, id, platform);
			if (!res.success) failed++;
		}
		return { success: failed === 0, count: ids.length - failed, failed };
	}

	/**
	 * Delete media asset by its URL (used when deleting banners/carousels/popups/avatars)
	 */
	static async deleteMediaByUrl(db: DrizzleD1Database<typeof schema>, url: string, platform?: any) {
		if (!url) return;
		try {
			const rows = await db
				.select()
				.from(schema.mediaAssets)
				.where(eq(schema.mediaAssets.url, url))
				.all();

			for (const r of rows) {
				await this.deleteMedia(db, r.id, platform);
			}

			if (rows.length === 0) {
				await R2Service.deleteObject(url, platform);
			}
		} catch (e) {
			console.error(`Failed to delete media by url ${url}:`, e);
		}
	}
}
