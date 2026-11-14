-- Seed Storefront Real Products, Categories, Brands & Specs

DELETE FROM product_specs;

DELETE FROM product_variants;

DELETE FROM products;

DELETE FROM categories;

DELETE FROM brands;

INSERT INTO categories (id, name, slug, icon, sort_order, is_active) VALUES ('cat-beauty-health', 'Beauty & Health', 'beauty-health', 'Sparkles', 0, 1);

INSERT INTO categories (id, name, slug, icon, sort_order, is_active) VALUES ('cat-electronics', 'Electronics & Audio', 'electronics', 'Headphones', 0, 1);

INSERT INTO categories (id, name, slug, icon, sort_order, is_active) VALUES ('cat-books', 'বই ও সাহিত্য', 'books', 'BookOpen', 0, 1);

INSERT INTO categories (id, name, slug, icon, sort_order, is_active) VALUES ('cat-smart-gadgets', 'Smart Gadgets', 'smart-gadgets', 'Watch', 0, 1);

INSERT INTO categories (id, name, slug, icon, sort_order, is_active) VALUES ('cat-groceries', 'গ্রোসারি ও খাদ্য', 'groceries', 'ShoppingBag', 0, 1);

INSERT INTO categories (id, name, slug, icon, sort_order, is_active) VALUES ('cat-fashion', 'Fashion & Style', 'fashion', 'Shirt', 0, 1);

INSERT INTO categories (id, name, slug, icon, sort_order, is_active) VALUES ('cat-science-kit', 'Science Kit', 'science-kit', 'Atom', 0, 1);

INSERT INTO brands (id, name, slug, is_active) VALUES ('brand-1', 'Kirkland', 'kirkland', 1);

INSERT INTO brands (id, name, slug, is_active) VALUES ('brand-2', 'The Ordinary', 'the-ordinary', 1);

INSERT INTO brands (id, name, slug, is_active) VALUES ('brand-3', 'Simple', 'simple', 1);

INSERT INTO brands (id, name, slug, is_active) VALUES ('brand-4', 'COSRX', 'cosrx', 1);

INSERT INTO brands (id, name, slug, is_active) VALUES ('brand-5', 'Bioderma', 'bioderma', 1);

INSERT INTO brands (id, name, slug, is_active) VALUES ('brand-6', 'Neutrogena', 'neutrogena', 1);

INSERT INTO brands (id, name, slug, is_active) VALUES ('brand-7', 'Soundcore / Anker', 'soundcore-anker', 1);

INSERT INTO brands (id, name, slug, is_active) VALUES ('brand-8', 'Oraimo', 'oraimo', 1);

INSERT INTO brands (id, name, slug, is_active) VALUES ('brand-9', 'Anua', 'anua', 1);

INSERT INTO brands (id, name, slug, is_active) VALUES ('brand-10', 'CeraVe', 'cerave', 1);

INSERT INTO brands (id, name, slug, is_active) VALUES ('brand-11', 'Beauty of Joseon', 'beauty-of-joseon', 1);

INSERT INTO brands (id, name, slug, is_active) VALUES ('brand-12', 'AURA Studio', 'aura-studio', 1);

INSERT INTO brands (id, name, slug, is_active) VALUES ('brand-13', 'Zenith', 'zenith', 1);

INSERT INTO brands (id, name, slug, is_active) VALUES ('brand-14', 'গার্ডিয়ান পাবলিকেশন', 'brand-14', 1);

INSERT INTO brands (id, name, slug, is_active) VALUES ('brand-15', 'বাতিঘর', 'brand-15', 1);

INSERT INTO brands (id, name, slug, is_active) VALUES ('brand-16', 'Khaas Food', 'khaas-food', 1);

INSERT INTO brands (id, name, slug, is_active) VALUES ('brand-17', 'AURA Original', 'aura-original', 1);

INSERT INTO brands (id, name, slug, is_active) VALUES ('brand-18', 'অন্যরকম বিজ্ঞানবাক্স', 'brand-18', 1);

