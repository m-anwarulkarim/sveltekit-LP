// Runs real services, hooks and routes against an in-memory SQLite database behind a D1 shim.
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '../src/lib/server/db/schema';
import { OrderService, OrderPriceChangedError, OrderValidationError } from '../src/lib/server/services/order.service';
import { AdminAuthService } from '../src/lib/server/services/admin-auth.service';
import { AdminProfileService } from '../src/lib/server/services/admin-profile.service';
import { StockService } from '../src/lib/server/services/stock.service';
import { hashPassword, verifyPassword, needsPasswordUpgrade } from '../src/lib/server/utils/password';
import { handle, handleError } from '../src/hooks.server';
import { createAuth } from '../src/lib/server/auth';
import { actions as productActions } from '../src/routes/products/[slug]/+page.server';
import { getRateLimitTier } from '../src/lib/server/rate-limit';
import { GET as searchApi } from '../src/routes/api/admin/search/+server';
import { GET as pollApi } from '../src/routes/api/admin/notifications/poll/+server';
import { POST as uploadApi } from '../src/routes/api/admin/media/upload/+server';
import { GET as bkashCallback } from '../src/routes/api/payment/bkash/callback/+server';
import { POST as bkashCreate } from '../src/routes/api/payment/bkash/create/+server';
import { POST as incomplete } from '../src/routes/api/checkout/incomplete/+server';
import { load as checkoutLoad } from '../src/routes/checkout/+page.server';
import { actions as lpActions } from '../src/routes/lp/[slug]/+page.server';
import { resolveLandingOffer, computeCouponDiscount, parseCartItemId } from '../src/lib/utils/order-pricing';
import { VisitorAnalyticsService } from '../src/lib/server/services/visitor-analytics.service';

const sqlite = new DatabaseSync(':memory:');
sqlite.exec('PRAGMA foreign_keys = ON');
for (const stmt of fs.readFileSync(process.env.TEST_SCHEMA_SQL!, 'utf8').split(/;\s*$/m)) {
	const clean = stmt.replace(/^--.*$/gm, '').trim();
	if (clean) sqlite.exec(clean);
}

function statement(query: string, params: any[] = []): any {
	const norm = (v: any) => (v === undefined ? null : v); const __meta = { __q: query, __p: params };
	return {
		...__meta,
		bind: (...values: any[]) => statement(query, values),
		all: async () => ({ results: sqlite.prepare(query).all(...params.map(norm)), success: true, meta: {} }),
		run: async () => {
			if (/returning/i.test(query)) {
				return { results: sqlite.prepare(query).all(...params.map(norm)), success: true, meta: {} };
			}
			const r = sqlite.prepare(query).run(...params.map(norm));
			return { results: [], success: true, meta: { changes: Number(r.changes) } };
		},
		first: async () => sqlite.prepare(query).get(...params.map(norm)) ?? null,
		raw: async () => { const s: any = sqlite.prepare(query); s.setReturnArrays(true); return s.all(...params.map(norm)); }
	};
}
const d1: any = {
	prepare: (q: string) => statement(q),
	batch: async (stmts: any[]) => {
		sqlite.exec('BEGIN');
		try {
			const out = [];
			for (const s of stmts) { try { out.push(await s.run()); } catch (err) { console.error('BATCHFAIL', s.__q, JSON.stringify(s.__p)); throw err; } }
			sqlite.exec('COMMIT');
			return out;
		} catch (e) {
			sqlite.exec('ROLLBACK');
			throw e;
		}
	}
};
const db: any = drizzle(d1, { schema });
const platform: any = { env: { DB: d1 }, ctx: { waitUntil() {} } };

const SECRET = 'e2e-test-secret-e2e-test-secret-e2e-test-0001';
(globalThis as any).__TEST_ENV__ = { BETTER_AUTH_SECRET: SECRET, ADMIN_BOOTSTRAP_PASSWORD: 'bootstrap-pass-123', DB: d1 };

const now = Date.now();
const exec = (q: string, ...a: any[]) => sqlite.prepare(q).run(...a);
exec(`INSERT INTO admin_users (id,name,username,email,role,access,is_trashed,permissions,created_at,updated_at) VALUES ('1','Owner','owner1','owner@t.local','Owner','Allowed',0,'["*"]',?,?)`, now, now);
exec(`INSERT INTO admin_users (id,name,username,email,role,access,is_trashed,permissions,created_at,updated_at) VALUES ('2','Staff','staff1','staff@t.local','Manager','Allowed',0,'["orders"]',?,?)`, now, now);
exec(`INSERT INTO admin_users (id,name,username,email,role,access,is_trashed,permissions,created_at,updated_at) VALUES ('3','Sus','sus1','sus@t.local','Developer','Suspended',0,'["*"]',?,?)`, now, now);
exec(`INSERT INTO products (id,name,slug,price,original_price,cost_price,image,description,status,in_stock,total_stock,stock,created_at,updated_at) VALUES ('p1','Tracked','tracked',1000,1200,300,'/x.png','d','published',1,5,5,?,?)`, now, now);
exec(`INSERT INTO products (id,name,slug,price,original_price,image,description,status,in_stock,total_stock,created_at,updated_at) VALUES ('p2','Untracked','untracked',500,600,'/x.png','d','published',1,0,?,?)`, now, now);
exec(`INSERT INTO products (id,name,slug,price,original_price,image,description,status,in_stock,total_stock,created_at,updated_at) VALUES ('p3','Draft','draft',500,600,'/x.png','d','draft',1,0,?,?)`, now, now);
exec(`INSERT INTO coupons (id,name,code,discount_type,discount_value,min_order_amount,status,is_active,usage_count,usage_limit,created_at,updated_at) VALUES ('c1','Ten','TEN10','percentage',10,100,'publish',1,0,1,?,?)`, now, now);
exec(`INSERT INTO store_settings (id,"group",key,value,updated_at) VALUES ('s1','delivery','inside_dhaka_charge','77',?)`, now);
exec(`INSERT INTO landing_pages (id,title,slug,product_id,status,template,meta_description,created_at,updated_at) VALUES ('l1','LP','lp-test','p2','Published','style_2_direct',?,?,?)`, JSON.stringify({ headline: 'H', packages: [{ title: 'One', qty: 1, price: 900, deliveryFee: 45 }, { title: 'Three', qty: 3, price: 1000, freeDelivery: true }] }), now, now);
for (const [k, v] of [['enable_cod', 'true'], ['enable_bkash', 'true'], ['bkash_app_key', 'KEY'], ['bkash_app_secret', 'SUPERSECRET'], ['bkash_username', 'u'], ['bkash_password', 'PASSWORD_X']]) {
	exec(`INSERT INTO store_settings (id,"group",key,value,updated_at) VALUES (?,'payment',?,?,?)`, `pay-${k}`, k, v, now);
}

