/**
 * Browser-side image optimizer. Every admin upload must pass through here so
 * only resized WebP (or a small JPEG fallback, or an untouched GIF) ever
 * reaches R2 — the server rejects anything else.
 */

export interface OptimizeOptions {
	/** Longest edge in pixels; larger images are scaled down. */
	maxDimension?: number;
	/** WebP/JPEG encode quality, 0..1 */
	quality?: number;
}

export interface OptimizedFile {
	file: File;
	width: number;
	height: number;
}

const DEFAULT_MAX_DIMENSION = 1200;
const DEFAULT_QUALITY = 0.8;

/** Original files may be large photos; they shrink drastically after conversion. */
export const MAX_SOURCE_BYTES = 15 * 1024 * 1024;

function renameWithExt(name: string, ext: string): string {
	const base = name.replace(/\.[^/.]+$/, '') || 'image';
	return `${base}.${ext}`;
}

export async function optimizeImageFile(
	source: File,
	options: OptimizeOptions = {}
): Promise<OptimizedFile> {
	// Canvas re-encoding would freeze GIF animations, so GIFs pass through as-is.
	if (source.type === 'image/gif') {
		return { file: source, width: 0, height: 0 };
	}

	const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION;
	const quality = options.quality ?? DEFAULT_QUALITY;

	const bitmap = await createImageBitmap(source);
	const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
	const width = Math.max(1, Math.round(bitmap.width * scale));
	const height = Math.max(1, Math.round(bitmap.height * scale));

	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		bitmap.close();
		return { file: source, width: bitmap.width, height: bitmap.height };
	}
	ctx.drawImage(bitmap, 0, 0, width, height);
	bitmap.close();

	const encode = (type: string, q: number) =>
		new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, q));

	let blob = await encode('image/webp', quality);
	// Older Safari ignores the WebP request and hands back PNG.
	if (!blob || blob.type !== 'image/webp') {
		blob = await encode('image/jpeg', quality);
	}
	if (!blob) {
		return { file: source, width, height };
	}

	// Large photos can stay heavy even after resizing: step the quality down
	// until the file is small enough for a fast storefront.
	const TARGET_BYTES = 350 * 1024;
	let q = quality;
	while (blob.size > TARGET_BYTES && q > 0.52) {
		q -= 0.1;
		const next = await encode(blob.type, q);
		if (!next || next.size >= blob.size) break;
		blob = next;
	}

	// Re-encoding an already well-compressed file can grow it; keep the smaller one —
	// but only when no resize was needed, otherwise an oversized original would slip through.
	const sourceIsAccepted = source.type === 'image/webp' || source.type === 'image/jpeg';
	if (sourceIsAccepted && blob.size >= source.size && scale === 1) {
		return { file: source, width, height };
	}

	const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
	return {
		file: new File([blob], renameWithExt(source.name, ext), { type: blob.type }),
		width,
		height
	};
}

/** Optimizes then uploads via /api/admin/media/upload. Throws with a Bangla message on failure. */
export async function uploadOptimizedImage(
	source: File,
	folder: string,
	options: OptimizeOptions = {}
): Promise<{ url: string; item: unknown; width: number; height: number }> {
	if (!source.type.startsWith('image/')) {
		throw new Error('শুধুমাত্র ইমেজ ফাইল আপলোড করা যাবে।');
	}
	if (source.size > MAX_SOURCE_BYTES) {
		throw new Error('ফাইলের সাইজ ১৫ MB এর বেশি হতে পারবে না।');
	}

	const { file, width, height } = await optimizeImageFile(source, options);

	const formData = new FormData();
	formData.append('file', file);
	formData.append('folder', folder);
	if (width && height) {
		formData.append('width', String(width));
		formData.append('height', String(height));
	}

	const res = await fetch('/api/admin/media/upload', { method: 'POST', body: formData });
	const data: any = await res.json().catch(() => ({}));
	if (!res.ok || !data?.success || !data?.url) {
		throw new Error(data?.message || 'ছবি আপলোড ব্যর্থ হয়েছে');
	}
	return { url: data.url as string, item: data.item, width, height };
}
