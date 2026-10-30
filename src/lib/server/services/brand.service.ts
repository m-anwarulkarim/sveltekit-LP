import { eq, desc, asc, and, or, like, sql, inArray } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export interface BrandItem {
	id: string;
	name: string;
	slug: string;
	logo?: string | null;
	website?: string | null;
	isActive: boolean;
	isFeatured: boolean;
	sortOrder: number;
	isTrash: boolean;
	createdAt: number | Date;
	updatedAt?: number | Date;
	productsCount?: number;
}

export interface BrandCounts {
	allCount: number;
	publishCount: number;
	draftCount: number;
	trashCount: number;
}

function slugify(text: string): string {
	const clean = text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s\u0980-\u09FF-]/g, '')
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return clean || 'brand';
}

export class BrandService {
	/**
	 * Lists active brands for storefront display
	 */
	static async listBrands(db: DrizzleD1Database<typeof schema>, limit = 50): Promise<BrandItem[]> {
		try {
			const rows = await db
				.select()
				.from(schema.brands)
				.where(and(eq(schema.brands.isActive, true), eq(schema.brands.isTrash, false)))
				.orderBy(asc(schema.brands.sortOrder), asc(schema.brands.name))
				.limit(limit)
				.all();

			return rows.map((b) => ({
				id: b.id,
				name: b.name,
				slug: b.slug,
				logo: b.logo,
				website: b.website,
				isActive: Boolean(b.isActive),
				isFeatured: Boolean(b.isFeatured),
				sortOrder: Number(b.sortOrder) || 0,
				isTrash: Boolean(b.isTrash),
				createdAt: b.createdAt
			}));
		} catch (error) {
			console.error('Error fetching brands in BrandService.listBrands:', error);
			return [];
		}
	}

	/**
	 * Lists all brands for Admin Catalog with products count and tab stats
	 */
	static async listBrandsAdmin(
		db: DrizzleD1Database<typeof schema>,
		options?: {
			search?: string;
			tab?: 'all' | 'publish' | 'draft' | 'trash';
		}
	): Promise<{ brands: BrandItem[]; counts: BrandCounts }> {
		try {
			// 1. Fetch all brand rows to calculate exact tab counts
			const allRows = await db
				.select()
				.from(schema.brands)
				.orderBy(asc(schema.brands.sortOrder), desc(schema.brands.createdAt))
				.all();

			// 2. Fetch product counts grouped by brandId
			const productCounts = await db
				.select({
					brandId: schema.products.brandId,
					count: sql<number>`count(*)`
				})
				.from(schema.products)
				.groupBy(schema.products.brandId)
				.all();

			const countMap = new Map<string, number>();
			for (const pc of productCounts) {
				if (pc.brandId) {
					countMap.set(pc.brandId, Number(pc.count) || 0);
				}
			}

			// 3. Tab counters
			const counts: BrandCounts = {
				allCount: allRows.filter((b) => !b.isTrash).length,
				publishCount: allRows.filter((b) => !b.isTrash && b.isActive).length,
				draftCount: allRows.filter((b) => !b.isTrash && !b.isActive).length,
				trashCount: allRows.filter((b) => b.isTrash).length
			};

			// 4. Filter according to search and tab
			const search = options?.search?.trim().toLowerCase();
			const tab = options?.tab || 'all';

			let filtered = allRows.filter((b) => {
				if (tab === 'trash') return b.isTrash;
				if (b.isTrash) return false;
				if (tab === 'publish') return b.isActive;
				if (tab === 'draft') return !b.isActive;
				return true; // 'all'
			});

			if (search) {
				filtered = filtered.filter(
					(b) =>
						b.name.toLowerCase().includes(search) ||
						(b.slug && b.slug.toLowerCase().includes(search))
				);
			}

			const mapped: BrandItem[] = filtered.map((b) => ({
				id: b.id,
				name: b.name,
				slug: b.slug,
				logo: b.logo,
				website: b.website,
				isActive: Boolean(b.isActive),
				isFeatured: Boolean(b.isFeatured),
				sortOrder: Number(b.sortOrder) || 0,
				isTrash: Boolean(b.isTrash),
				createdAt: b.createdAt,
				productsCount: countMap.get(b.id) || 0
			}));

			return { brands: mapped, counts };
		} catch (error) {
			console.error('Error fetching admin brands:', error);
			return {
				brands: [],
				counts: { allCount: 0, publishCount: 0, draftCount: 0, trashCount: 0 }
			};
		}
	}