let passed = 0;
const failures: string[] = [];
async function test(name: string, fn: () => Promise<void> | void) {
	try {
		await fn();
		passed++;
		console.log('PASS', name);
	} catch (e: any) {
		failures.push(name);
		console.log('FAIL', name, '::', String(e?.message || e).slice(0, 400));
	}
}

const base = { customerName: 'Rahim Uddin', customerPhone: '01712345678', shippingAddress: 'House 1, Road 2, Dhaka', deliveryArea: 'inside_dhaka', paymentMethod: 'cod' };
const stock = (id: string) => (sqlite.prepare('select total_stock t, in_stock s, sales_count c from products where id=?').get(id) as any);

function makeEvent(path: string, opts: { method?: string; routeId?: string | null; cookie?: string; ip?: string; body?: any } = {}): any {
	const headers = new Headers({ 'user-agent': 'Mozilla/5.0', 'cf-connecting-ip': opts.ip || '9.9.9.9' });
	const url = new URL(`https://shop.test${path}`);
	return {
		url,
		route: { id: opts.routeId === undefined ? null : opts.routeId },
		platform,
		locals: {},
		request: new Request(url, { method: opts.method || 'GET', headers, body: opts.body }),
		cookies: { get: (n: string) => (n === 'admin_session' ? opts.cookie : undefined) }
	};
}
async function runHandle(event: any): Promise<{ status: number; location?: string; resolved: boolean; response?: Response }> {
	let resolved = false;
	try {
		const response = await handle({
			event,
			resolve: async () => {
				resolved = true;
				return new Response('ok');
			}
		} as any);
		return { status: response.status, resolved, response };
	} catch (e: any) {
		if (e?.status && e?.location) return { status: e.status, location: e.location, resolved };
		throw e;
	}
}

// ---------- pure pricing ----------
await test('bundle ids parse', () => {
	assert.equal(parseCartItemId('p1-combo').productId, 'p1');
	assert.equal(parseCartItemId('p1-combo').bundle.multiplier, 2);
	assert.equal(parseCartItemId('abc-def').productId, 'abc-def');
});
await test('coupon min order and cap', () => {
	assert.equal(computeCouponDiscount({ discountType: 'percentage', discountValue: 10, minOrderAmount: 500 }, 100), 0);
	assert.equal(computeCouponDiscount({ discountType: 'percentage', discountValue: 50, maxDiscountAmount: 100 }, 1000), 100);
	assert.equal(computeCouponDiscount({ discountType: 'fixed', discountValue: 5000 }, 1000), 1000);
});
await test('landing style 2 package is fixed by server', () => {
	const o = resolveLandingOffer({ template: 'style_2_direct', packages: [{ qty: 1, price: 900, deliveryFee: 45 }, { qty: 3, price: 1000, freeDelivery: true }], packageIndex: 1, quantity: 99 });
	assert.deepEqual([o.subtotal, o.quantity, o.deliveryCharge], [1000, 3, 0]);
});

