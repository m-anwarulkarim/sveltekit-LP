import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { SettingsService } from '#lib/server/services/settings.service';

const IP_PATTERN = /^(\d{1,3}\.){3}\d{1,3}$|^[0-9a-f:]{3,39}$/i;

function requireOwner(locals: App.Locals) {
	if (locals.admin?.role !== 'Owner') {
		return fail(403, { message: 'এই অ্যাকশনটি শুধুমাত্র Owner করতে পারবেন।' });
	}
}

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

	try {
		const db = getDb(platform);

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

	return {
		...parentData,
		blockedIps,
		dbBotLogs,
		firewallConfig
	};
};

export const actions: Actions = {
	toggleBlockIp: async ({ request, platform, locals }) => {
		const guard = requireOwner(locals);
		if (guard) return guard;

		const data = await request.formData();
		const ipAddress = data.get('ipAddress')?.toString()?.trim();
		const blockAction = data.get('action')?.toString();
		const userAgent = data.get('userAgent')?.toString() || 'Unknown Bot Crawler';

		if (!ipAddress) return fail(400, { message: 'IP address আবশ্যক।' });
		if (!IP_PATTERN.test(ipAddress)) return fail(400, { message: 'অবৈধ IP address।' });
		if (blockAction !== 'block' && blockAction !== 'unblock') return fail(400, { message: 'অবৈধ action।' });

		try {
			const db = getDb(platform);

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

				await db.insert(schema.botLogs).values({
					id: crypto.randomUUID(),
					ipAddress,
					userAgent,
					botCategory: 'blocked',
					threatLevel: 'critical',
					pathVisited: '/admin/bot-activity',
					actionTaken: 'blocked'
				});

				return { success: true, message: `IP ${ipAddress} ব্লক করা হয়েছে!` };
			} else {
				await db.delete(schema.ipBlocks).where(eq(schema.ipBlocks.ipAddress, ipAddress));
				return { success: true, message: `IP ${ipAddress} আনব্লক করা হয়েছে।` };
			}
		} catch (err: any) {
			console.error('Failed to toggle block IP:', err);
			return fail(500, { message: err?.message || 'Firewall আপডেট করতে ব্যর্থ হয়েছে।' });
		}
	},

	updateFirewallRule: async ({ request, platform, locals }) => {
		const guard = requireOwner(locals);
		if (guard) return guard;

		const data = await request.formData();
		const botKey = data.get('botKey')?.toString();
		const isAllowed = data.get('isAllowed') === 'true';

		if (!botKey) return fail(400, { message: 'Bot key আবশ্যক।' });

		try {
			const db = getDb(platform);
			await SettingsService.setSetting(db, 'firewall', botKey, isAllowed);
			return { success: true, message: `${botKey} ফায়ারওয়াল নিয়ম আপডেট হয়েছে!` };
		} catch (e: any) {
			console.error('Failed to update firewall rule:', e);
			return fail(500, { message: e?.message || 'ফায়ারওয়াল আপডেট করতে ব্যর্থ হয়েছে।' });
		}
	},

	clearOldLogs: async ({ platform, locals }) => {
		const guard = requireOwner(locals);
		if (guard) return guard;

		try {
			const db = getDb(platform);
			const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
			await db
				.delete(schema.botLogs)
				.where(sql`${schema.botLogs.createdAt} < ${thirtyDaysAgo}`);
			return { success: true, message: '৩০ দিনের পুরনো লগ সফলভাবে মুছে ফেলা হয়েছে!' };
		} catch (e: any) {
			console.error('Failed to clear old bot logs:', e);
			return fail(500, { message: 'লগ মুছতে ব্যর্থ হয়েছে।' });
		}
	}
};
