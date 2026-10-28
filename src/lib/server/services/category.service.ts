import { eq, ne, desc, asc, and, sql, inArray, isNull } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export interface CategoryFilterOptions {
	parentId?: string | null;
	status?: 'publish' | 'draft' | 'all';
	search?: string;
	limit?: number;
	offset?: number;
}

export interface CreateCategoryInput {
	name: string;
	slug?: string;
	parentId?: string | null;
	image?: string;
	icon?: string;
	sortOrder?: number;
	isActive?: boolean;
	description?: string;
	seoTitle?: string;
	seoDescription?: string;
}

export interface UpdateCategoryInput {
	name?: string;
	slug?: string;
	parentId?: string | null;
	image?: string;
	icon?: string;
	sortOrder?: number;
	isActive?: boolean;
	description?: string;
	seoTitle?: string;
	seoDescription?: string;
}

/**
 * Helper to slugify category names
 */
function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/**
 * Enterprise Category & Taxonomy Service
 */
export class CategoryService {
	/**
	 * Lists categories with products count and parent/child relationship
	 */
	static async listCategories(
		db: DrizzleD1Database<typeof schema>,
		options: CategoryFilterOptions = {}
	) {
		try {
			// Check if categories table is empty, auto-seed if needed
			const countResult = await db
				.select({ count: sql<number>`count(*)` })
				.from(schema.categories)
				.all();
			const totalCount = countResult[0]?.count ?? 0;

			if (totalCount === 0) {
				await this.seedInitialCategories(db);
			}

			const conditions: any[] = [];

			// Default: Top-level categories have parentId is null
			if (options.parentId !== undefined) {
				if (options.parentId === null) {
					conditions.push(isNull(schema.categories.parentId));
				} else {
					conditions.push(eq(schema.categories.parentId, options.parentId));
				}
			}

			if (options.status && options.status !== 'all') {
				conditions.push(eq(schema.categories.isActive, options.status === 'publish'));
			}

			let query = db.select().from(schema.categories);

			if (conditions.length > 0) {
				query = query.where(and(...conditions)) as any;
			}

			query = query.orderBy(asc(schema.categories.sortOrder), desc(schema.categories.createdAt)) as any;

			if (options.limit) {
				query = query.limit(options.limit) as any;
			}

			if (options.offset) {
				query = query.offset(options.offset) as any;
			}

			const rows = await query.all();

			// Count associated products for each category
			const categoriesWithCount = await Promise.all(
				rows.map(async (cat) => {
					let productsCount = 0;
					try {
						const prodResult = await db
							.select({ count: sql<number>`count(*)` })
							.from(schema.products)
							.where(
								and(
									eq(schema.products.category, cat.name),
									ne(schema.products.status, 'archived')
								)
							)
							.all();
						productsCount = prodResult[0]?.count ?? 0;
					} catch {
						// fallback if products query fails
						productsCount = 0;
					}

					return {
						id: cat.id,
						name: cat.name,
						slug: cat.slug,
						image: cat.image || '',
						productsCount,
						status: cat.isActive ? ('publish' as const) : ('draft' as const),
						priority: cat.sortOrder,
						isLowStock: false,
						isTrash: false,
						createdAt: cat.createdAt
					};
				})
			);

			return categoriesWithCount;
		} catch (error) {
			console.error('Error in CategoryService.listCategories:', error);
			return [];
		}
	}

	/**
	 * Get a category by its ID or Slug
	 */
	static async getCategory(db: DrizzleD1Database<typeof schema>, idOrSlug: string) {
		try {
			const rows = await db
				.select()
				.from(schema.categories)
				.where(sql`${schema.categories.id} = ${idOrSlug} OR ${schema.categories.slug} = ${idOrSlug}`)
				.limit(1)
				.all();
			return rows[0] || null;
		} catch (error) {
			console.error('Error fetching category:', error);
			return null;
		}
	}

	/**
	 * Create a new category
	 */
	static async createCategory(
		db: DrizzleD1Database<typeof schema>,
		input: CreateCategoryInput
	) {
		const id = crypto.randomUUID();
		const baseSlug = input.slug || slugify(input.name) || `cat-${Date.now()}`;
		const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

		await db.insert(schema.categories).values({
			id,
			name: input.name.trim(),
			slug: uniqueSlug,
			parentId: input.parentId || null,
			image: input.image || null,
			icon: input.icon || null,
			description: input.description || null,
			sortOrder: typeof input.sortOrder === 'number' ? input.sortOrder : 0,
			isActive: input.isActive ?? true,
			seoTitle: input.seoTitle || input.name,
			seoDescription: input.seoDescription || null
		});

		return { id, name: input.name, slug: uniqueSlug, success: true };
	}

