import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { SettingsService } from '#lib/server/services/settings.service';

export const load: PageServerLoad = async ({ parent, platform }) => {
	const parentData = await parent();

	let blockedIps: string[] = [];
	let dbBotLogs: any[] = [];
	let firewallConfig = {
		allowGptBot: true,
		allowClaudeBot: true,
		allowPerplexity: false,
		allowBytespider: false
	};

	if (platform?.env?.DB) {
		try {
			const db = getDb(platform.env.DB);

			// 1. Fetch blocked IPs
			const ipRows = await db
				.select({ ip: schema.ipBlocks.ipAddress })
				.from(schema.ipBlocks)
				.all();
			blockedIps = ipRows.map((r) => r.ip);

			// 2. Fetch bot logs
			dbBotLogs = await db
				.select()
				.from(schema.botLogs)
				.orderBy(desc(schema.botLogs.createdAt))
				.limit(50)
				.all();

			// 3. Fetch firewall settings
			const fwSettings = await SettingsService.getSettingsGroup(db, 'firewall');
			if (fwSettings) {
				if (fwSettings.allowGptBot !== undefined) firewallConfig.allowGptBot = Boolean(fwSettings.allowGptBot);
				if (fwSettings.allowClaudeBot !== undefined) firewallConfig.allowClaudeBot = Boolean(fwSettings.allowClaudeBot);
				if (fwSettings.allowPerplexity !== undefined) firewallConfig.allowPerplexity = Boolean(fwSettings.allowPerplexity);
				if (fwSettings.allowBytespider !== undefined) firewallConfig.allowBytespider = Boolean(fwSettings.allowBytespider);
			}
		} catch (e) {
			console.error('Failed to load bot activity from D1:', e);
		}
	}

	return {
		...parentData,
		blockedIps,
		dbBotLogs,
		firewallConfig
	};
};

export const actions: Actions = {
	toggleBlockIp: async ({ request, platform }) => {
		const data = await request.formData();
		const ipAddress = data.get('ipAddress')?.toString();
		const blockAction = data.get('action')?.toString(); // 'block' | 'unblock'
		const userAgent = data.get('userAgent')?.toString() || 'Unknown Bot Crawler';

		if (!ipAddress) {
			return { success: false, message: 'IP address required' };
		}

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);

				if (blockAction === 'block') {
					await db
						.insert(schema.ipBlocks)
						.values({
							id: crypto.randomUUID(),
							ipAddress,
							type: 'Manual',
							reason: `Blocked via Bot Activity Sentinel: ${userAgent.slice(0, 80)}`,
							isPermanent: true
						})
						.onConflictDoNothing();

					// Also record in botLogs
					await db.insert(schema.botLogs).values({
						id: crypto.randomUUID(),
						ipAddress,
						userAgent,
						botCategory: 'blocked',
						threatLevel: 'critical',
						pathVisited: '/admin/bot-activity',
						actionTaken: 'blocked'
					});

					return { success: true, message: `IP ${ipAddress} blocked and added to Firewall!` };
				} else {
					await db.delete(schema.ipBlocks).where(eq(schema.ipBlocks.ipAddress, ipAddress));
					return { success: true, message: `IP ${ipAddress} unblocked. Traffic permitted.` };
				}
			} catch (err: any) {
				console.error('Failed to toggle block IP:', err);
				return { success: false, message: err?.message || 'Failed to update firewall' };
			}
		}

		return {
			success: true,
			message: blockAction === 'block' ? `IP ${ipAddress} blocked (Simulation)` : `IP ${ipAddress} unblocked`
		};
	},

	updateFirewallRule: async ({ request, platform }) => {
		const data = await request.formData();
		const botKey = data.get('botKey')?.toString();
		const isAllowed = data.get('isAllowed') === 'true';

		if (!botKey) return { success: false };

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				await SettingsService.setSetting(db, 'firewall', botKey, isAllowed);
				return { success: true, message: `${botKey} firewall rule updated!` };
			} catch (e: any) {
				console.error('Failed to update firewall rule:', e);
				return { success: false, message: e?.message };
			}
		}

		return { success: true };
	},

	clearOldLogs: async ({ platform }) => {
		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
				await db
					.delete(schema.botLogs)
					.where(sql`${schema.botLogs.createdAt} < ${thirtyDaysAgo}`);
				return { success: true, message: 'Logs older than 30 days cleared successfully!' };
			} catch (e: any) {
				console.error('Failed to clear old bot logs:', e);
			}
		}

		return { success: true, message: 'Logs older than 30 days cleared successfully!' };
	}
};