// ---------- orders ----------
let firstOrder: any;
await test('tampered price and name are ignored', async () => {
	firstOrder = await OrderService.createWebOrder(db, { ...base, items: [{ id: 'p1', quantity: 1, price: 1, name: 'HACK' }] }, { ipAddress: '1.1.1.1' });
	assert.equal(firstOrder.subtotal, 1000);
	assert.equal(firstOrder.items[0].name, 'Tracked');
	assert.equal(firstOrder.deliveryCharge, 77, 'admin delivery setting is used');
	assert.equal(firstOrder.total, 1077);
});
await test('stock and sales move inside the order', () => {
	const s = stock('p1');
	assert.deepEqual([s.t, s.c], [4, 1]);
});
await test('order number starts at 1001 and is sequential', async () => {
	assert.equal(firstOrder.orderNumber, '1001');
	const second = await OrderService.createWebOrder(db, { ...base, items: [{ id: 'p2', quantity: 1 }] }, {});
	assert.equal(second.orderNumber, '1002');
});
await test('counter survives parallel callers without duplicates', async () => {
	const numbers = await Promise.all(Array.from({ length: 20 }, () => OrderService.generateNextOrderNumber(db)));
	assert.equal(new Set(numbers).size, 20);
});
await test('untracked product stays in stock', () => {
	const s = stock('p2');
	assert.deepEqual([s.t, s.s], [0, 1]);
});
await test('unknown and draft products are rejected', async () => {
	await assert.rejects(OrderService.createWebOrder(db, { ...base, items: [{ id: 'nope', quantity: 1 }] }, {}), OrderValidationError);
	await assert.rejects(OrderService.createWebOrder(db, { ...base, items: [{ id: 'p3', quantity: 1 }] }, {}), OrderValidationError);
});
await test('overselling is rejected and leaves stock alone', async () => {
	await assert.rejects(OrderService.createWebOrder(db, { ...base, items: [{ id: 'p1', quantity: 50 }] }, {}), /স্টকে/);
	assert.equal(stock('p1').t, 4);
});
await test('bundle uses server price and multiplies stock', async () => {
	const o = await OrderService.createWebOrder(db, { ...base, items: [{ id: 'p1-combo', quantity: 1 }] }, {});
	assert.equal(o.subtotal, 1800);
	assert.equal(stock('p1').t, 2);
});
await test('wrong expected total stops the order and saves nothing', async () => {
	const before = (sqlite.prepare('select count(*) c from orders').get() as any).c;
	await assert.rejects(OrderService.createWebOrder(db, { ...base, expectedTotal: 5, items: [{ id: 'p2', quantity: 1 }] }, {}), OrderPriceChangedError);
	assert.equal((sqlite.prepare('select count(*) c from orders').get() as any).c, before);
});
await test('coupon applies, counts usage and respects the limit', async () => {
	const o = await OrderService.createWebOrder(db, { ...base, couponCode: 'ten10', items: [{ id: 'p2', quantity: 2 }] }, {});
	assert.equal(o.discountAmount, 100);
	await assert.rejects(OrderService.createWebOrder(db, { ...base, couponCode: 'TEN10', items: [{ id: 'p2', quantity: 2 }] }, {}), /সীমা/);
	await assert.rejects(OrderService.createWebOrder(db, { ...base, couponCode: 'FAKE', items: [{ id: 'p2', quantity: 2 }] }, {}), OrderValidationError);
});
await test('disabled payment method is rejected', async () => {
	await assert.rejects(OrderService.createWebOrder(db, { ...base, paymentMethod: 'nagad', items: [{ id: 'p2', quantity: 1 }] }, {}), OrderValidationError);
});
await test('honeypot blocks bots', async () => {
	await assert.rejects(OrderService.createWebOrder(db, { ...base, website_url: 'x', items: [{ id: 'p2', quantity: 1 }] }, {}), OrderValidationError);
});
await test('cancel releases stock once and re-confirm takes it again', async () => {
	const order = sqlite.prepare('select * from orders where id=?').get(firstOrder.orderId) as any;
	const row = { orderType: order.order_type, status: 'pending', items: order.items };
	const start = stock('p1').t;
	await StockService.syncForStatusChange(db, row, 'cancelled');
	assert.equal(stock('p1').t, start + 1);
	await StockService.syncForStatusChange(db, { ...row, status: 'cancelled' }, 'returned');
	assert.equal(stock('p1').t, start + 1, 'no double release');
	await StockService.syncForStatusChange(db, { ...row, status: 'cancelled' }, 'confirmed');
	assert.equal(stock('p1').t, start);
});
await test('public summary has no customer data', async () => {
	const s: any = await OrderService.getPublicOrderSummary(db, firstOrder.orderId);
	assert.ok(s.orderNumber);
	for (const key of ['customerName', 'customerPhone', 'shippingAddress', 'ipAddress']) assert.equal(key in s, false, key);
	assert.equal(await OrderService.getPublicOrderSummary(db, firstOrder.orderNumber), null, 'number alone must not work');
});
await test('tracking needs the matching phone', async () => {
	assert.equal(await OrderService.trackPublicOrder(db, firstOrder.orderNumber, '01999999999'), null);
	const t: any = await OrderService.trackPublicOrder(db, `#${firstOrder.orderNumber}`, '+8801712345678');
	assert.equal(t.total, 1077);
	assert.equal(t.items[0].price, 1000);
	assert.equal('shippingAddress' in t, false);
});
await test('incomplete checkout saves, then updates the same row', async () => {
	const post = (body: any) => incomplete({ request: new Request('https://shop.test/x', { method: 'POST', body: JSON.stringify(body) }), platform, getClientAddress: () => '1.1.1.1' } as any);
	const a: any = await (await post({ customerPhone: '01811111111', items: [{ id: 'p1', name: 'x', price: 1, quantity: 1, originalPrice: 9, category: 'c' }], total: 100 })).json();
	assert.equal(a.success, true, JSON.stringify(a));
	const b: any = await (await post({ customerPhone: '+8801811111111', items: [], total: 50 })).json();
	assert.equal(b.incompleteOrderId, a.incompleteOrderId);
	const bad = await post({ customerPhone: '123' });
	assert.equal(bad.status, 400);
});
await test('finishing checkout closes the abandoned record', async () => {
	await OrderService.createWebOrder(db, { ...base, customerPhone: '01811111111', items: [{ id: 'p2', quantity: 1 }] }, {});
	const row: any = sqlite.prepare("select is_trashed t, recovery_status r from orders where customer_phone='01811111111' and status='incomplete'").get();
	assert.deepEqual([row.t, row.r], [1, 'converted']);
});
await test('landing order ignores a forged price', async () => {
	const fd = new FormData();
	Object.entries({ customerName: 'Karim Ali', customerPhone: '01722222222', shippingAddress: 'House 9, Road 9', packageIndex: '1', price: '1', quantity: '1' }).forEach(([k, v]) => fd.append(k, v));
	const res: any = await (lpActions as any).placeOrder({ request: new Request('https://shop.test/lp/lp-test', { method: 'POST', body: fd }), platform, params: { slug: 'lp-test' }, getClientAddress: () => '1.1.1.1', locals: {}, cookies: { get: () => undefined }, url: new URL('https://shop.test/lp/lp-test') });
	assert.equal(res.success, true, JSON.stringify(res));
	assert.equal(res.total, 1000);
});
await test('landing order rejects out of stock product', async () => {
	sqlite.prepare('update products set in_stock = 0 where id = ?').run('p2');
	const fd = new FormData();
	Object.entries({ customerName: 'Karim Ali', customerPhone: '01722222222', shippingAddress: 'House 9, Road 9', packageIndex: '1', price: '1000', quantity: '1' }).forEach(([k, v]) => fd.append(k, v));
	const res: any = await (lpActions as any).placeOrder({ request: new Request('https://shop.test/lp/lp-test', { method: 'POST', body: fd }), platform, params: { slug: 'lp-test' }, getClientAddress: () => '1.1.1.1', locals: {}, cookies: { get: () => undefined }, url: new URL('https://shop.test/lp/lp-test') });
	assert.equal(res.status, 400);
	assert.match(res.data.message, /স্টক আউট/);
	sqlite.prepare('update products set in_stock = 1 where id = ?').run('p2');
});

