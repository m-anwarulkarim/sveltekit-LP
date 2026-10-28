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
	limit?: number;
	offset?: number;
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
			// Auto-seed initial blocked items if table is empty
			const countRes = await db
				.select({ count: sql<number>`count(*)` })
				.from(schema.ipBlocks)
				.all();
			const totalInDb = countRes[0]?.count ?? 0;

			if (totalInDb === 0) {
				await this.seedInitialBlocked(db);
			}

			const conditions: any[] = [];

			if (options.search && options.search.trim()) {
				const term = `%${options.search.trim()}%`;
				conditions.push(
					or(
						like(schema.ipBlocks.ipAddress, term),
						like(schema.ipBlocks.phoneNo, term)
					)
				);
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
			const totalCount = await this.countBlocked(db);

			const formatted = rows.map((r, idx) => ({
				id: r.id,
				sl: (options.offset || 0) + idx + 1,
				ipAddress: r.ipAddress,
				deviceId: r.deviceId || '-',
				phoneNo: r.phoneNo || '-',
				type: r.type || 'Manual Block',
				blockUntil: r.isPermanent
					? 'Permanent'
					: r.blockUntil
						? new Date(r.blockUntil).toLocaleString('en-US', {
								dateStyle: 'medium',
								timeStyle: 'medium'
							})
						: 'Permanent',
				date: r.createdAt
					? new Date(r.createdAt).toLocaleString('en-US', {
							dateStyle: 'medium',
							timeStyle: 'medium'
						})
					: 'Oct 28, 2026'
			}));

			return {
				items: formatted,
				totalCount
			};
		} catch (error) {
			console.error('Error in SecurityService.listBlockedIps:', error);
			return { items: [], totalCount: 0 };
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

		return { id, ipAddress: input.ipAddress, success: true };
	}

	/**
	 * Unblock IP by ID or IP address
	 */
	static async unblockIp(db: DrizzleD1Database<typeof schema>, idOrIp: string) {
		await db
			.delete(schema.ipBlocks)
			.where(
				or(
					eq(schema.ipBlocks.id, idOrIp),
					eq(schema.ipBlocks.ipAddress, idOrIp)
				)
			);
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
	 * Check if an IP is currently blocked
	 */
	static async isIpBlocked(db: DrizzleD1Database<typeof schema>, ipAddress: string): Promise<boolean> {
		try {
			const rows = await db
				.select()
				.from(schema.ipBlocks)
				.where(eq(schema.ipBlocks.ipAddress, ipAddress))
				.limit(1)
				.all();
			return rows.length > 0;
		} catch {
			return false;
		}
	}

	/**
	 * Auto-seed initial blocked items
	 */
	static async seedInitialBlocked(db: DrizzleD1Database<typeof schema>) {
		const seedData = [
			{
				ip: '2404:1c40:45b:9e22:18dd:246a:9f7c:92a2',
				phone: '01811174567',
				type: 'Auto Block After 1 Orders',
				reason: 'Multiple failed checkout attempts'
			},
			{
				ip: '103.217.111.246',
				phone: '01974142304',
				type: 'Auto Block After 1 Orders',
				reason: 'Fake order address detected'
			},
			{
				ip: '103.75.138.13',
				phone: '01856996410',
				type: 'Auto Block After 1 Orders',
				reason: 'High cancellation rate courier risk'
			},
			{
				ip: '103.167.17.53',
				phone: '+8801763172390',
				type: 'Auto Block After 1 Orders',
				reason: 'Spam order bot attack'
			},
			{
				ip: '103.159.72.71',
				phone: '01862907227',
				type: 'Auto Block After 1 Orders',
				reason: 'Automated scraping and fake carting'
			},
			{
				ip: '203.190.10.74',
				phone: '01727492677',
				type: 'Auto Block After 1 Orders',
				reason: 'Unreachable contact info'
			},
			{
				ip: '103.134.88.19',
				phone: '01711223344',
				type: 'Auto Block After 1 Orders',
				reason: 'Fake OTP verification flood'
			},
			{
				ip: '118.179.223.45',
				phone: '01988776655',
				type: 'Manual Block',
				reason: 'Manual blacklist by admin'
			}
		];

		for (const item of seedData) {
			try {
				await db
					.insert(schema.ipBlocks)
					.values({
						id: crypto.randomUUID(),
						ipAddress: item.ip,
						phoneNo: item.phone,
						type: item.type,
						reason: item.reason,
						isPermanent: item.type === 'Manual Block',
						createdAt: new Date()
					})
					.onConflictDoNothing();
			} catch (e) {
				console.error(`Failed to seed blocked IP ${item.ip}:`, e);
			}
		}
	}
}
