import { drizzle } from 'drizzle-orm/d1';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from './schema';

export type AppDatabase = DrizzleD1Database<typeof schema>;

/**
 * Creates an HTTP-based D1Database client for Node.js / Vite SSR environments.
 * Connects directly to the real Cloudflare D1 remote database via Cloudflare API.
 */
function createD1HttpClient(accountId: string, databaseId: string, token: string): D1Database {
	const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}`;

	async function executeQuery(sql: string, params: any[] = []) {
		const res = await fetch(`${endpoint}/query`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ sql, params })
		});
		const data: any = await res.json();
		if (!data.success) {
			const errMsg = data.errors?.[0]?.message || 'D1 HTTP Query Failed';
			throw new Error(errMsg);
		}
		return data.result[0];
	}

	function createStatement(query: string, boundParams: any[] = []): D1PreparedStatement {
		return {
			query,
			params: boundParams,
			bind(...values: any[]) {
				return createStatement(query, values);
			},
			async all() {
				const res = await executeQuery(query, boundParams);
				return {
					results: res.results || [],
					success: true,
					meta: res.meta
				};
			},
			async first(col?: string) {
				const res = await executeQuery(query, boundParams);
				const row = res.results?.[0];
				if (!row) return null;
				return col ? row[col] : row;
			},
			async run() {
				const res = await executeQuery(query, boundParams);
				return {
					results: res.results || [],
					success: true,
					meta: res.meta
				};
			},
			async raw() {
				const res = await executeQuery(query, boundParams);
				return (res.results || []).map((r: any) => Object.values(r));
			}
		} as unknown as D1PreparedStatement;
	}

	return {
		prepare(query: string) {
			return createStatement(query);
		},
		async batch(statements: any[]) {
			const results = [];
			for (const s of statements) {
				results.push(await s.run());
			}
			return results;
		},
		async exec(query: string) {
			const res = await executeQuery(query);
			return { count: res.meta?.changes || 0, duration: res.meta?.duration || 0 };
		},
		dump() {
			throw new Error('dump not supported');
		}
	} as unknown as D1Database;
}

let cachedHttpDb: AppDatabase | null = null;

/**
 * Universal Database Getter:
 * 1. In dev/SSR environment: Connects directly to the real Cloudflare D1 remote database via HTTP API.
 * 2. In Cloudflare Workers/Pages edge production: Uses native D1 binding.
 * Guarantees 100% real remote database access everywhere!
 */
export const getDb = (d1OrPlatform?: any): AppDatabase => {
	// 1. Native Cloudflare D1 binding (Local Wrangler Proxy in Dev, cached proxy, or Native Binding in Production)
	const nativeD1 =
		d1OrPlatform?.env?.DB ||
		d1OrPlatform?.DB ||
		(d1OrPlatform?.prepare ? d1OrPlatform : null) ||
		(typeof globalThis !== 'undefined' ? (globalThis as any).__DEV_D1__ : null);

	if (nativeD1) {
		return drizzle(nativeD1, { schema });
	}

	// 2. HTTP-based Cloudflare D1 client for Node.js scripts / CLI environments
	const accountId =
		(typeof process !== 'undefined' && process.env?.CLOUDFLARE_ACCOUNT_ID) || '';
	const databaseId =
		(typeof process !== 'undefined' && process.env?.CLOUDFLARE_DATABASE_ID) || '';
	const token =
		(typeof process !== 'undefined' && process.env?.CLOUDFLARE_D1_TOKEN) || '';

	if (typeof process !== 'undefined' && token && accountId && databaseId) {
		if (cachedHttpDb) {
			return cachedHttpDb;
		}
		const httpD1 = createD1HttpClient(accountId, databaseId, token);
		cachedHttpDb = drizzle(httpD1, { schema });
		return cachedHttpDb;
	}

	throw new Error('No Cloudflare D1 database available');
};