// ---------- checkout page ----------
await test('checkout page never sends gateway secrets', async () => {
	const data = await (checkoutLoad as any)({ parent: async () => ({ themeConfig: {} }), platform, locals: {} });
	const json = JSON.stringify(data);
	assert.equal(json.includes('SUPERSECRET'), false);
	assert.equal(json.includes('PASSWORD_X'), false);
	assert.equal(data.paymentConfig.enableBkash, true);
});

// ---------- bKash ----------
const realFetch = globalThis.fetch;
let executeReply: any;
let queryReply: any = {};
let createBody: any;
globalThis.fetch = (async (url: string, init: any) => {
	const u = String(url);
	if (u.endsWith('/token/grant')) return new Response(JSON.stringify({ id_token: 'tok', statusCode: '0000' }));
	if (u.endsWith('/checkout/create')) {
		createBody = JSON.parse(init.body);
		return new Response(JSON.stringify({ paymentID: 'PAY', bkashURL: 'https://bkash/x', statusCode: '0000' }));
	}
	if (u.endsWith('/checkout/execute')) return new Response(JSON.stringify(executeReply));
	if (u.includes('/payment/query/')) return new Response(JSON.stringify(queryReply));
	throw new Error('unexpected fetch ' + u);
}) as any;

const bkashOrder = await OrderService.createWebOrder(db, { ...base, customerPhone: '01733333333', paymentMethod: 'bkash', items: [{ id: 'p2', quantity: 2 }] }, {});
const paymentRow = () => sqlite.prepare('select payment_status s, advance_payment a, due_amount d from orders where id=?').get(bkashOrder.orderId) as any;
const callback = async (qs: string) => {
	try {
		await (bkashCallback as any)({ url: new URL(`https://shop.test/cb?orderId=${bkashOrder.orderId}&${qs}`), platform });
		return '';
	} catch (e: any) {
		return e.location as string;
	}
};
await test('bKash create charges the saved amount, not the request', async () => {
	const res = await (bkashCreate as any)({ request: new Request('https://shop.test/x', { method: 'POST', body: JSON.stringify({ orderId: bkashOrder.orderId, amount: 1 }) }), url: new URL('https://shop.test/x'), platform });
	assert.equal(res.status, 200);
	assert.equal(createBody.amount, bkashOrder.total.toFixed(2));
});
await test('bKash create refuses a cash order', async () => {
	const res = await (bkashCreate as any)({ request: new Request('https://shop.test/x', { method: 'POST', body: JSON.stringify({ orderId: firstOrder.orderId }) }), url: new URL('https://shop.test/x'), platform });
	assert.equal(res.status, 400);
});
await test('forged failed callback changes nothing', async () => {
	executeReply = { statusCode: '2056', statusMessage: 'bad' };
	queryReply = { transactionStatus: 'Initiated' };
	const loc = await callback('status=success&paymentID=FORGED');
	assert.match(loc, /checkout\?error=bkash_declined/);
	assert.equal(paymentRow().s, 'pending');
});
await test('underpayment does not mark the order paid and is flagged', async () => {
	executeReply = { statusCode: '0000', trxID: 'T-LOW', amount: '1.00', merchantInvoiceNumber: bkashOrder.orderNumber };
	const loc = await callback('status=success&paymentID=LOW');
	assert.match(loc, /bkash_declined/);
	assert.equal(paymentRow().s, 'pending');
	assert.ok(sqlite.prepare("select 1 from order_notes where order_id=? and note like '%T-LOW%'").get(bkashOrder.orderId));
});
await test('payment for another invoice is rejected', async () => {
	executeReply = { statusCode: '0000', trxID: 'T-OTHER', amount: String(bkashOrder.total), merchantInvoiceNumber: '999999' };
	await callback('status=success&paymentID=OTHER');
	assert.equal(paymentRow().s, 'pending');
});
await test('correct payment settles and stores TrxID', async () => {
	executeReply = { statusCode: '0000', trxID: 'T-GOOD', amount: String(bkashOrder.total), merchantInvoiceNumber: bkashOrder.orderNumber };
	const loc = await callback('status=success&paymentID=GOOD');
	assert.match(loc, new RegExp(`thank-you\\?order_id=${bkashOrder.orderId}`));
	const p = paymentRow();
	assert.deepEqual([p.s, p.a, p.d], ['paid', bkashOrder.total, 0]);
	assert.ok(sqlite.prepare("select 1 from order_notes where order_id=? and note like '%T-GOOD%'").get(bkashOrder.orderId));
});
await test('replay after paid cannot unpay it', async () => {
	executeReply = { statusCode: '2029', statusMessage: 'dup' };
	const loc = await callback('status=success&paymentID=GOOD');
	assert.match(loc, /thank-you/);
	assert.equal(paymentRow().s, 'paid');
});
await test('dropped execute response is recovered through query', async () => {
	const o = await OrderService.createWebOrder(db, { ...base, customerPhone: '01744444444', paymentMethod: 'bkash', items: [{ id: 'p2', quantity: 1 }] }, {});
	executeReply = { statusCode: '9999' };
	queryReply = { transactionStatus: 'Completed', trxID: 'T-Q', amount: String(o.total), merchantInvoiceNumber: o.orderNumber };
	try {
		await (bkashCallback as any)({ url: new URL(`https://shop.test/cb?orderId=${o.orderId}&status=success&paymentID=Q`), platform });
	} catch {}
	assert.equal((sqlite.prepare('select payment_status s from orders where id=?').get(o.orderId) as any).s, 'paid');
});
globalThis.fetch = realFetch;

