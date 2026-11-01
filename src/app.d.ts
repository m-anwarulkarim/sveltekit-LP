import type { User, Session } from 'better-auth';
import { createAuth } from '#lib/server/auth.ts';
import type { AuthenticatedAdmin } from '#lib/server/services/admin-auth.service';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Platform {
			env: Env;
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
		}

		interface Locals {
			user?: User;
			session?: Session;
			auth?: ReturnType<typeof createAuth>;
			admin?: AuthenticatedAdmin;
		}

		interface Error {
			message: string;
			errorId?: string;
		}
		// interface PageData {}
		// interface PageState {}
	}
}

declare module '$app/environment' {
	export const browser: boolean;
	export const dev: boolean;
	export const building: boolean;
	export const version: string;
}

export {};