	/**
	 * Creates a new brand with safe unique slug
	 */
	static async createBrand(
		db: DrizzleD1Database<typeof schema>,
		input: {
			name: string;
			slug?: string;
			logo?: string;
			website?: string;
			isActive?: boolean;
			isFeatured?: boolean;
			sortOrder?: number;
		}
	): Promise<BrandItem> {
		const baseSlug = input.slug?.trim() || slugify(input.name);
		let finalSlug = baseSlug;
		let suffix = 1;

		// Check and ensure slug uniqueness
		while (true) {
			const existing = await db
				.select({ id: schema.brands.id })
				.from(schema.brands)
				.where(eq(schema.brands.slug, finalSlug))
				.get();

			if (!existing) break;
			finalSlug = `${baseSlug}-${suffix++}`;
		}

		const newId = `brand-${crypto.randomUUID().slice(0, 8)}`;
		const now = Date.now();

		await db.insert(schema.brands).values({
			id: newId,
			name: input.name.trim(),
			slug: finalSlug,
			logo: input.logo?.trim() || null,
			website: input.website?.trim() || null,
			isActive: input.isActive ?? true,
			isFeatured: input.isFeatured ?? false,
			sortOrder: Number(input.sortOrder) || 0,
			isTrash: false,
			createdAt: new Date(now),
			updatedAt: new Date(now)
		});

		return {
			id: newId,
			name: input.name.trim(),
			slug: finalSlug,
			logo: input.logo?.trim() || null,
			website: input.website?.trim() || null,
			isActive: input.isActive ?? true,
			isFeatured: input.isFeatured ?? false,
			sortOrder: Number(input.sortOrder) || 0,
			isTrash: false,
			createdAt: now,
			productsCount: 0
		};
	}

	/**
	 * Updates existing brand
	 */
	static async updateBrand(
		db: DrizzleD1Database<typeof schema>,
		id: string,
		input: Partial<{
			name: string;
			slug: string;
			logo: string | null;
			website: string | null;
			isActive: boolean;
			isFeatured: boolean;
			sortOrder: number;
			isTrash: boolean;
		}>
	): Promise<boolean> {
		try {
			const updateValues: Record<string, any> = {
				updatedAt: new Date()
			};

			if (input.name !== undefined) updateValues.name = input.name.trim();
			if (input.logo !== undefined) updateValues.logo = input.logo?.trim() || null;
			if (input.website !== undefined) updateValues.website = input.website?.trim() || null;
			if (input.isActive !== undefined) updateValues.isActive = Boolean(input.isActive);
			if (input.isFeatured !== undefined) updateValues.isFeatured = Boolean(input.isFeatured);
			if (input.sortOrder !== undefined) updateValues.sortOrder = Number(input.sortOrder) || 0;
			if (input.isTrash !== undefined) updateValues.isTrash = Boolean(input.isTrash);

			if (input.slug !== undefined && input.slug.trim()) {
				const checkSlug = slugify(input.slug);
				const existing = await db
					.select({ id: schema.brands.id })
					.from(schema.brands)
					.where(and(eq(schema.brands.slug, checkSlug), sql`${schema.brands.id} != ${id}`))
					.get();

				if (!existing) {
					updateValues.slug = checkSlug;
				}
			}

			await db.update(schema.brands).set(updateValues).where(eq(schema.brands.id, id));
			return true;
		} catch (error) {
			console.error('Failed to update brand:', error);
			return false;
		}
	}

