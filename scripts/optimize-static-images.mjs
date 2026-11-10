// Recompress every raster file under static/images in place (same name & format,
// so no code or DB reference changes). A file is only overwritten when the
// optimized version is smaller.
//
// Usage: node scripts/optimize-static-images.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('../static/images', import.meta.url));

/** Longest-edge caps by folder: hero banners render ~full width, the rest render small. */
function maxDimensionFor(path) {
	if (path.includes('hero')) return 1200;
	if (path.includes('categories')) return 320;
	return 800;
}

function walk(dir) {
	const out = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) out.push(...walk(full));
		else out.push(full);
	}
	return out;
}

const RASTER = new Set(['.webp', '.png', '.jpg', '.jpeg']);
let savedTotal = 0;

for (const file of walk(ROOT)) {
	const ext = extname(file).toLowerCase();
	if (!RASTER.has(ext)) continue;

	const input = readFileSync(file);
	const before = input.length;
	const maxDim = maxDimensionFor(file.replaceAll('\\', '/'));

	let pipeline = sharp(input).resize({
		width: maxDim,
		height: maxDim,
		fit: 'inside',
		withoutEnlargement: true
	});

	if (ext === '.webp') pipeline = pipeline.webp({ quality: file.includes('hero') ? 72 : 78 });
	else if (ext === '.png') pipeline = pipeline.png({ compressionLevel: 9, palette: true });
	else pipeline = pipeline.jpeg({ quality: 75, mozjpeg: true });

	const output = await pipeline.toBuffer();
	if (output.length < before) {
		writeFileSync(file, output);
		savedTotal += before - output.length;
		console.log(
			`${(before / 1024).toFixed(0).padStart(5)} KB -> ${(output.length / 1024).toFixed(0).padStart(4)} KB  ${file.slice(ROOT.length + 1)}`
		);
	} else {
		console.log(`  keep ${file.slice(ROOT.length + 1)} (${(before / 1024).toFixed(0)} KB already optimal)`);
	}
}

console.log(`\nTotal saved: ${(savedTotal / 1024).toFixed(0)} KB`);
