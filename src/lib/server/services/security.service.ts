import { eq, desc, asc, and, or, sql, inArray, like } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export interface BlockIpInput {
	ipAddress: string;
	phoneNo?: string;
	deviceId?: string;
	type?: string;
	reason?: string;
	isPermanent?: boolean;
	blockUntil?: Date | null;
}

export interface ListBlockedOptions {
	search?: string;
	filterType?: 'all' | 'permanent' | 'auto' | 'manual';
	limit?: number;
	offset?: number;
}

export interface BlockedStats {
	total: number;
	permanent: number;
	auto: number;
	manual: number;
}

/**
 * Enterprise Security & IP/Device Access Sentinel Service
 */
export class SecurityService {
	/**
	 * Lists blocked IP addresses and devices with filtering and pagination
	 */
	static async listBlockedIps(
		db: DrizzleD1Database<typeof schema>,
		options: ListBlockedOptions = {}
	) {
		try {
			const conditions: any[] = [];

			if (options.search && options.search.trim()) {
				const term = `%${options.search.trim()}%`;
				conditions.push(
					or(
						like(schema.ipBlocks.ipAddress, term),
						like(schema.ipBlocks.phoneNo, term),
						like(schema.ipBlocks.reason, term),
						like(schema.ipBlocks.type, term)
					)
				);
			}

			if (options.filterType && options.filterType !== 'all') {
				if (options.filterType === 'permanent') {
					conditions.push(eq(schema.ipBlocks.isPermanent, true));
				} else if (options.filterType === 'auto') {
					conditions.push(like(schema.ipBlocks.type, '%Auto%'));
				} else if (options.filterType === 'manual') {
					conditions.push(like(schema.ipBlocks.type, '%Manual%'));
				}
			}

			let query = db.select().from(schema.ipBlocks);

			if (conditions.length > 0) {
				query = query.where(and(...conditions)) as any;
			}

			query = query.orderBy(desc(schema.ipBlocks.createdAt)) as any;

			if (options.limit) {
				query = query.limit(options.limit) as any;
			}

			if (options.offset) {
				query = query.offset(options.offset) as any;
			}

			const rows = await query.all();

			// Count total matching filtered rows
			let countQuery = db.select({ count: sql<number>`count(*)` }).from(schema.ipBlocks);
			if (conditions.length > 0) {
				countQuery = countQuery.where(and(...conditions)) as any;
			}
			const countResult = await countQuery.all();
			const totalCount = countResult[0]?.count || 0;

			// Summary counts across all blocks
			const allRows = await db
				.select({
					id: schema.ipBlocks.id,
					type: schema.ipBlocks.type,
					isPermanent: schema.ipBlocks.isPermanent
				})
				.from(schema.ipBlocks)
				.all();

			const stats: BlockedStats = {
				total: allRows.length,
				permanent: allRows.filter((r) => r.isPermanent).length,
				auto: allRows.filter((r) => r.type?.toLowerCase().includes('auto')).length,
				manual: allRows.filter((r) => r.type?.toLowerCase().includes('manual')).length
			};

			const formatted = rows.map((r, idx) => ({
				id: r.id,
				sl: (options.offset || 0) + idx + 1,
				ipAddress: r.ipAddress,
				deviceId: r.deviceId || '-',
				phoneNo: r.phoneNo || '-',
				type: r.type || 'Manual Admin Block',
				reason: r.reason || 'Restricted Activity',
				isPermanent: Boolean(r.isPermanent),
				rawBlockUntil: r.blockUntil ? new Date(r.blockUntil).toISOString() : null,
				blockUntil: r.isPermanent
					? 'Permanent'
					: r.blockUntil
						? new Date(r.blockUntil).toLocaleString('en-US', {
								dateStyle: 'medium',
								timeStyle: 'short'
							})
						: 'Permanent',
				date: r.createdAt
					? new Date(r.createdAt).toLocaleString('en-US', {
							dateStyle: 'medium',
							timeStyle: 'short'
						})
					: 'Just Now'
			}));

			return {
				items: formatted,
				totalCount,
				stats
			};
		} catch (error) {
			console.error('Error in SecurityService.listBlockedIps:', error);
			return {
				items: [],
				totalCount: 0,
				stats: { total: 0, permanent: 0, auto: 0, manual: 0 }
			};
		}
	}

