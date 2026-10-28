import { eq, ne, desc, asc, and, sql, inArray, isNull, isNotNull } from 'drizzle-orm';
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
 * Helper to slugify category names (Bangla & English friendly)
 */
function slugify(text: string): string {
	const clean = text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s\u0980-\u09FF-]/g, '')
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return clean || 'cat';
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
			// Auto-seed if empty
			const countResult = await db
				.select({ count: sql<number>`count(*)` })
				.from(schema.categories)
				.all();
			const totalCount = countResult[0]?.count ?? 0;

			if (totalCount === 0) {
				await this.seedInitialCategories(db);
			}

			const conditions: any[] = [];

			// Top-level categories or specific parent
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

			// Performance Optimization: Group by product category in a single query
			let productCountMap = new Map<string, number>();
			try {
				const prodCounts = await db
					.select({
						category: schema.products.category,
						count: sql<number>`count(*)`
					})
					.from(schema.products)
					.where(ne(schema.products.status, 'archived'))
					.groupBy(schema.products.category)
					.all();

				for (const item of prodCounts) {
					if (item.category) {
						productCountMap.set(item.category.toLowerCase().trim(), item.count);
					}
				}
			} catch (e) {
				console.warn('Failed to batch count products for categories:', e);
			}

			const categoriesWithCount = rows.map((cat) => {
				const pCount = productCountMap.get(cat.name.toLowerCase().trim()) ?? 0;
				return {
					id: cat.id,
					name: cat.name,
					slug: cat.slug,
					parentId: cat.parentId,
					image: cat.image || '',
					productsCount: pCount,
					status: cat.isActive ? ('publish' as const) : ('draft' as const),
					priority: cat.sortOrder,
					isLowStock: false,
					isTrash: false,
					createdAt: cat.createdAt
				};
			});

			return categoriesWithCount;
		} catch (error) {
			console.error('Error in CategoryService.listCategories:', error);
			return [];
		}
	}

	/**
	 * Lists sub-categories (items where parentId points to a top-level category)
	 */
	static async listSubCategories(db: DrizzleD1Database<typeof schema>) {
		try {
			// Auto-seed hierarchy if needed
			await this.seedInitialHierarchy(db);

			// Fetch all categories
			const allRows = await db
				.select()
				.from(schema.categories)
				.orderBy(asc(schema.categories.sortOrder), desc(schema.categories.createdAt))
				.all();

			const categoryMap = new Map(allRows.map((c) => [c.id, c]));

			// Sub-categories: parentId is not null, AND parent's parentId IS null
			const subCategories = allRows.filter((c) => {
				if (!c.parentId) return false;
				const parent = categoryMap.get(c.parentId);
				return parent && parent.parentId === null;
			});

			return subCategories.map((sub) => {
				const parent = categoryMap.get(sub.parentId!);
				return {
					id: sub.id,
					name: sub.name,
					slug: sub.slug,
					categoryId: sub.parentId!,
					category: parent ? parent.name : 'Unknown Category',
					image: sub.image || '',
					priority: sub.sortOrder,
					status: sub.isActive ? ('publish' as const) : ('draft' as const),
					productsCount: 0,
					isLowStock: false,
					isTrash: false,
					createdAt: sub.createdAt
				};
			});
		} catch (error) {
			console.error('Error in CategoryService.listSubCategories:', error);
			return [];
		}
	}

	/**
	 * Lists child-categories (items where parentId points to a sub-category)
	 */
	static async listChildCategories(db: DrizzleD1Database<typeof schema>) {
		try {
			await this.seedInitialHierarchy(db);

			const allRows = await db
				.select()
				.from(schema.categories)
				.orderBy(asc(schema.categories.sortOrder), desc(schema.categories.createdAt))
				.all();

			const categoryMap = new Map(allRows.map((c) => [c.id, c]));

			// Child-categories: parentId is not null, AND parent's parentId IS NOT null
			const childCategories = allRows.filter((c) => {
				if (!c.parentId) return false;
				const parent = categoryMap.get(c.parentId);
				return parent && parent.parentId !== null;
			});

			return childCategories.map((child) => {
				const subCategory = categoryMap.get(child.parentId!);
				const mainCategory = subCategory?.parentId ? categoryMap.get(subCategory.parentId) : null;

				return {
					id: child.id,
					name: child.name,
					slug: child.slug,
					subCategoryId: child.parentId!,
					subCategory: subCategory ? subCategory.name : 'Unknown Sub-Category',
					categoryId: mainCategory ? mainCategory.id : '',
					category: mainCategory ? mainCategory.name : 'Unknown Category',
					image: child.image || '',
					priority: child.sortOrder,
					status: child.isActive ? ('publish' as const) : ('draft' as const),
					productsCount: 0,
					isLowStock: false,
					isTrash: false,
					createdAt: child.createdAt
				};
			});
		} catch (error) {
			console.error('Error in CategoryService.listChildCategories:', error);
			return [];
		}
	}

	/**
	 * Returns full hierarchical taxonomy tree for product form cascading dropdowns
	 */
	static async getTaxonomyTree(db: DrizzleD1Database<typeof schema>) {
		try {
			const allRows = await db
				.select()
				.from(schema.categories)
				.where(eq(schema.categories.isActive, true))
				.orderBy(asc(schema.categories.sortOrder), asc(schema.categories.name))
				.all();

			const topLevel = allRows.filter((c) => !c.parentId);
			const subLevel = allRows.filter((c) => {
				if (!c.parentId) return false;
				const p = allRows.find((item) => item.id === c.parentId);
				return p && !p.parentId;
			});
			const childLevel = allRows.filter((c) => {
				if (!c.parentId) return false;
				const p = allRows.find((item) => item.id === c.parentId);
				return p && p.parentId;
			});

			return topLevel.map((cat) => {
				const subs = subLevel.filter((s) => s.parentId === cat.id);
				return {
					id: cat.id,
					name: cat.name,
					slug: cat.slug,
					subCategories: subs.map((sub) => {
						const children = childLevel.filter((ch) => ch.parentId === sub.id);
						return {
							id: sub.id,
							name: sub.name,
							slug: sub.slug,
							childCategories: children.map((ch) => ({
								id: ch.id,
								name: ch.name,
								slug: ch.slug
							}))
						};
					})
				};
			});
		} catch (error) {
			console.error('Error building taxonomy tree:', error);
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

	/**
	 * Seeds initial sub-categories and child-categories if sub-categories are empty
	 */
	static async seedInitialHierarchy(db: DrizzleD1Database<typeof schema>) {
		try {
			const subCountResult = await db
				.select({ count: sql<number>`count(*)` })
				.from(schema.categories)
				.where(isNotNull(schema.categories.parentId))
				.all();
			const subCount = subCountResult[0]?.count ?? 0;

			if (subCount > 0) return;

			// Fetch top-level categories to link to
			const topLevel = await db
				.select()
				.from(schema.categories)
				.where(isNull(schema.categories.parentId))
				.all();

			if (topLevel.length === 0) {
				await this.seedInitialCategories(db);
			}

			const topLevelFresh = await db
				.select()
				.from(schema.categories)
				.where(isNull(schema.categories.parentId))
				.all();

			const electronics = topLevelFresh.find((c) =>
				c.name.toLowerCase().includes('electronic') || c.name.toLowerCase().includes('audio') || c.slug.includes('electronics')
			) || topLevelFresh[0];

			const beauty = topLevelFresh.find((c) =>
				c.name.toLowerCase().includes('beauty') || c.slug.includes('beauty')
			) || topLevelFresh[1] || topLevelFresh[0];

			if (electronics) {
				// 1. Sub-Category: Headphones
				const subHeadphonesId = 'sub-headphones-' + Math.random().toString(36).substring(2, 7);
				await db.insert(schema.categories).values({
					id: subHeadphonesId,
					name: 'Headphones & Earphones',
					slug: 'headphones-earphones',
					parentId: electronics.id,
					sortOrder: 1,
					isActive: true
				}).onConflictDoNothing();

				// Child under Headphones: Wireless ANC
				await db.insert(schema.categories).values({
					id: 'child-wireless-anc-' + Math.random().toString(36).substring(2, 7),
					name: 'Wireless ANC Headphones',
					slug: 'wireless-anc-headphones',
					parentId: subHeadphonesId,
					sortOrder: 1,
					isActive: true
				}).onConflictDoNothing();

				// 2. Sub-Category: Smart Watches
				const subWatchId = 'sub-smart-watch-' + Math.random().toString(36).substring(2, 7);
				await db.insert(schema.categories).values({
					id: subWatchId,
					name: 'Smart Watches & Bands',
					slug: 'smart-watches-bands',
					parentId: electronics.id,
					sortOrder: 2,
					isActive: true
				}).onConflictDoNothing();

				// Child under Smart Watches: Fitness Trackers
				await db.insert(schema.categories).values({
					id: 'child-fitness-trackers-' + Math.random().toString(36).substring(2, 7),
					name: 'Fitness Trackers',
					slug: 'fitness-trackers',
					parentId: subWatchId,
					sortOrder: 1,
					isActive: true
				}).onConflictDoNothing();
			}

			if (beauty && beauty.id !== electronics?.id) {
				// Sub-Category: Skin Care
				const subSkinId = 'sub-skincare-' + Math.random().toString(36).substring(2, 7);
				await db.insert(schema.categories).values({
					id: subSkinId,
					name: 'Skin Care & Cleansers',
					slug: 'skin-care-cleansers',
					parentId: beauty.id,
					sortOrder: 1,
					isActive: true
				}).onConflictDoNothing();

				// Child under Skin Care: Serums
				await db.insert(schema.categories).values({
					id: 'child-face-serums-' + Math.random().toString(36).substring(2, 7),
					name: 'Face Serums & Moisturizers',
					slug: 'face-serums-moisturizers',
					parentId: subSkinId,
					sortOrder: 1,
					isActive: true
				}).onConflictDoNothing();
			}
		} catch (e) {
			console.error('Error seeding initial hierarchy:', e);
		}
	}
}

