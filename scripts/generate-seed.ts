import { productsData } from '../src/lib/modules/products/products.data';
import * as fs from 'fs';
import * as path from 'path';

function escapeSql(str: string | null | undefined): string {
	if (str === null || str === undefined) return 'NULL';
	return `'${str.replace(/'/g, "''")}'`;
}

const categoriesList = [
	{ id: 'cat-beauty-health', slug: 'beauty-health', name: 'Beauty & Health', icon: 'Sparkles' },
	{ id: 'cat-electronics', slug: 'electronics', name: 'Electronics & Audio', icon: 'Headphones' },
	{ id: 'cat-books', slug: 'books', name: 'বই ও সাহিত্য', icon: 'BookOpen' },
	{ id: 'cat-smart-gadgets', slug: 'smart-gadgets', name: 'Smart Gadgets', icon: 'Watch' },
	{ id: 'cat-groceries', slug: 'groceries', name: 'গ্রোসারি ও খাদ্য', icon: 'ShoppingBag' },
	{ id: 'cat-fashion', slug: 'fashion', name: 'Fashion & Style', icon: 'Shirt' },
	{ id: 'cat-science-kit', slug: 'science-kit', name: 'Science Kit', icon: 'Atom' }
];

const brandNames = Array.from(new Set(productsData.map((p) => p.brand).filter(Boolean)));
const brandsList = brandNames.map((name, i) => ({
	id: `brand-${i + 1}`,
	name,
	slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `brand-${i + 1}`
}));

const sqlStatements: string[] = [
	'-- Seed Storefront Real Products, Categories, Brands & Specs',
	'DELETE FROM product_specs;',
	'DELETE FROM product_variants;',
	'DELETE FROM products;',
	'DELETE FROM categories;',
	'DELETE FROM brands;'
];

// Insert Categories
for (const cat of categoriesList) {
	sqlStatements.push(
		`INSERT INTO categories (id, name, slug, icon, sort_order, is_active) VALUES (${escapeSql(cat.id)}, ${escapeSql(cat.name)}, ${escapeSql(cat.slug)}, ${escapeSql(cat.icon)}, 0, 1);`
	);
}

// Insert Brands
for (const b of brandsList) {
	sqlStatements.push(
		`INSERT INTO brands (id, name, slug, is_active) VALUES (${escapeSql(b.id)}, ${escapeSql(b.name)}, ${escapeSql(b.slug)}, 1);`
	);
}

// Insert Products & Specs
for (const p of productsData) {
	const matchedCat = categoriesList.find((c) => c.slug === p.category);
	const categoryId = matchedCat ? matchedCat.id : null;
	const matchedBrand = brandsList.find((b) => b.name === p.brand);
	const brandId = matchedBrand ? matchedBrand.id : null;

	const ratingInt = Math.round((p.rating || 5) * 10);
	const reviewsCount = p.reviewsCount || 100;
	const salesCount = reviewsCount * 2 + 15;

	sqlStatements.push(`
INSERT INTO products (
    id, name, slug, tagline, category_id, category, brand_id,
    price, regular_price, sale_price, original_price, cost_price,
    sku, total_stock, stock, in_stock, is_low_stock,
    status, badge, image, description, rating, reviews_count, sales_count
) VALUES (
    ${escapeSql(p.id)},
    ${escapeSql(p.name)},
    ${escapeSql(p.slug)},
    ${escapeSql(p.tagline || '')},
    ${escapeSql(categoryId)},
    ${escapeSql(p.category)},
    ${escapeSql(brandId)},
    ${p.price},
    ${p.originalPrice || p.price},
    ${p.price},
    ${p.originalPrice || p.price},
    ${Math.round(p.price * 0.6)},
    ${escapeSql('SKU-' + p.slug.toUpperCase().slice(0, 12))},
    50,
    50,
    1,
    0,
    'published',
    ${escapeSql(p.badge || 'Published')},
    ${escapeSql(p.image)},
    ${escapeSql(p.description || p.name)},
    ${ratingInt},
    ${reviewsCount},
    ${salesCount}
);
`.trim());

	// Features to specs
	if (p.features && Array.isArray(p.features)) {
		p.features.forEach((feat, idx) => {
			const specId = `spec-${p.id}-${idx + 1}`;
			sqlStatements.push(
				`INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES (${escapeSql(specId)}, ${escapeSql(p.id)}, 'বৈশিষ্ট্য', ${escapeSql(feat)}, ${idx});`
			);
		});
	}
}

const outPath = path.resolve('drizzle', 'seed_storefront_products.sql');
fs.writeFileSync(outPath, sqlStatements.join('\n\n'), 'utf8');
console.log(`Generated ${sqlStatements.length} SQL statements to ${outPath}`);