INSERT INTO products (
    id, name, slug, tagline, category_id, category, brand_id,
    price, regular_price, sale_price, original_price, cost_price,
    sku, total_stock, stock, in_stock, is_low_stock,
    status, badge, image, description, rating, reviews_count, sales_count
) VALUES (
    'kirkland-minoxidil-5',
    'Kirkland 5% Minoxidil Extra Strength Hair Regrowth Solution',
    'kirkland-5-minoxidil',
    'Clinically proven formula for hair follicle revitalization',
    'cat-beauty-health',
    'beauty-health',
    'brand-1',
    799,
    1490,
    799,
    1490,
    479,
    'SKU-KIRKLAND-5-M',
    50,
    50,
    1,
    0,
    'published',
    'Bestseller',
    '/images/products/kirkland.svg',
    'Kirkland Signature 5% Minoxidil topical solution is clinically proven to help regrow hair in men with androgenetic alopecia.',
    50,
    191,
    397
);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-kirkland-minoxidil-5-1', 'kirkland-minoxidil-5', 'বৈশিষ্ট্য', '5% Minoxidil Extra Strength', 0);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-kirkland-minoxidil-5-2', 'kirkland-minoxidil-5', 'বৈশিষ্ট্য', 'Unscented Topical Solution', 1);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-kirkland-minoxidil-5-3', 'kirkland-minoxidil-5', 'বৈশিষ্ট্য', 'Dropper Included', 2);

INSERT INTO products (
    id, name, slug, tagline, category_id, category, brand_id,
    price, regular_price, sale_price, original_price, cost_price,
    sku, total_stock, stock, in_stock, is_low_stock,
    status, badge, image, description, rating, reviews_count, sales_count
) VALUES (
    'ordinary-niacinamide-10',
    'The Ordinary Niacinamide 10% + Zinc 1% Oil Control Serum',
    'the-ordinary-niacinamide',
    'High-strength vitamin and mineral blemish formula',
    'cat-beauty-health',
    'beauty-health',
    'brand-2',
    1090,
    1850,
    1090,
    1850,
    654,
    'SKU-THE-ORDINARY',
    50,
    50,
    1,
    0,
    'published',
    'Top Rated',
    '/images/products/ordinary.svg',
    'A cult-favorite clarifying serum that visibly minimizes enlarged pores, improves skin texture, and balances oil production.',
    50,
    202,
    419
);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-ordinary-niacinamide-10-1', 'ordinary-niacinamide-10', 'বৈশিষ্ট্য', '10% Pure Niacinamide', 0);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-ordinary-niacinamide-10-2', 'ordinary-niacinamide-10', 'বৈশিষ্ট্য', '1% Zinc PCA', 1);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-ordinary-niacinamide-10-3', 'ordinary-niacinamide-10', 'বৈশিষ্ট্য', 'Regulates Sebum & Pores', 2);

INSERT INTO products (
    id, name, slug, tagline, category_id, category, brand_id,
    price, regular_price, sale_price, original_price, cost_price,
    sku, total_stock, stock, in_stock, is_low_stock,
    status, badge, image, description, rating, reviews_count, sales_count
) VALUES (
    'simple-refreshing-wash',
    'Simple Kind to Skin Refreshing Facial Wash Gel 100% Soap Free',
    'simple-kind-to-skin-wash',
    'Gentle purifying cleanser with multi-vitamins',
    'cat-beauty-health',
    'beauty-health',
    'brand-3',
    760,
    800,
    760,
    800,
    456,
    'SKU-SIMPLE-KIND-',
    50,
    50,
    1,
    0,
    'published',
    'Gentle',
    '/images/products/simple-wash.svg',
    'Cleanses skin thoroughly while removing dirt, oil, and impurities without stripping natural moisture.',
    50,
    199,
    413
);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-simple-refreshing-wash-1', 'simple-refreshing-wash', 'বৈশিষ্ট্য', '100% Soap-Free Formula', 0);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-simple-refreshing-wash-2', 'simple-refreshing-wash', 'বৈশিষ্ট্য', 'Enriched with Vitamin E & Pro-B5', 1);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-simple-refreshing-wash-3', 'simple-refreshing-wash', 'বৈশিষ্ট্য', 'Non-Drying Cleanser', 2);