// ---------- admin auth ----------
let ownerToken = '';
await test('wrong password and unknown user fail', async () => {
	assert.equal(await AdminAuthService.authenticate(db, 'owner1', 'nope', 'bootstrap-pass-123'), null);
	assert.equal(await AdminAuthService.authenticate(db, 'ghost', 'bootstrap-pass-123', 'bootstrap-pass-123'), null);
});
await test('bootstrap works for Owner only and stores a real hash', async () => {
	assert.equal(await AdminAuthService.authenticate(db, 'staff1', 'bootstrap-pass-123', 'bootstrap-pass-123'), null);
	const admin = await AdminAuthService.authenticate(db, 'OWNER@t.local', 'bootstrap-pass-123', 'bootstrap-pass-123');
	assert.ok(admin?.passwordHash?.includes(':'));
	ownerToken = await AdminAuthService.createSessionToken(admin!, SECRET);
	assert.ok(await AdminAuthService.authenticate(db, 'owner1', 'bootstrap-pass-123', null), 'hash login without bootstrap');
});
await test('login never seeds accounts on an empty table', async () => {
	const count = () => (sqlite.prepare('select count(*) c from admin_users').get() as any).c;
	const before = count();
	await AdminAuthService.authenticate(db, 'thecolorlighthouse', 'x', null);
	assert.equal(count(), before);
});
await test('suspended admin cannot sign in', async () => {
	exec(`UPDATE admin_users SET password_hash=? WHERE id='3'`, await hashPassword('secret-123'));
	assert.equal(await AdminAuthService.authenticate(db, 'sus1', 'secret-123', null), null);
});
await test('legacy SHA-256 hash verifies and upgrades on login', async () => {
	const salt = 'abcdef0123456789';
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`legacy-pass:${salt}`));
	const hex = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
	exec(`UPDATE admin_users SET password_hash=? WHERE id='2'`, `${salt}:${hex}`);
	assert.ok(await verifyPassword('legacy-pass', `${salt}:${hex}`));
	const admin = await AdminAuthService.authenticate(db, 'staff1', 'legacy-pass', null);
	assert.ok(admin);
	assert.equal(needsPasswordUpgrade(admin!.passwordHash!), false);
});
await test('tampered, foreign-secret and expired tokens are rejected', async () => {
	assert.ok(await AdminAuthService.resolveSession(db, ownerToken, SECRET));
	const [p, sig] = ownerToken.split('.');
	const forged = btoa(JSON.stringify({ id: '1', exp: Date.now() + 1e9, fp: 'x' })).replace(/=+$/, '');
	assert.equal(await AdminAuthService.resolveSession(db, `${forged}.${sig}`, SECRET), null);
	assert.equal(await AdminAuthService.resolveSession(db, `${p}.AAAA`, SECRET), null);
	assert.equal(await AdminAuthService.resolveSession(db, ownerToken, 'another-secret-another-secret-another-secret'), null);
	assert.equal(await AdminAuthService.resolveSession(db, ownerToken, null), null);
});

// ---------- hook guard ----------
await test('anonymous /admin page redirects to login', async () => {
	const r = await runHandle(makeEvent('/admin/orders', { routeId: '/admin/orders' }));
	assert.equal(r.status, 303);
	assert.match(r.location!, /auth\/admin-login/);
	assert.equal(r.resolved, false);
});
await test('encoded path cannot bypass the guard', async () => {
	assert.equal((await runHandle(makeEvent('/%61dmin/orders', { routeId: '/admin/orders' }))).resolved, false);
	assert.equal((await runHandle(makeEvent('/%61dmin/orders', { routeId: null }))).resolved, false);
});
await test('anonymous form action is refused', async () => {
	const r = await runHandle(makeEvent('/admin/database', { routeId: '/admin/database', method: 'POST', body: 'x' }));
	assert.equal(r.resolved, false);
});
await test('anonymous admin API gets 401', async () => {
	const r = await runHandle(makeEvent('/api/admin/search', { routeId: '/api/admin/search' }));
	assert.equal(r.status, 401);
	assert.equal(r.resolved, false);
});
await test('logged-in Owner passes and gets security headers', async () => {
	const event = makeEvent('/admin/orders', { routeId: '/admin/orders', cookie: ownerToken });
	const r = await runHandle(event);
	assert.equal(r.resolved, true);
	assert.equal(event.locals.admin.role, 'Owner');
	assert.equal(r.response!.headers.get('x-frame-options'), 'SAMEORIGIN');
	assert.ok(r.response!.headers.get('strict-transport-security'));
});
const staff = await db.select().from(schema.adminUsers).where(eq(schema.adminUsers.id, '2')).get();
const staffToken = await AdminAuthService.createSessionToken(staff, SECRET);
await test('staff action outside their menus is forbidden', async () => {
	const r = await runHandle(makeEvent('/admin/settings/payment-methods', { routeId: '/admin/settings/payment-methods', method: 'POST', cookie: staffToken, body: 'x' }));
	assert.equal(r.status, 403);
	const ok = await runHandle(makeEvent('/admin/orders', { routeId: '/admin/orders', method: 'POST', cookie: staffToken, body: 'x' }));
	assert.equal(ok.resolved, true);
});
await test('Owner-only menu is closed even with a wildcard', async () => {
	exec(`UPDATE admin_users SET permissions='["*"]' WHERE id='2'`);
	const r = await runHandle(makeEvent('/admin/admin-control', { routeId: '/admin/admin-control', method: 'POST', cookie: staffToken, body: 'x' }));
	assert.equal(r.status, 403);
	exec(`UPDATE admin_users SET permissions='["orders"]' WHERE id='2'`);
});
await test('empty permissions deny everything', async () => {
	exec(`UPDATE admin_users SET permissions='[]' WHERE id='2'`);
	const r = await runHandle(makeEvent('/admin/orders', { routeId: '/admin/orders', method: 'POST', cookie: staffToken, body: 'x' }));
	assert.equal(r.status, 403);
	exec(`UPDATE admin_users SET permissions='["orders"]' WHERE id='2'`);
});
await test('password change revokes old sessions', async () => {
	await AdminProfileService.changePassword(db, '1', { currentPassword: 'bootstrap-pass-123', newPassword: 'brand-new-pass', confirmPassword: 'brand-new-pass' });
	assert.equal(await AdminAuthService.resolveSession(db, ownerToken, SECRET), null);
	assert.ok(await AdminAuthService.authenticate(db, 'owner1', 'brand-new-pass', null));
});
await test('database failure keeps admin closed', async () => {
	const broken = makeEvent('/admin', { routeId: '/admin', cookie: staffToken, ip: '8.8.4.4' });
	broken.platform = { env: { DB: { prepare() { throw new Error('db down'); } } } };
	const r = await runHandle(broken);
	assert.equal(r.resolved, false);
	assert.equal(r.status, 503);
});
await test('rate limit stops repeated tracking lookups', async () => {
	let last = 0;
	for (let i = 0; i < 12; i++) {
		last = (await runHandle(makeEvent('/track-order', { routeId: '/track-order', method: 'POST', ip: '7.7.7.7', body: 'x' }))).status;
	}
	assert.equal(last, 429);
});
await test('blocked IP gets 403', async () => {
	exec(`INSERT INTO ip_blocks (id,ip_address,type,reason,is_permanent,created_at) VALUES ('b1','6.6.6.6','Manual','spam',1,?)`, now);
	const r = await runHandle(makeEvent('/', { routeId: '/', ip: '6.6.6.6' }));
	assert.equal(r.status, 403);
});
await test('errors do not leak internals', () => {
	const out: any = (handleError as any)({ kind: 'unknown', error: new Error('D1_ERROR: secret sql'), event: { url: new URL('https://x/y') } });
	assert.equal('stack' in out, false);
	assert.equal(JSON.stringify(out).includes('secret sql'), false);
	assert.ok(out.errorId);
});
await test('404 keeps its own message', () => {
	const out: any = (handleError as any)({ kind: 'framework', error: { status: 404, message: 'Not Found' }, event: { url: new URL('https://x/y') } });
	assert.equal(out.message, 'Not Found');
});

