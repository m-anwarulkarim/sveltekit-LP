import { eq, desc, asc, and, sql, inArray } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export interface TagFilterOptions {
	status?: 'publish' | 'draft' | 'all';
	search?: string;
	limit?: number;
	offset?: number;
}

export interface CreateTagInput {
	name: string;
	slug?: string;
	homeShow?: 'Yes' | 'No';
	priority?: string | number;
	status?: 'publish' | 'draft';
	badgeColor?: string;
}

export interface UpdateTagInput {
	name?: string;
	slug?: string;
	homeShow?: 'Yes' | 'No';
	priority?: string | number;
	status?: 'publish' | 'draft';
	badgeColor?: string;
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/**
 * Enterprise Product Tag & Filter Taxonomy Service
 */
export class TagService {
	/**
	 * Lists tags with status and auto-seeding
	 */
	static async listTags(
		db: DrizzleD1Database<typeof schema>,
		options: TagFilterOptions = {}
	) {
		try {
			// Auto-seed if tags table is empty
			const countResult = await db
				.select({ count: sql<number>`count(*)` })
				.from(schema.tags)
				.all();
			const totalCount = countResult[0]?.count ?? 0;

			if (totalCount === 0) {
				await this.seedInitialTags(db);
			}

			const conditions: any[] = [];

			if (options.status && options.status !== 'all') {
				conditions.push(eq(schema.tags.isActive, options.status === 'publish'));
			}

			let query = db.select().from(schema.tags);

			if (conditions.length > 0) {
				query = query.where(and(...conditions)) as any;
			}

			query = query.orderBy(desc(schema.tags.createdAt)) as any;

			if (options.limit) {
				query = query.limit(options.limit) as any;
			}

			if (options.offset) {
				query = query.offset(options.offset) as any;
			}

			const rows = await query.all();

			return rows.map((t, idx) => ({
				id: t.id,
				sl: idx + 1,
				name: t.name,
				date: t.createdAt
					? new Date(t.createdAt).toLocaleDateString('en-US', {
							month: 'short',
							day: 'numeric',
							year: 'numeric'
						})
					: 'Today',
				homeShow: (t.homeShow as 'Yes' | 'No') || 'Yes',
				priority: t.priority ?? '-',
				status: t.isActive ? ('publish' as const) : ('draft' as const),
				isLowStock: false,
				isTrash: false
			}));
		} catch (error) {
			console.error('Error in TagService.listTags:', error);
			return [];
		}
	}

	/**
	 * Get tag by ID or Slug
	 */
	static async getTag(db: DrizzleD1Database<typeof schema>, idOrSlug: string) {
		try {
			const rows = await db
				.select()
				.from(schema.tags)
				.where(sql`${schema.tags.id} = ${idOrSlug} OR ${schema.tags.slug} = ${idOrSlug}`)
				.limit(1)
				.all();
			return rows[0] || null;
		} catch (error) {
			console.error('Error fetching tag:', error);
			return null;
		}
	}

	/**
	 * Create a new tag
	 */
	static async createTag(db: DrizzleD1Database<typeof schema>, input: CreateTagInput) {
		const id = crypto.randomUUID();
		const baseSlug = input.slug || slugify(input.name) || `tag-${Date.now()}`;
		const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

		await db.insert(schema.tags).values({
			id,
			name: input.name.trim(),
			slug: uniqueSlug,
			homeShow: input.homeShow || 'Yes',
			priority: input.priority ? String(input.priority) : '-',
			isActive: input.status !== 'draft',
			badgeColor: input.badgeColor || 'bg-indigo-50 text-indigo-700'
		});

		return { id, name: input.name, slug: uniqueSlug, success: true };
	}

	/**
	 * Update an existing tag
	 */
	static async updateTag(
		db: DrizzleD1Database<typeof schema>,
		id: string,
		input: UpdateTagInput
	) {
		const updateData: any = {};

		if (input.name !== undefined) {
			updateData.name = input.name.trim();
		}
		if (input.homeShow !== undefined) {
			updateData.homeShow = input.homeShow;
		}
		if (input.priority !== undefined) {
			updateData.priority = String(input.priority);
		}
		if (input.status !== undefined) {
			updateData.isActive = input.status === 'publish';
		}
		if (input.badgeColor !== undefined) {
			updateData.badgeColor = input.badgeColor;
		}

		await db.update(schema.tags).set(updateData).where(eq(schema.tags.id, id));

		return { id, success: true };
	}

	/**
	 * Toggle tag publish / draft status
	 */
	static async toggleStatus(db: DrizzleD1Database<typeof schema>, id: string) {
		const tag = await this.getTag(db, id);
		if (!tag) {
			throw new Error('Tag not found');
		}

		const newStatus = !tag.isActive;
		await db
			.update(schema.tags)
			.set({ isActive: newStatus })
			.where(eq(schema.tags.id, id));

		return { id, newStatus, statusLabel: newStatus ? 'publish' : 'draft' };
	}

	/**
	 * Delete tag by ID
	 */
	static async deleteTag(db: DrizzleD1Database<typeof schema>, id: string) {
		await db.delete(schema.tags).where(eq(schema.tags.id, id));
		return { id, success: true };
	}

	/**
	 * Bulk delete tags
	 */
	static async bulkDeleteTags(db: DrizzleD1Database<typeof schema>, ids: string[]) {
		if (ids.length === 0) return { count: 0 };
		await db.delete(schema.tags).where(inArray(schema.tags.id, ids));
		return { count: ids.length, success: true };
	}

	/**
	 * Seed initial tags if table is empty
	 */
	static async seedInitialTags(db: DrizzleD1Database<typeof schema>) {
		const seedList = [
			{ name: 'Flash Deals', homeShow: 'Yes', priority: '11' },
			{ name: 'Best Sale Products', homeShow: 'Yes', priority: '-' },
			{ name: 'Flash Sale', homeShow: 'Yes', priority: '-' },
			{ name: 'Popular Products', homeShow: 'Yes', priority: '-' },
			{ name: 'New Arrival', homeShow: 'Yes', priority: '-' }
		];

		for (const item of seedList) {
			const slug = slugify(item.name);
			try {
				await db
					.insert(schema.tags)
					.values({
						id: crypto.randomUUID(),
						name: item.name,
						slug: `${slug}-${Math.random().toString(36).substring(2, 6)}`,
						homeShow: item.homeShow,
						priority: item.priority,
						isActive: true,
						badgeColor: 'bg-indigo-50 text-indigo-700'
					})
					.onConflictDoNothing();
			} catch (e) {
				console.error(`Failed to seed tag ${item.name}:`, e);
			}
		}
	}
}