INSERT INTO products (
    id, name, slug, tagline, category_id, category, brand_id,
    price, regular_price, sale_price, original_price, cost_price,
    sku, total_stock, stock, in_stock, is_low_stock,
    status, badge, image, description, rating, reviews_count, sales_count
) VALUES (
    'cosrx-salicylic-cleanser',
    'COSRX Salicylic Acid Daily Gentle Cleanser Exfoliating Wash',
    'cosrx-salicylic-acid-cleanser',
    'Micro-bubble exfoliating acne cleanser with tea tree oil',
    'cat-beauty-health',
    'beauty-health',
    'brand-4',
    1050,
    1500,
    1050,
    1500,
    630,
    'SKU-COSRX-SALICY',
    50,
    50,
    1,
    0,
    'published',
    'Hot Deal',
    '/images/products/cosrx.svg',
    'Gently cleanses excess sebum and dead skin cells while soothing irritation and preventing breakouts.',
    50,
    204,
    423
);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-cosrx-salicylic-cleanser-1', 'cosrx-salicylic-cleanser', 'বৈশিষ্ট্য', '0.5% Salicylic Acid BHA', 0);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-cosrx-salicylic-cleanser-2', 'cosrx-salicylic-cleanser', 'বৈশিষ্ট্য', 'Natural Tea Tree Leaf Oil', 1);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-cosrx-salicylic-cleanser-3', 'cosrx-salicylic-cleanser', 'বৈশিষ্ট্য', 'Unclogs Stubborn Pores', 2);

INSERT INTO products (
    id, name, slug, tagline, category_id, category, brand_id,
    price, regular_price, sale_price, original_price, cost_price,
    sku, total_stock, stock, in_stock, is_low_stock,
    status, badge, image, description, rating, reviews_count, sales_count
) VALUES (
    'bioderma-sebium-gel',
    'Bioderma Sebium Gel Moussant Purifying Cleansing Foaming Gel',
    'bioderma-sebium-gel-moussant',
    'Dermatological purifying cleanser for combination to oily skin',
    'cat-beauty-health',
    'beauty-health',
    'brand-5',
    1645,
    2300,
    1645,
    2300,
    987,
    'SKU-BIODERMA-SEB',
    50,
    50,
    1,
    0,
    'published',
    'Doctor Recommended',
    '/images/products/bioderma.svg',
    'Limits sebum secretion, purifies the epidermis, and respects the natural cutaneous barrier.',
    48,
    55,
    125
);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-bioderma-sebium-gel-1', 'bioderma-sebium-gel', 'বৈশিষ্ট্য', 'Zinc & Copper Sulphate Formula', 0);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-bioderma-sebium-gel-2', 'bioderma-sebium-gel', 'বৈশিষ্ট্য', 'D.A.F. Patented Complex', 1);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-bioderma-sebium-gel-3', 'bioderma-sebium-gel', 'বৈশিষ্ট্য', 'Soap-free Physiological pH', 2);

INSERT INTO products (
    id, name, slug, tagline, category_id, category, brand_id,
    price, regular_price, sale_price, original_price, cost_price,
    sku, total_stock, stock, in_stock, is_low_stock,
    status, badge, image, description, rating, reviews_count, sales_count
) VALUES (
    'neutrogena-hydro-boost',
    'Neutrogena Hydro Boost Aqua Gel with Hyaluronic Acid & Amino Acids',
    'neutrogena-hydro-boost-aqua-gel',
    'Water-gel moisturizer with continuous 72hr hydration',
    'cat-beauty-health',
    'beauty-health',
    'brand-6',
    1400,
    1850,
    1400,
    1850,
    840,
    'SKU-NEUTROGENA-H',
    50,
    50,
    1,
    0,
    'published',
    'Best Sale',
    '/images/products/neutrogena.svg',
    'Instantly quenches dry skin and boosts skins moisture reservoir for supple, bouncy, radiant hydration.',
    49,
    61,
    137
);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-neutrogena-hydro-boost-1', 'neutrogena-hydro-boost', 'বৈশিষ্ট্য', 'Purified Hyaluronic Acid', 0);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-neutrogena-hydro-boost-2', 'neutrogena-hydro-boost', 'বৈশিষ্ট্য', 'Electrolytes & Amino Acids', 1);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-neutrogena-hydro-boost-3', 'neutrogena-hydro-boost', 'বৈশিষ্ট্য', 'Ultra-light Oil-free Texture', 2);

