// Runs tests/logic.test.ts against real service and route code on in-memory SQLite.
// It never touches Cloudflare: the D1 binding is replaced by a small shim inside the test.
import { build } from 'esbuild';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'logic-test-'));

// 1. The schema comes from the TypeScript definitions, so a drifted schema fails the tests.
const drizzleKit = path.join(root, 'node_modules', 'drizzle-kit', 'bin.cjs');
const exported = spawnSync(process.execPath, [drizzleKit, 'export'], {
	cwd: root,
	encoding: 'utf8',
	env: {
		...process.env,
		CLOUDFLARE_ACCOUNT_ID: 'test',
		CLOUDFLARE_DATABASE_ID: 'test',
		CLOUDFLARE_D1_TOKEN: 'test'
	}
});
if (exported.status !== 0 || !exported.stdout.includes('CREATE TABLE')) {
	console.error('Could not export the schema:\n', exported.stderr || exported.stdout);
	process.exit(1);
}
const schemaFile = path.join(work, 'schema.sql');
fs.writeFileSync(schemaFile, exported.stdout);

// 2. Stand-ins for Cloudflare and SvelteKit modules that only exist inside the platform.
const stubs = {
	'cf.js': 'export const env = new Proxy({}, { get: (_, k) => globalThis.__TEST_ENV__?.[k] });',
	'env.js': 'export const env = new Proxy({}, { get: (_, k) => globalThis.__TEST_ENV__?.[k] });',
	'app-server.js': 'export const getRequestEvent = () => globalThis.__TEST_EVENT__;'
};
for (const [name, source] of Object.entries(stubs)) fs.writeFileSync(path.join(work, name), source);

// 3. Resolves the "#lib/..." import alias the same way package.json does.
const libAlias = {
	name: 'lib-alias',
	setup(b) {
		b.onResolve({ filter: /^#lib\// }, (args) => {
			const base = path.join(root, 'src', 'lib', args.path.slice(5));
			for (const candidate of [base, `${base}.ts`, path.join(base, 'index.ts')]) {
				if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return { path: candidate };
			}
			return { errors: [{ text: `cannot resolve ${args.path}` }] };
		});
		b.onResolve({ filter: /^#lib$/ }, () => ({ path: path.join(root, 'src', 'lib', 'index.ts') }));
	}
};

const bundle = path.join(work, 'logic.test.mjs');
await build({
	entryPoints: [path.join(root, 'tests', 'logic.test.ts')],
	outfile: bundle,
	bundle: true,
	platform: 'node',
	format: 'esm',
	target: 'node22',
	logLevel: 'error',
	absWorkingDir: root,
	plugins: [libAlias],
	alias: {
		'cloudflare:workers': path.join(work, 'cf.js'),
		'$env/dynamic/private': path.join(work, 'env.js'),
		'$app/server': path.join(work, 'app-server.js')
	},
	external: ['node:*', 'wrangler'],
	banner: { js: "import { createRequire as __cr } from 'module'; const require = __cr(import.meta.url);" }
});

const run = spawnSync(process.execPath, ['--no-warnings', bundle], {
	cwd: root,
	encoding: 'utf8',
	env: { ...process.env, TEST_SCHEMA_SQL: schemaFile }
});
process.stdout.write(run.stdout);
if (run.status !== 0) process.stderr.write(run.stderr.split('\n').slice(0, 30).join('\n') + '\n');
fs.rmSync(work, { recursive: true, force: true });
process.exit(run.status ?? 1);