// ---------- customer auth (better-auth) ----------
await test('customer can register, log in, and resolve a session', async () => {
	const jar = new Map<string, string>();
	(globalThis as any).__TEST_EVENT__ = {
		cookies: {
			set: (name: string, value: string) => jar.set(name, value),
			get: (name: string) => jar.get(name),
			delete: (name: string) => jar.delete(name)
		},
		url: new URL('https://shop.test/auth/login'),
		request: new Request('https://shop.test/auth/login')
	};
	const auth: any = createAuth(d1, SECRET, 'https://shop.test');
	assert.ok(auth);
	await auth.api.signUpEmail({ body: { name: 'Customer One', email: 'c1@t.local', password: 'customer-pass-1' } });
	jar.clear();
	await assert.rejects(auth.api.signInEmail({ body: { email: 'c1@t.local', password: 'wrong-password' } }));
	await auth.api.signInEmail({ body: { email: 'c1@t.local', password: 'customer-pass-1' } });
	const cookieName = [...jar.keys()].find((k) => k.includes('session_token'));
	assert.ok(cookieName, 'session cookie set: ' + [...jar.keys()].join(','));
	const session = await auth.api.getSession({ headers: new Headers({ cookie: `${cookieName}=${jar.get(cookieName!)}` }) });
	assert.equal(session?.user?.email, 'c1@t.local');
	const none = await auth.api.getSession({ headers: new Headers({ cookie: `${cookieName}=forged` }) });
	assert.equal(none, null);
});

await test('customer can request password reset and set a new password', async () => {
	const jar = new Map<string, string>();
	(globalThis as any).__TEST_EVENT__ = {
		cookies: {
			set: (name: string, value: string) => jar.set(name, value),
			get: (name: string) => jar.get(name),
			delete: (name: string) => jar.delete(name)
		},
		url: new URL('https://shop.test/auth/forgot-password'),
		request: new Request('https://shop.test/auth/forgot-password')
	};
	let capturedToken = '';
	const auth: any = createAuth(d1, SECRET, 'https://shop.test');
	assert.ok(auth);

	// Intercept sendResetPassword or inspect token
	// Better-Auth stores: identifier = `reset-password:${token}`
	// 1. Request reset
	await auth.api.requestPasswordReset({
		body: { email: 'c1@t.local', redirectTo: 'https://shop.test/auth/reset-password' }
	});

	// 2. Query token from verification table
	const allVer = await db.select().from(schema.verification).all();
	const verRow = allVer[0];
	assert.ok(verRow, 'verification row created for reset-password');
	// In Better-Auth, identifier is `reset-password:${token}`
	const token = verRow.identifier.replace('reset-password:', '');

	// 3. Reset password with valid token
	await auth.api.resetPassword({
		body: { newPassword: 'customer-new-pass-2', token }
	});

	// 4. Old password should fail
	await assert.rejects(auth.api.signInEmail({ body: { email: 'c1@t.local', password: 'customer-pass-1' } }));

	// 5. New password should succeed
	jar.clear();
	await auth.api.signInEmail({ body: { email: 'c1@t.local', password: 'customer-new-pass-2' } });
	const cookieName = [...jar.keys()].find((k) => k.includes('session_token'));
	assert.ok(cookieName, 'session cookie set with new password');
});