INSERT INTO products (
    id, name, slug, tagline, category_id, category, brand_id,
    price, regular_price, sale_price, original_price, cost_price,
    sku, total_stock, stock, in_stock, is_low_stock,
    status, badge, image, description, rating, reviews_count, sales_count
) VALUES (
    'soundcore-motion-boom',
    'Anker Soundcore Motion Boom Outdoor Bluetooth Stereo Speaker',
    'soundcore-motion-boom',
    'Titanium drivers with BassUp technology and IPX7 waterproof',
    'cat-electronics',
    'electronics',
    'brand-7',
    8490,
    10500,
    8490,
    10500,
    5094,
    'SKU-SOUNDCORE-MO',
    50,
    50,
    1,
    0,
    'published',
    'New Arrival',
    '/images/products/soundcore.svg',
    'Massive stereo sound designed for outdoors with deep resonant bass and custom EQ.',
    50,
    88,
    191
);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-soundcore-motion-boom-1', 'soundcore-motion-boom', 'বৈশিষ্ট্য', '100% Pure Titanium Diaphragms', 0);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-soundcore-motion-boom-2', 'soundcore-motion-boom', 'বৈশিষ্ট্য', '24 Hours Playtime', 1);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-soundcore-motion-boom-3', 'soundcore-motion-boom', 'বৈশিষ্ট্য', 'Float on Water IPX7', 2);

INSERT INTO products (
    id, name, slug, tagline, category_id, category, brand_id,
    price, regular_price, sale_price, original_price, cost_price,
    sku, total_stock, stock, in_stock, is_low_stock,
    status, badge, image, description, rating, reviews_count, sales_count
) VALUES (
    'oraimo-smart-trimmer',
    'Oraimo SmartGroom Pro Multi-Functional Cordless Trimmer',
    'oraimo-smart-trimmer',
    'Self-sharpening titanium blade with 150min battery runtime',
    'cat-electronics',
    'electronics',
    'brand-8',
    1850,
    2450,
    1850,
    2450,
    1110,
    'SKU-ORAIMO-SMART',
    50,
    50,
    1,
    0,
    'published',
    'New Arrival',
    '/images/products/trimmer.svg',
    'High-precision grooming with zero pull and long-lasting lithium battery.',
    47,
    142,
    299
);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-oraimo-smart-trimmer-1', 'oraimo-smart-trimmer', 'বৈশিষ্ট্য', 'Ultra-Sharp Blades', 0);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-oraimo-smart-trimmer-2', 'oraimo-smart-trimmer', 'বৈশিষ্ট্য', 'Digital Battery Display', 1);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-oraimo-smart-trimmer-3', 'oraimo-smart-trimmer', 'বৈশিষ্ট্য', 'USB Type-C Fast Charging', 2);

