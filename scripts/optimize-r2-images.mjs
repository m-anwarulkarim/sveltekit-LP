// Converts every oversized product/category/banner image already stored in R2
// to a resized WebP, uploads it next to the original (originals are kept, so
// this is reversible) and points the production D1 rows at the new URL.
//
//   node scripts/optimize-r2-images.mjs           <- dry run: report only
//   node scripts/optimize-r2-images.mjs --apply   <- upload + update D1
//
// Needs: `npx wrangler login` done once on this machine.
import { execSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';

const BUCKET = 'haqplus';
const DB = 'aura';
const PUBLIC_BASE = 'https://pub-fe7043cdba5e4550a7e594df8db06129.r2.dev';
const MAX_DIMENSION = 1200;
const QUALITY = 80;
// A WebP already below this size is left alone.
const KEEP_BELOW_BYTES = 200 * 1024;

const APPLY = process.argv.includes('--apply');

const TARGETS = [
	{ table: 'products', id: 'id', cols: ['image'] },
	{ table: 'product_variants', id: 'id', cols: ['image'] },
	{ table: 'categories', id: 'id', cols: ['image'] },
	{ table: 'carousels', id: 'id', cols: ['image', 'mobile_image'] },
	{ table: 'banners', id: 'id', cols: ['image'] },
	{ table: 'popups', id: 'id', cols: ['image_url'] },
	{ table: 'media_assets', id: 'id', cols: ['url'] }
];

function wrangler(cmd) {
	return execSync(`npx wrangler ${cmd}`, { encoding: 'utf8' });
}

function query(sql) {
	const out = wrangler(`d1 execute ${DB} --remote --json --command "${sql.replaceAll('"', '\\"')}"`);
	const parsed = JSON.parse(out);
	return parsed[0]?.results ?? [];
}

const tmp = mkdtempSync(join(tmpdir(), 'r2-opt-'));
// The same URL may appear in several rows; convert once, reuse everywhere.
const converted = new Map();
let savedBytes = 0;

async function convertUrl(url) {
	if (converted.has(url)) return converted.get(url);

	const res = await fetch(url);
	if (!res.ok) {
		console.log(`  skip (HTTP ${res.status}) ${url}`);
		converted.set(url, null);
		return null;
	}
	const original = Buffer.from(await res.arrayBuffer());
	const key = decodeURIComponent(new URL(url).pathname.replace(/^\/+/, ''));
	const isWebp = /\.webp$/i.test(key);

	if (isWebp && original.length < KEEP_BELOW_BYTES) {
		console.log(`  keep ${key} (${(original.length / 1024).toFixed(0)} KB webp)`);
		converted.set(url, null);
		return null;
	}

	let output;
	try {
		output = await sharp(original)
			.resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
			.webp({ quality: QUALITY })
			.toBuffer();
	} catch (e) {
		console.log(`  skip (not decodable: ${e.message}) ${key}`);
		converted.set(url, null);
		return null;
	}

	if (output.length >= original.length) {
		console.log(`  keep ${key} (already optimal)`);
		converted.set(url, null);
		return null;
	}

	const newKey = key.replace(/\.[^/.]+$/, '') + '-opt.webp';
	const newUrl = `${PUBLIC_BASE}/${newKey}`;
	console.log(
		`  ${(original.length / 1024).toFixed(0).padStart(5)} KB -> ${(output.length / 1024).toFixed(0).padStart(4)} KB  ${key} => ${newKey}${APPLY ? '' : '  [dry-run]'}`
	);
	savedBytes += original.length - output.length;

	if (APPLY) {
		const file = join(tmp, 'img.webp');
		writeFileSync(file, output);
		wrangler(
			`r2 object put "${BUCKET}/${newKey}" --file "${file}" --content-type image/webp --cache-control "public, max-age=31536000, immutable" --remote`
		);
	}

	converted.set(url, newUrl);
	return newUrl;
}

for (const { table, id, cols } of TARGETS) {
	for (const col of cols) {
		let rows;
		try {
			// D1 rejects long LIKE patterns ("pattern too complex"), so instr() it is.
			rows = query(
				`SELECT ${id} AS id, ${col} AS url FROM ${table} WHERE instr(${col}, '.r2.dev/') > 0`
			);
		} catch (e) {
			console.log(`-- ${table}.${col}: query failed (${String(e).split('\n')[0]})`);
			continue;
		}
		if (!rows.length) continue;
		console.log(`-- ${table}.${col}: ${rows.length} R2 image(s)`);

		for (const row of rows) {
			if (typeof row.url !== 'string' || row.url.includes("'") || String(row.id).includes("'")) continue;
			const newUrl = await convertUrl(row.url);
			if (newUrl && APPLY) {
				query(`UPDATE ${table} SET ${col}='${newUrl}' WHERE ${id}='${row.id}'`);
			}
		}
	}
}

console.log(`\nTotal savings: ${(savedBytes / 1024 / 1024).toFixed(2)} MB${APPLY ? '' : ' (dry run — re-run with --apply)'}`);