// ---------- API and menu permissions ----------
const staffAdmin = { id: '2', role: 'Manager', permissions: ['orders'] };
await test('restricted staff is refused by APIs outside their menus', async () => {
	exec(`UPDATE admin_users SET permissions='["orders"]' WHERE id='2'`);
	const row = await db.select().from(schema.adminUsers).where(eq(schema.adminUsers.id, '2')).get();
	const token = await AdminAuthService.createSessionToken(row, SECRET);
	const call = async (path: string, method = 'GET') => (await runHandle(makeEvent(path, { routeId: path, cookie: token, method, body: method === 'GET' ? undefined : 'x' })));
	for (const path of ['/api/admin/customers/orders', '/api/admin/daily-target/breakdown', '/api/admin/media', '/api/admin/some-new-endpoint']) {
		const r = await call(path);
		assert.equal(r.status, 403, path);
		assert.equal(r.resolved, false, path);
	}
	assert.equal((await call('/api/admin/courier/check-fraud', 'POST')).resolved, true);
	assert.equal((await call('/api/admin/search')).resolved, true);
	assert.equal((await call('/api/admin/notifications/poll')).resolved, true);
});
await test('encoded path cannot skip the menu check', async () => {
	const row = await db.select().from(schema.adminUsers).where(eq(schema.adminUsers.id, '2')).get();
	const token = await AdminAuthService.createSessionToken(row, SECRET);
	const viaRoute = await runHandle(makeEvent('/admin/%73ettings/courier', { routeId: '/admin/settings/courier', cookie: token, method: 'POST', body: 'x' }));
	assert.equal(viaRoute.status, 403);
	const viaPath = await runHandle(makeEvent('/admin/%73ettings/courier', { routeId: null, cookie: token, method: 'POST', body: 'x' }));
	assert.equal(viaPath.status, 403);
});
await test('forbidden page GET redirects before any load runs', async () => {
	const row = await db.select().from(schema.adminUsers).where(eq(schema.adminUsers.id, '2')).get();
	const token = await AdminAuthService.createSessionToken(row, SECRET);
	const r = await runHandle(makeEvent('/admin/customers', { routeId: '/admin/customers', cookie: token }));
	assert.equal(r.resolved, false);
	assert.equal(r.location, '/admin/orders');
});
await test('admin with no menus can still reach their profile', async () => {
	exec(`UPDATE admin_users SET permissions='[]' WHERE id='2'`);
	const row = await db.select().from(schema.adminUsers).where(eq(schema.adminUsers.id, '2')).get();
	const token = await AdminAuthService.createSessionToken(row, SECRET);
	const home = await runHandle(makeEvent('/admin', { routeId: '/admin', cookie: token }));
	assert.equal(home.location, '/admin/profile');
	const profile = await runHandle(makeEvent('/admin/profile', { routeId: '/admin/profile', cookie: token }));
	assert.equal(profile.resolved, true);
	exec(`UPDATE admin_users SET permissions='["orders"]' WHERE id='2'`);
});
await test('search returns only permitted domains', async () => {
	const url = new URL('https://shop.test/api/admin/search?q=Rahim');
	const asStaff: any = await (await (searchApi as any)({ url, platform, locals: { admin: staffAdmin } })).json();
	assert.ok(asStaff.orders.length > 0, 'orders allowed');
	assert.equal(asStaff.customers.length, 0, 'customers hidden');
	const asNone: any = await (await (searchApi as any)({ url, platform, locals: { admin: { id: '2', role: 'Manager', permissions: [] } } })).json();
	assert.equal(asNone.orders.length + asNone.customers.length + asNone.products.length, 0);
	const asOwner: any = await (await (searchApi as any)({ url, platform, locals: { admin: { id: '1', role: 'Owner', permissions: ['*'] } } })).json();
	assert.ok(asOwner.customers.length > 0, 'owner sees customers');
	const nav: any = await (await (searchApi as any)({ url: new URL('https://shop.test/x?q=admin'), platform, locals: { admin: staffAdmin } })).json();
	assert.equal(nav.navigation.some((n: any) => n.path === '/admin/admin-control'), false);
});
await test('notifications hide customer details from unrelated staff', async () => {
	const none = { id: '2', role: 'Manager', permissions: ['products'] };
	const body: any = await (await (pollApi as any)({ platform, locals: { admin: none } })).json();
	assert.equal(JSON.stringify(body).includes('01712345678'), false);
	const full: any = await (await (pollApi as any)({ platform, locals: { admin: staffAdmin } })).json();
	assert.ok(full.unreadCount > 0);
	assert.equal(full.latest.category, 'order');
});
await test('upload: avatars for any admin, other folders need a media menu', async () => {
	const none = { id: '2', role: 'Manager', permissions: ['orders'] };
	const send = (folder: string, admin: any) => {
		const fd = new FormData();
		fd.append('folder', folder);
		return (uploadApi as any)({ request: new Request('https://shop.test/x', { method: 'POST', body: fd }), platform, locals: { admin } });
	};
	assert.equal((await send('products', none)).status, 403);
	assert.equal((await send('avatars', none)).status, 400, 'passes the check, then fails on the missing file');
	assert.equal((await send('products', { ...none, permissions: ['gallery'] })).status, 400);
});
await test('restoring an untracked product keeps it untracked', async () => {
	const items = JSON.stringify([{ id: 'p2', quantity: 2 }]);
	await StockService.syncForStatusChange(db, { orderType: 'web', status: 'pending', items }, 'cancelled');
	const s = stock('p2');
	assert.deepEqual([s.t, s.s], [0, 1]);
});
await test('restoring a sold-out tracked product puts it back in stock', async () => {
	exec("UPDATE products SET total_stock=0, stock=0, in_stock=0 WHERE id='p1'");
	const items = JSON.stringify([{ id: 'p1', quantity: 2 }]);
	await StockService.syncForStatusChange(db, { orderType: 'web', status: 'pending', items }, 'cancelled');
	const s = stock('p1');
	assert.deepEqual([s.t, s.s], [2, 1]);
});

