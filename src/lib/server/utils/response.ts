/**
 * Standardized API & Action Response Utilities
 * Following Modern Type-Safe API Design Patterns
 */

export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: {
		code: string;
		message: string;
		details?: Record<string, string[] | string | undefined>;
	};
	meta?: {
		timestamp: number;
		requestId?: string;
	};
}

export function apiSuccess<T>(data: T, meta?: Record<string, unknown>): ApiResponse<T> {
	return {
		success: true,
		data,
		meta: {
			timestamp: Date.now(),
			...meta
		}
	};
}

export function apiError(
	message: string,
	code = 'BAD_REQUEST',
	details?: Record<string, string[] | string | undefined>
): ApiResponse<never> {
	return {
		success: false,
		error: {
			code,
			message,
			details
		},
		meta: {
			timestamp: Date.now()
		}
	};
}