	/**
	 * Total count of blocked IPs
	 */
	static async countBlocked(db: DrizzleD1Database<typeof schema>): Promise<number> {
		try {
			const res = await db
				.select({ count: sql<number>`count(*)` })
				.from(schema.ipBlocks)
				.all();
			return res[0]?.count || 0;
		} catch {
			return 0;
		}
	}

	/**
	 * Block an IP address / phone
	 */
	static async blockIp(db: DrizzleD1Database<typeof schema>, input: BlockIpInput) {
		const id = crypto.randomUUID();
		const now = new Date();

		await db.insert(schema.ipBlocks).values({
			id,
			ipAddress: input.ipAddress.trim(),
			phoneNo: input.phoneNo?.trim() || null,
			deviceId: input.deviceId?.trim() || null,
			type: input.type || 'Manual Admin Block',
			reason: input.reason || 'Suspected Fraudulent Orders',
			isPermanent: input.isPermanent ?? true,
			blockUntil: input.blockUntil || null,
			createdAt: now
		});

		return { id, ipAddress: input.ipAddress, phoneNo: input.phoneNo, success: true };
	}

	/**
	 * Update an existing block
	 */
	static async updateBlock(
		db: DrizzleD1Database<typeof schema>,
		id: string,
		updates: Partial<BlockIpInput>
	) {
		const updateData: Record<string, any> = {};
		if (updates.ipAddress !== undefined) updateData.ipAddress = updates.ipAddress.trim();
		if (updates.phoneNo !== undefined) updateData.phoneNo = updates.phoneNo.trim() || null;
		if (updates.reason !== undefined) updateData.reason = updates.reason.trim();
		if (updates.type !== undefined) updateData.type = updates.type;
		if (updates.isPermanent !== undefined) updateData.isPermanent = updates.isPermanent;
		if (updates.blockUntil !== undefined) updateData.blockUntil = updates.blockUntil;

		await db.update(schema.ipBlocks).set(updateData).where(eq(schema.ipBlocks.id, id));
		return { success: true };
	}

	/**
	 * Unblock IP by ID or IP address
	 */
	static async unblockIp(db: DrizzleD1Database<typeof schema>, idOrIp: string) {
		await db
			.delete(schema.ipBlocks)
			.where(or(eq(schema.ipBlocks.id, idOrIp), eq(schema.ipBlocks.ipAddress, idOrIp)));
		return { success: true };
	}

	/**
	 * Bulk unblock multiple IDs
	 */
	static async bulkUnblock(db: DrizzleD1Database<typeof schema>, ids: string[]) {
		if (ids.length === 0) return { count: 0 };
		await db.delete(schema.ipBlocks).where(inArray(schema.ipBlocks.id, ids));
		return { count: ids.length, success: true };
	}

	/**
	 * Check if an IP address or phone number is currently blocked
	 */
	static async isBlocked(
		db: DrizzleD1Database<typeof schema>,
		ipAddress: string,
		phoneNo?: string
	): Promise<{ blocked: boolean; reason?: string }> {
		try {
			const conditions = [eq(schema.ipBlocks.ipAddress, ipAddress)];
			if (phoneNo && phoneNo.trim()) {
				conditions.push(eq(schema.ipBlocks.phoneNo, phoneNo.trim()));
			}

			const rows = await db
				.select()
				.from(schema.ipBlocks)
				.where(or(...conditions))
				.all();

			if (rows.length === 0) return { blocked: false };

			const now = new Date();
			const activeBlock = rows.find(
				(r) => r.isPermanent || (r.blockUntil && new Date(r.blockUntil) > now)
			);

			if (activeBlock) {
				return { blocked: true, reason: activeBlock.reason };
			}

			return { blocked: false };
		} catch {
			return { blocked: false };
		}
	}
}