// ---------- reviews, rate limits, deferred work ----------
await test('review: bad input is rejected and good input is stored unverified', async () => {
	const send = (fields: Record<string, string | number>) => {
		const fd = new FormData();
		Object.entries(fields).forEach(([k, v]) => fd.append(k, String(v)));
		return (productActions as any).addReview({
			request: new Request('https://shop.test/products/tracked', { method: 'POST', body: fd }),
			platform
		});
	};
	const ok: any = await send({ productId: 'p1', author: 'Rahim', rating: 5, title: 't', content: 'good product' });
	assert.equal(ok.success, true);
	const row: any = sqlite.prepare("select verified v, role r from reviews where author='Rahim'").get();
	assert.equal(row.v, 0);
	assert.equal(row.r, 'কাস্টমার');
	for (const bad of [{ rating: 9 }, { rating: 0 }, { rating: 'x' }]) {
		assert.equal((await send({ productId: 'p1', author: 'A', content: 'c', ...bad })).status, 400, JSON.stringify(bad));
	}
	assert.equal((await send({ productId: 'p1', author: 'A', content: 'x'.repeat(3000) })).status, 400);
	assert.equal((await send({ productId: 'nope', author: 'A', content: 'c' })).status, 404);
});
await test('rate limit tiers cover reviews, cart and the existing routes', () => {
	assert.equal(getRateLimitTier('POST', '/products/tracked'), 'strict');
	assert.equal(getRateLimitTier('GET', '/products/tracked'), null);
	assert.equal(getRateLimitTier('DELETE', '/api/cart'), 'default');
	assert.equal(getRateLimitTier('POST', '/api/cart'), 'default');
	assert.equal(getRateLimitTier('POST', '/checkout'), 'default');
	assert.equal(getRateLimitTier('POST', '/auth/admin-login'), 'strict');
	assert.equal(getRateLimitTier('GET', '/checkout'), null);
});
await test('order follow-ups run through defer when the platform provides it', async () => {
	const deferred: Promise<unknown>[] = [];
	const o = await OrderService.createWebOrder(db, { ...base, items: [{ id: 'p2', quantity: 1 }] }, { defer: (work) => deferred.push(work) });
	assert.equal(deferred.length, 1);
	await Promise.all(deferred);
	const n: any = sqlite.prepare('select count(*) c from notifications where link = ?').get(`/admin/orders/${o.orderId}`);
	assert.equal(n.c, 1);
});

// ---------- visitor analytics ----------
await test('visitor: parse user agent and traffic source accurately', () => {
	const mobileUa = 'Mozilla/5.0 (Linux; Android 13; SM-S901B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36';
	const parsed = VisitorAnalyticsService.parseUserAgent(mobileUa);
	assert.equal(parsed.deviceType, 'mobile');
	assert.equal(parsed.os, 'Android');
	assert.equal(parsed.browser, 'Chrome');

	const desktopUa = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
	const parsedDesktop = VisitorAnalyticsService.parseUserAgent(desktopUa);
	assert.equal(parsedDesktop.deviceType, 'desktop');
	assert.equal(parsedDesktop.os, 'Windows');

	const fbSource = VisitorAnalyticsService.determineTrafficSource({
		sessionId: 's1',
		path: '/',
		fbclid: 'IwAR0123456789'
	});
	assert.equal(fbSource, 'Facebook Ads');

	const ttSource = VisitorAnalyticsService.determineTrafficSource({
		sessionId: 's2',
		path: '/',
		utmSource: 'tiktok'
	});
	assert.equal(ttSource, 'TikTok Ads');

	const googleRef = VisitorAnalyticsService.determineTrafficSource({
		sessionId: 's3',
		path: '/',
		referrer: 'https://www.google.com/search?q=test'
	});
	assert.equal(googleRef, 'Google Search');

	const direct = VisitorAnalyticsService.determineTrafficSource({
		sessionId: 's4',
		path: '/'
	});
	assert.equal(direct, 'Direct');

	const metaBot = VisitorAnalyticsService.determineTrafficSource({
		sessionId: 's5',
		path: '/lp/lal-dheros',
		userAgent: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
	});
	assert.equal(metaBot, 'Meta Ad Review Bot');

	const metaIp = VisitorAnalyticsService.determineTrafficSource({
		sessionId: 's6',
		path: '/lp/lal-dheros',
		ipAddress: '2a03:2880:f80e:25::'
	});
	assert.equal(metaIp, 'Meta Ad Review Bot');
});

await test('visitor: recordVisit creates and updates session', async () => {
	await VisitorAnalyticsService.recordVisit(db, {
		sessionId: 'test-session-123',
		path: '/products/tracked',
		pageTitle: 'Tracked Product',
		city: 'Dhaka',
		country: 'BD',
		fbclid: 'xyz'
	});

	const s1: any = sqlite.prepare('SELECT pageviews_count, traffic_source, city FROM visitor_sessions WHERE session_id = ?').get('test-session-123');
	assert.equal(s1.pageviews_count, 1);
	assert.equal(s1.traffic_source, 'Facebook Ads');
	assert.equal(s1.city, 'Dhaka');

	// Repeat visit on another page
	await VisitorAnalyticsService.recordVisit(db, {
		sessionId: 'test-session-123',
		path: '/checkout',
		pageTitle: 'Checkout'
	});

	const s2: any = sqlite.prepare('SELECT pageviews_count FROM visitor_sessions WHERE session_id = ?').get('test-session-123');
	assert.equal(s2.pageviews_count, 2);

	const pvCount: any = sqlite.prepare('SELECT count(*) c FROM visitor_pageviews WHERE session_id = ?').get('test-session-123');
	assert.equal(pvCount.c, 2);
});
console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
	console.log('Failed:', failures.join(' | '));
	process.exitCode = 1;
}