	/**
	 * Toggles active status of a brand
	 */
	static async toggleStatus(
		db: DrizzleD1Database<typeof schema>,
		id: string
	): Promise<{ success: boolean; newStatus: boolean }> {
		try {
			const row = await db
				.select({ isActive: schema.brands.isActive })
				.from(schema.brands)
				.where(eq(schema.brands.id, id))
				.get();

			if (!row) return { success: false, newStatus: false };

			const newStatus = !row.isActive;
			await db
				.update(schema.brands)
				.set({ isActive: newStatus, updatedAt: new Date() })
				.where(eq(schema.brands.id, id));

			return { success: true, newStatus };
		} catch (error) {
			console.error('Failed to toggle brand status:', error);
			return { success: false, newStatus: false };
		}
	}

	/**
	 * Soft deletes brand by moving to trash
	 */
	static async moveToTrash(db: DrizzleD1Database<typeof schema>, id: string): Promise<boolean> {
		try {
			await db
				.update(schema.brands)
				.set({ isTrash: true, updatedAt: new Date() })
				.where(eq(schema.brands.id, id));
			return true;
		} catch (error) {
			console.error('Failed to move brand to trash:', error);
			return false;
		}
	}

	/**
	 * Restores brand from trash
	 */
	static async restoreBrand(db: DrizzleD1Database<typeof schema>, id: string): Promise<boolean> {
		try {
			await db
				.update(schema.brands)
				.set({ isTrash: false, updatedAt: new Date() })
				.where(eq(schema.brands.id, id));
			return true;
		} catch (error) {
			console.error('Failed to restore brand from trash:', error);
			return false;
		}
	}

	/**
	 * Permanently deletes brand with safe FK dissociation in products table
	 */
	static async deletePermanently(db: DrizzleD1Database<typeof schema>, id: string): Promise<boolean> {
		try {
			// 1. Dissociate products so foreign key constraints are never violated
			await db
				.update(schema.products)
				.set({ brandId: null })
				.where(eq(schema.products.brandId, id));

			// 2. Delete row from brands table
			await db.delete(schema.brands).where(eq(schema.brands.id, id));
			return true;
		} catch (error) {
			console.error('Failed to permanently delete brand:', error);
			return false;
		}
	}

	/**
	 * Performs bulk actions on multiple brand IDs
	 */
	static async bulkAction(
		db: DrizzleD1Database<typeof schema>,
		ids: string[],
		action: 'publish' | 'draft' | 'trash' | 'restore' | 'delete'
	): Promise<{ success: boolean; count: number }> {
		if (!ids || ids.length === 0) return { success: true, count: 0 };

		try {
			if (action === 'publish') {
				await db
					.update(schema.brands)
					.set({ isActive: true, isTrash: false, updatedAt: new Date() })
					.where(inArray(schema.brands.id, ids));
			} else if (action === 'draft') {
				await db
					.update(schema.brands)
					.set({ isActive: false, isTrash: false, updatedAt: new Date() })
					.where(inArray(schema.brands.id, ids));
			} else if (action === 'trash') {
				await db
					.update(schema.brands)
					.set({ isTrash: true, updatedAt: new Date() })
					.where(inArray(schema.brands.id, ids));
			} else if (action === 'restore') {
				await db
					.update(schema.brands)
					.set({ isTrash: false, updatedAt: new Date() })
					.where(inArray(schema.brands.id, ids));
			} else if (action === 'delete') {
				// Dissociate FK in products
				await db
					.update(schema.products)
					.set({ brandId: null })
					.where(inArray(schema.products.brandId, ids));

				// Hard delete
				await db.delete(schema.brands).where(inArray(schema.brands.id, ids));
			}

			return { success: true, count: ids.length };
		} catch (error) {
			console.error('Failed to perform bulk action on brands:', error);
			return { success: false, count: 0 };
		}
	}
}