	/**
	 * Update an existing category
	 */
	static async updateCategory(
		db: DrizzleD1Database<typeof schema>,
		id: string,
		input: UpdateCategoryInput
	) {
		const updateData: any = {};

		if (input.name !== undefined) {
			updateData.name = input.name.trim();
		}
		if (input.image !== undefined) {
			updateData.image = input.image.trim() || null;
		}
		if (input.icon !== undefined) {
			updateData.icon = input.icon.trim() || null;
		}
		if (input.sortOrder !== undefined) {
			updateData.sortOrder = Number(input.sortOrder);
		}
		if (input.isActive !== undefined) {
			updateData.isActive = Boolean(input.isActive);
		}
		if (input.parentId !== undefined) {
			updateData.parentId = input.parentId || null;
		}
		if (input.description !== undefined) {
			updateData.description = input.description;
		}

		await db.update(schema.categories).set(updateData).where(eq(schema.categories.id, id));

		return { id, success: true };
	}

	/**
	 * Toggle category publish / draft status
	 */
	static async toggleStatus(db: DrizzleD1Database<typeof schema>, id: string) {
		const category = await this.getCategory(db, id);
		if (!category) {
			throw new Error('Category not found');
		}

		const newStatus = !category.isActive;
		await db
			.update(schema.categories)
			.set({ isActive: newStatus })
			.where(eq(schema.categories.id, id));

		return { id, newStatus, statusLabel: newStatus ? 'publish' : 'draft' };
	}

	/**
	 * Delete category by ID
	 */
	static async deleteCategory(db: DrizzleD1Database<typeof schema>, id: string) {
		await db.delete(schema.categories).where(eq(schema.categories.id, id));
		return { id, success: true };
	}

	/**
	 * Bulk delete categories
	 */
	static async bulkDeleteCategories(db: DrizzleD1Database<typeof schema>, ids: string[]) {
		if (ids.length === 0) return { count: 0 };
		await db.delete(schema.categories).where(inArray(schema.categories.id, ids));
		return { count: ids.length, success: true };
	}

	/**
	 * Seeds initial categories if the categories table is empty
	 */
	static async seedInitialCategories(db: DrizzleD1Database<typeof schema>) {
		const seedList = [
			{ name: 'Car Colour', priority: 0 },
			{ name: '3d Wall Sticker', priority: 0 },
			{ name: 'Mosquito Lamp', priority: 0 },
			{ name: 'Combo Pack', priority: 0 },
			{ name: 'Hair Care', priority: 0 },
			{ name: 'Home Care', priority: 0 },
			{ name: 'Kitchen Accessories', priority: 0 },
			{ name: 'Gadgets & Devices', priority: 1 },
			{ name: 'Audio & Acoustics', priority: 1 },
			{ name: 'Wireless Chargers', priority: 0 },
			{ name: 'Smart Watch & Bands', priority: 0 },
			{ name: 'Fashion & Eyewear', priority: 0 },
			{ name: 'Travel Essentials', priority: 0 },
			{ name: 'Car Decor & Lighting', priority: 0 },
			{ name: 'Beauty & Skincare', priority: 0 },
			{ name: 'Home Organization', priority: 0 },
			{ name: 'Desk Accessories', priority: 0 },
			{ name: 'Outdoor & Camping', priority: 0 },
			{ name: 'Kids Toys & Learning', priority: 0 },
			{ name: 'Kitchen Appliances', priority: 0 }
		];

		for (const item of seedList) {
			const slug = slugify(item.name);
			try {
				await db
					.insert(schema.categories)
					.values({
						id: crypto.randomUUID(),
						name: item.name,
						slug: `${slug}-${Math.random().toString(36).substring(2, 6)}`,
						sortOrder: item.priority,
						isActive: true,
						image: null
					})
					.onConflictDoNothing();
			} catch (e) {
				console.error(`Failed to seed category ${item.name}:`, e);
			}
		}
	}
}