INSERT INTO products (
    id, name, slug, tagline, category_id, category, brand_id,
    price, regular_price, sale_price, original_price, cost_price,
    sku, total_stock, stock, in_stock, is_low_stock,
    status, badge, image, description, rating, reviews_count, sales_count
) VALUES (
    'anua-heartleaf-toner',
    'Anua Heartleaf 77% Soothing Facial Toner Hydrating Essence',
    'anua-heartleaf-77-toner',
    'K-Beauty #1 soothing toner for sensitive and redness-prone skin',
    'cat-beauty-health',
    'beauty-health',
    'brand-9',
    1890,
    2400,
    1890,
    2400,
    1134,
    'SKU-ANUA-HEARTLE',
    50,
    50,
    1,
    0,
    'published',
    'Popular',
    '/images/products/anua-toner.svg',
    'Intensively calms breakouts and restores healthy hydration barrier.',
    49,
    340,
    695
);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-anua-heartleaf-toner-1', 'anua-heartleaf-toner', 'বৈশিষ্ট্য', '77% Houttuynia Cordata Extract', 0);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-anua-heartleaf-toner-2', 'anua-heartleaf-toner', 'বৈশিষ্ট্য', 'pH Sub-Acidic Formula', 1);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-anua-heartleaf-toner-3', 'anua-heartleaf-toner', 'বৈশিষ্ট্য', 'Calms Irritated Skin', 2);

INSERT INTO products (
    id, name, slug, tagline, category_id, category, brand_id,
    price, regular_price, sale_price, original_price, cost_price,
    sku, total_stock, stock, in_stock, is_low_stock,
    status, badge, image, description, rating, reviews_count, sales_count
) VALUES (
    'cerave-hydrating-cleanser',
    'CeraVe Hydrating Facial Cleanser with Essential Ceramides',
    'cerave-hydrating-cleanser',
    'Dermatologist developed daily non-comedogenic wash',
    'cat-beauty-health',
    'beauty-health',
    'brand-10',
    1650,
    2100,
    1650,
    2100,
    990,
    'SKU-CERAVE-HYDRA',
    50,
    50,
    1,
    0,
    'published',
    'Popular',
    '/images/products/cerave.svg',
    'Cleanses, hydrates and helps restore the protective skin barrier.',
    50,
    420,
    855
);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-cerave-hydrating-cleanser-1', 'cerave-hydrating-cleanser', 'বৈশিষ্ট্য', '3 Essential Ceramides', 0);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-cerave-hydrating-cleanser-2', 'cerave-hydrating-cleanser', 'বৈশিষ্ট্য', 'MVE Delivery Technology', 1);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-cerave-hydrating-cleanser-3', 'cerave-hydrating-cleanser', 'বৈশিষ্ট্য', 'Fragrance-free', 2);

INSERT INTO products (
    id, name, slug, tagline, category_id, category, brand_id,
    price, regular_price, sale_price, original_price, cost_price,
    sku, total_stock, stock, in_stock, is_low_stock,
    status, badge, image, description, rating, reviews_count, sales_count
) VALUES (
    'boj-sunscreen-spf50',
    'Beauty of Joseon Relief Sun Rice + Probiotics SPF50+ PA++++',
    'beauty-of-joseon-relief-sun',
    'Organic lightweight chemical sunscreen with rice extract',
    'cat-beauty-health',
    'beauty-health',
    'brand-11',
    1250,
    1750,
    1250,
    1750,
    750,
    'SKU-BEAUTY-OF-JO',
    50,
    50,
    1,
    0,
    'published',
    'Popular',
    '/images/products/boj-sunscreen.svg',
    'Moisturizing sun cream that glides onto skin effortlessly with glowing natural finish.',
    50,
    512,
    1039
);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-boj-sunscreen-spf50-1', 'boj-sunscreen-spf50', 'বৈশিষ্ট্য', '30% Rice Extract', 0);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-boj-sunscreen-spf50-2', 'boj-sunscreen-spf50', 'বৈশিষ্ট্য', 'Grain Fermented Probiotics', 1);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-boj-sunscreen-spf50-3', 'boj-sunscreen-spf50', 'বৈশিষ্ট্য', 'Zero White Cast', 2);

INSERT INTO products (
    id, name, slug, tagline, category_id, category, brand_id,
    price, regular_price, sale_price, original_price, cost_price,
    sku, total_stock, stock, in_stock, is_low_stock,
    status, badge, image, description, rating, reviews_count, sales_count
) VALUES (
    'aura-spectrum-x',
    'AURA Spectrum X Spatial Planar Magnetic Studio Headphones',
    'aura-spectrum-x',
    'Audiophile planar acoustic transducer with RF wireless',
    'cat-electronics',
    'electronics',
    'brand-12',
    3490,
    4290,
    3490,
    4290,
    2094,
    'SKU-AURA-SPECTRU',
    50,
    50,
    1,
    0,
    'published',
    'New Arrival',
    '/images/headphones.jpg',
    'Professional grade planar magnetic acoustic system for pristine audio clarity and expansive staging.',
    50,
    312,
    639
);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-aura-spectrum-x-1', 'aura-spectrum-x', 'বৈশিষ্ট্য', '50mm Gold Planar Drivers', 0);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-aura-spectrum-x-2', 'aura-spectrum-x', 'বৈশিষ্ট্য', 'Low-latency 12ms RF Wireless', 1);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-aura-spectrum-x-3', 'aura-spectrum-x', 'বৈশিষ্ট্য', '55hr Battery Life', 2);

INSERT INTO products (
    id, name, slug, tagline, category_id, category, brand_id,
    price, regular_price, sale_price, original_price, cost_price,
    sku, total_stock, stock, in_stock, is_low_stock,
    status, badge, image, description, rating, reviews_count, sales_count
) VALUES (
    'zenith-pulse-anc',
    'ZENITH Pulse ANC Wireless Earbuds with Smart Telemetry Case',
    'zenith-pulse-anc',
    'Dual hybrid dynamic balance armature in-ears',
    'cat-electronics',
    'electronics',
    'brand-13',
    1890,
    2490,
    1890,
    2490,
    1134,
    'SKU-ZENITH-PULSE',
    50,
    50,
    1,
    0,
    'published',
    'Bestseller',
    '/images/earbuds.jpg',
    'True wireless spatial acoustics with real-time codec and battery telemetry on the charging capsule.',
    48,
    184,
    383
);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-zenith-pulse-anc-1', 'zenith-pulse-anc', 'বৈশিষ্ট্য', 'Active Noise Cancellation 42dB', 0);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-zenith-pulse-anc-2', 'zenith-pulse-anc', 'বৈশিষ্ট্য', 'OLED Telemetry Display', 1);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-zenith-pulse-anc-3', 'zenith-pulse-anc', 'বৈশিষ্ট্য', 'Wireless Qi Charging', 2);

INSERT INTO products (
    id, name, slug, tagline, category_id, category, brand_id,
    price, regular_price, sale_price, original_price, cost_price,
    sku, total_stock, stock, in_stock, is_low_stock,
    status, badge, image, description, rating, reviews_count, sales_count
) VALUES (
    'book-paradoxical-sajid',
    'প্যারাডক্সিক্যাল সাজিদ ১ ও ২ (হার্ডকভার কম্বো প্যাক)',
    'paradoxical-sajid-combo',
    'বিশ্বাসের যুক্তিতর্ক ও সংশয় নিরসনের সর্বাধিক বিক্রিত সিরিজ',
    'cat-books',
    'books',
    'brand-14',
    580,
    850,
    580,
    850,
    348,
    'SKU-PARADOXICAL-',
    50,
    50,
    1,
    0,
    'published',
    'Bestseller',
    '/images/products/ordinary.svg',
    'যুক্তিবাদী মনস্তত্ত্ব ও বিশ্বাসের দ্বন্দ্বে তরুণ প্রজন্মের সবচেয়ে আলোচিত বেস্টসেলার বই।',
    49,
    840,
    1695
);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-book-paradoxical-sajid-1', 'book-paradoxical-sajid', 'বৈশিষ্ট্য', 'প্রিমিয়াম হার্ডকভার বাইন্ডিং', 0);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-book-paradoxical-sajid-2', 'book-paradoxical-sajid', 'বৈশিষ্ট্য', 'লেখক আরিফ আজাদ', 1);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-book-paradoxical-sajid-3', 'book-paradoxical-sajid', 'বৈশিষ্ট্য', 'বুকমার্ক ফ্রি', 2);

INSERT INTO products (
    id, name, slug, tagline, category_id, category, brand_id,
    price, regular_price, sale_price, original_price, cost_price,
    sku, total_stock, stock, in_stock, is_low_stock,
    status, badge, image, description, rating, reviews_count, sales_count
) VALUES (
    'book-recharge-battery',
    'রিচার্জ ইউর ডাউন ব্যাটারি - ঝংকার মাহবুব',
    'recharge-your-down-battery',
    'হতাশা কাটিয়ে জীবনে নতুন উদ্যমে ঘুরে দাঁড়ানোর মোটিভেশনাল গাইড',
    'cat-books',
    'books',
    'brand-15',
    320,
    420,
    320,
    420,
    192,
    'SKU-RECHARGE-YOU',
    50,
    50,
    1,
    0,
    'published',
    'Popular',
    '/images/products/kirkland.svg',
    'জীবন যখন ক্লান্তিকর লাগে তখন নিজেকে নতুন করে চার্জ আপ করার জাদুকরী গাইডবুক।',
    48,
    420,
    855
);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-book-recharge-battery-1', 'book-recharge-battery', 'বৈশিষ্ট্য', 'ঝংকার মাহবুবের সহজ সাবলীল লেখা', 0);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-book-recharge-battery-2', 'book-recharge-battery', 'বৈশিষ্ট্য', 'কালারফুল ইলাস্ট্রেশন', 1);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-book-recharge-battery-3', 'book-recharge-battery', 'বৈশিষ্ট্য', 'বাস্তব জীবনের টিপস', 2);

INSERT INTO products (
    id, name, slug, tagline, category_id, category, brand_id,
    price, regular_price, sale_price, original_price, cost_price,
    sku, total_stock, stock, in_stock, is_low_stock,
    status, badge, image, description, rating, reviews_count, sales_count
) VALUES (
    'gadget-oraimo-watch4',
    'Oraimo Watch 4 Plus 2.01" HD Display Bluetooth Calling Smartwatch',
    'oraimo-watch-4-plus',
    'Crystal clear Bluetooth calling with 100+ sports modes',
    'cat-smart-gadgets',
    'smart-gadgets',
    'brand-8',
    2890,
    3890,
    2890,
    3890,
    1734,
    'SKU-ORAIMO-WATCH',
    50,
    50,
    1,
    0,
    'published',
    'Hot Deal',
    '/images/products/trimmer.svg',
    'Premium metallic finish with 24/7 health monitoring and 100+ customized watch faces.',
    49,
    230,
    475
);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-gadget-oraimo-watch4-1', 'gadget-oraimo-watch4', 'বৈশিষ্ট্য', '2.01" Ultra Large HD Screen', 0);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-gadget-oraimo-watch4-2', 'gadget-oraimo-watch4', 'বৈশিষ্ট্য', 'Wireless BT Calling', 1);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-gadget-oraimo-watch4-3', 'gadget-oraimo-watch4', 'বৈশিষ্ট্য', '7 Days Battery Life', 2);

INSERT INTO products (
    id, name, slug, tagline, category_id, category, brand_id,
    price, regular_price, sale_price, original_price, cost_price,
    sku, total_stock, stock, in_stock, is_low_stock,
    status, badge, image, description, rating, reviews_count, sales_count
) VALUES (
    'grocery-khalisa-honey',
    'সুন্দরবনের প্রাকৃতিক চাকভাঙা খলিসা ফুলের খাঁটি মধু ৫০০ গ্রাম',
    'sundarbans-pure-khalisa-honey',
    '১০০% কাঁচা, অপরিশোধিত ও সরাসরি সুন্দরবনের মৌয়ালদের থেকে সংগৃহীত',
    'cat-groceries',
    'groceries',
    'brand-16',
    750,
    950,
    750,
    950,
    450,
    'SKU-SUNDARBANS-P',
    50,
    50,
    1,
    0,
    'published',
    'Organic',
    '/images/products/simple-wash.svg',
    'সুন্দরবনের গভীর অরণ্যের খলিসা ফুলের আসল সুবাস ও রোগ প্রতিরোধ ক্ষমতার অমৃত ভাণ্ডার।',
    50,
    380,
    775
);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-grocery-khalisa-honey-1', 'grocery-khalisa-honey', 'বৈশিষ্ট্য', '১০০% ন্যাচারাল অ্যান্টিঅক্সিডেন্ট', 0);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-grocery-khalisa-honey-2', 'grocery-khalisa-honey', 'বৈশিষ্ট্য', 'কোনো ভেজাল বা সুগার সিরাপ নেই', 1);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-grocery-khalisa-honey-3', 'grocery-khalisa-honey', 'বৈশিষ্ট্য', 'ল্যাব টেস্টেড কোয়ালিটি', 2);

INSERT INTO products (
    id, name, slug, tagline, category_id, category, brand_id,
    price, regular_price, sale_price, original_price, cost_price,
    sku, total_stock, stock, in_stock, is_low_stock,
    status, badge, image, description, rating, reviews_count, sales_count
) VALUES (
    'fashion-aura-drop-tee',
    'AURA Signature Heavyweight 240 GSM Premium Drop-Shoulder Tee',
    'aura-heavyweight-drop-shoulder-tee',
    '100% Combed Compact Cotton with minimalist street aesthetic',
    'cat-fashion',
    'fashion',
    'brand-17',
    850,
    1200,
    850,
    1200,
    510,
    'SKU-AURA-HEAVYWE',
    50,
    50,
    1,
    0,
    'published',
    'Trending',
    '/images/products/cosrx.svg',
    'Ultra comfort relaxed fit drop-shoulder t-shirt that holds shape wash after wash.',
    49,
    160,
    335
);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-fashion-aura-drop-tee-1', 'fashion-aura-drop-tee', 'বৈশিষ্ট্য', '240 GSM Heavyweight Fabric', 0);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-fashion-aura-drop-tee-2', 'fashion-aura-drop-tee', 'বৈশিষ্ট্য', 'Bio-Washed & Silicon Softened', 1);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-fashion-aura-drop-tee-3', 'fashion-aura-drop-tee', 'বৈশিষ্ট্য', 'Ribbed Lycra Collar', 2);

INSERT INTO products (
    id, name, slug, tagline, category_id, category, brand_id,
    price, regular_price, sale_price, original_price, cost_price,
    sku, total_stock, stock, in_stock, is_low_stock,
    status, badge, image, description, rating, reviews_count, sales_count
) VALUES (
    'science-kit-alor-jholok',
    'অন্যরকম বিজ্ঞানবাক্স - আলোর ঝলক সায়েন্স এক্সপেরিমেন্ট কিট',
    'onnorokom-bigganbaksho-alor-jholok',
    'আলোর মজার ২৫টি জাদুকরী বৈজ্ঞানিক পরীক্ষা ও প্রজেক্ট বক্স',
    'cat-science-kit',
    'science-kit',
    'brand-18',
    990,
    1250,
    990,
    1250,
    594,
    'SKU-ONNOROKOM-BI',
    50,
    50,
    1,
    0,
    'published',
    'STEM Certified',
    '/images/products/neutrogena.svg',
    'প্যারিস্কোপ, ক্যালাইডোস্কোপ ও আলোর নানা মজার পরীক্ষা তৈরি করে আনন্দের সাথে বিজ্ঞান শেখার শ্রেষ্ঠ উপহার।',
    50,
    290,
    595
);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-science-kit-alor-jholok-1', 'science-kit-alor-jholok', 'বৈশিষ্ট্য', '২৫টি হাতেকলমে পরীক্ষা', 0);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-science-kit-alor-jholok-2', 'science-kit-alor-jholok', 'বৈশিষ্ট্য', 'ভিডিও টিউটোরিয়াল ম্যানুয়াল', 1);

INSERT INTO product_specs (id, product_id, key, value, sort_order) VALUES ('spec-science-kit-alor-jholok-3', 'science-kit-alor-jholok', 'বৈশিষ্ট্য', '৭ থেকে ১৬ বছর বয়সী শিশুদের জন্য', 2);