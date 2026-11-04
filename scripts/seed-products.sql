-- ============================================================
-- AB Seed Store: Clear old demo data & insert seed products
-- Run: npx wrangler d1 execute aura --remote --file=scripts/seed-products.sql
-- ============================================================

-- 1. CLEAR OLD ORDER & PRODUCT DATA (order matters for FK)
DELETE FROM order_notes;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM reviews;
DELETE FROM product_specs;
DELETE FROM product_variants;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM brands;
DELETE FROM tags;

-- 2. BRANDS
INSERT INTO brands (id, name, slug, is_active, is_featured, sort_order, created_at, updated_at) VALUES
('brand-abseed',   'AB Seed',         'ab-seed',         1, 1, 1, 1730700000000, 1730700000000),
('brand-lalbagh',  'লালবাগ সিড',      'lalbagh-seed',    1, 0, 2, 1730700000000, 1730700000000),
('brand-ispahani', 'ইস্পাহানি এগ্রি', 'ispahani-agri',   1, 0, 3, 1730700000000, 1730700000000),
('brand-metal',    'মেটাল সিড',       'metal-seed',      1, 0, 4, 1730700000000, 1730700000000),
('brand-syngenta', 'Syngenta',        'syngenta',        1, 0, 5, 1730700000000, 1730700000000);

-- 3. TAGS
INSERT INTO tags (id, name, slug, badge_color, home_show, priority, is_active, created_at, updated_at) VALUES
('tag-winter',     'শীতকালীন',         'winter',          'bg-sky-50 text-sky-700',      'Yes', '1', 1, 1730700000000, 1730700000000),
('tag-summer',     'গ্রীষ্মকালীন',      'summer',          'bg-amber-50 text-amber-700',  'Yes', '2', 1, 1730700000000, 1730700000000),
('tag-hybrid',     'হাইব্রিড',         'hybrid',          'bg-emerald-50 text-emerald-700','Yes','3', 1, 1730700000000, 1730700000000),
('tag-rooftop',    'ছাদবাগান',         'rooftop-garden',  'bg-green-50 text-green-700',  'Yes', '4', 1, 1730700000000, 1730700000000),
('tag-organic',    'অর্গানিক',         'organic',         'bg-lime-50 text-lime-700',    'Yes', '5', 1, 1730700000000, 1730700000000),
('tag-bestseller', 'বেস্টসেলার',       'bestseller',      'bg-rose-50 text-rose-700',    'Yes', '6', 1, 1730700000000, 1730700000000),
('tag-new',        'নতুন',             'new',             'bg-indigo-50 text-indigo-700','Yes', '7', 1, 1730700000000, 1730700000000);

-- 4. CATEGORIES (Parent → Sub → Child hierarchy)

-- Parent Categories
INSERT INTO categories (id, name, slug, parent_id, icon, image, sort_order, is_active, description, created_at, updated_at) VALUES
('cat-vegetable',  'সবজি বীজ',                 'sobji-bij',         NULL, '🥬', '/images/categories/category-vegetables.webp', 1, 1, 'দেশি ও বিদেশি সবজি বীজের সংগ্রহ',       1730700000000, 1730700000000),
('cat-flower',     'ফুল বীজ',                   'ful-bij',           NULL, '🌸', '/images/categories/category-ful.webp', 2, 1, 'রঙিন ও সুগন্ধি ফুলের বীজ',              1730700000000, 1730700000000),
('cat-fruit',      'ফল বীজ',                    'fol-bij',           NULL, '🍉', '/images/categories/category-tormuj.webp', 3, 1, 'দেশি-বিদেশি ফলের বীজ সংগ্রহ',            1730700000000, 1730700000000),
('cat-medicinal',  'ঔষধি বীজ',                  'oushodi-bij',       NULL, '🌿', '/images/categories/category-medicinal.webp', 4, 1, 'ঔষধি ও ভেষজ গাছের বীজ',                 1730700000000, 1730700000000),
('cat-tools',      'কৃষি টুল ও সরঞ্জাম',         'krishi-tools',      NULL, '🛠️', '/images/categories/category-krishi-tool.webp', 5, 1, 'বাগানের যন্ত্রপাতি ও সরঞ্জাম',            1730700000000, 1730700000000),
('cat-pesticide',  'কীটনাশক ও সার',              'kitnashok-sar',     NULL, '🧪', '/images/categories/ab-seed-pesticide-category.webp', 6, 1, 'ফসল সুরক্ষা ও পুষ্টি',                    1730700000000, 1730700000000);

-- Sub Categories (under সবজি বীজ)
INSERT INTO categories (id, name, slug, parent_id, icon, sort_order, is_active, description, created_at, updated_at) VALUES
('sub-morich',     'মরিচ',             'morich',            'cat-vegetable', '🌶️', 1,  1, 'বিভিন্ন জাতের মরিচের বীজ',   1730700000000, 1730700000000),
('sub-begun',      'বেগুন',             'begun',             'cat-vegetable', '🍆', 2,  1, 'দেশি ও বিদেশি বেগুনের বীজ',  1730700000000, 1730700000000),
('sub-tomato',     'টমেটো',             'tomato',            'cat-vegetable', '🍅', 3,  1, 'চেরি, স্টেক ও হাইব্রিড টমেটো', 1730700000000, 1730700000000),
('sub-kumra',      'কুমড়া',             'kumra',             'cat-vegetable', '🎃', 4,  1, 'মিষ্টি ও চাল কুমড়া',         1730700000000, 1730700000000),
('sub-shosha',     'শসা ও করলা',        'shosha-korola',     'cat-vegetable', '🥒', 5,  1, 'শসা, করলা ও ঝিঙে',           1730700000000, 1730700000000),
('sub-shim',       'শিম ও বরবটি',       'shim-borboti',      'cat-vegetable', '🫘', 6,  1, 'দেশি সিম, বরবটি',            1730700000000, 1730700000000),
('sub-leafy',      'পাতা জাতীয়',        'pata-jatiyo',       'cat-vegetable', '🥬', 7,  1, 'পুঁইশাক, পালংশাক, ধনিয়া',    1730700000000, 1730700000000),
('sub-winter-veg', 'শীতকালীন সবজি',     'shitkali-sobji',    'cat-vegetable', '❄️', 8,  1, 'ফুলকপি, বাঁধাকপি, শালগম',    1730700000000, 1730700000000),
('sub-lau',        'লাউ ও ধুন্দুল',      'lau-dhundul',       'cat-vegetable', '🫛', 9,  1, 'লাউ, ধুন্দুল, চিচিঙ্গা',      1730700000000, 1730700000000);

-- Sub Categories (under ফুল বীজ)
INSERT INTO categories (id, name, slug, parent_id, icon, sort_order, is_active, description, created_at, updated_at) VALUES
('sub-zinnia',     'জিনিয়া',            'zinnia',            'cat-flower', '🌻', 1, 1, 'বিভিন্ন রঙের জিনিয়া',         1730700000000, 1730700000000),
('sub-marigold',   'গাঁদা ও ক্যালেন্ডুলা','gada-calendula',    'cat-flower', '🌼', 2, 1, 'গাঁদা ফুলের জাত',              1730700000000, 1730700000000),
('sub-sunflower',  'সূর্যমুখী',           'surjomukhi',        'cat-flower', '🌻', 3, 1, 'সূর্যমুখী ও ডেইজি',            1730700000000, 1730700000000),
('sub-other-flower','অন্যান্য ফুল',       'other-flower',      'cat-flower', '💐', 4, 1, 'কসমস, পর্তুলিকা, ওয়াইল্ডফ্লাওয়ার', 1730700000000, 1730700000000);

-- Sub Categories (under ফল বীজ)
INSERT INTO categories (id, name, slug, parent_id, icon, sort_order, is_active, description, created_at, updated_at) VALUES
('sub-watermelon', 'তরমুজ',             'tormuj',            'cat-fruit', '🍉', 1, 1, 'দেশি ও হাইব্রিড তরমুজ',       1730700000000, 1730700000000),
('sub-melon',      'রকমেলন ও সাম্মাম',   'rockmelon-sammam',  'cat-fruit', '🍈', 2, 1, 'বিভিন্ন জাতের মেলন',           1730700000000, 1730700000000),
('sub-papaya',     'পেঁপে ও প্যাশনফ্রুট', 'pepe-passion',      'cat-fruit', '🍑', 3, 1, 'পেঁপে, প্যাশনফ্রুট, আম',       1730700000000, 1730700000000);

-- 5. PRODUCTS

-- === সবজি বীজ > মরিচ ===
INSERT INTO products (id, name, slug, category_id, category, sub_category_id, brand_id, price, regular_price, sale_price, original_price, total_stock, opening_stock, status, badge, image, description, rating, reviews_count, created_at, updated_at) VALUES
('p-morich-1', 'বিদেশি সবুজ লম্বা মরিচের বীজ', 'bideshi-sobuj-lomba-morich', 'cat-vegetable', 'সবজি বীজ', 'sub-morich', 'brand-abseed', 95, 120, 95, 120, 500, 500, 'published', 'Bestseller', '/images/products/placeholder-morich-green.webp', 'উচ্চ ফলনশীল বিদেশি জাতের সবুজ লম্বা মরিচ। প্রতিটি গাছে ৫০-৮০টি মরিচ ধরে। ছাদবাগান ও মাঠ চাষ উভয়ের জন্য উপযোগী। প্যাকেটে প্রায় ৩০-৪০টি বীজ।', 48, 85, 1730700000000, 1730700000000),

('p-morich-2', 'বিদেশি লাল লম্বা মরিচের বীজ', 'bideshi-lal-lomba-morich', 'cat-vegetable', 'সবজি বীজ', 'sub-morich', 'brand-abseed', 86, 110, 86, 110, 400, 400, 'published', NULL, '/images/products/placeholder-morich-red.webp', 'ঝাল ও সুগন্ধি লাল লম্বা মরিচ। রান্নায় দারুণ স্বাদ ও রঙ যোগ করে। বাণিজ্যিক চাষে অধিক লাভজনক। প্যাকেটে ৩০+ বীজ।', 47, 62, 1730700000000, 1730700000000),

('p-morich-3', 'এক গাছে ৫ রঙের মরিচের বীজ', 'ek-gache-5-ronger-morich', 'cat-vegetable', 'সবজি বীজ', 'sub-morich', 'brand-abseed', 120, 150, 120, 150, 300, 300, 'published', 'New', '/images/products/placeholder-morich-5color.webp', 'একটি গাছেই ৫টি ভিন্ন রঙের মরিচ ধরে — সাদা, হলুদ, কমলা, লাল ও বেগুনি। শোভাবর্ধক ও ছাদবাগানে দারুণ। প্যাকেটে ১৫-২০টি বীজ।', 49, 120, 1730700000000, 1730700000000),

-- === সবজি বীজ > বেগুন ===
('p-begun-1', 'কালো তাল বেগুনের বীজ', 'kalo-tal-begun', 'cat-vegetable', 'সবজি বীজ', 'sub-begun', 'brand-abseed', 120, 150, 120, 150, 450, 450, 'published', 'Bestseller', '/images/products/placeholder-begun-tal.webp', 'বড় আকারের কালো তাল বেগুন। ভর্তা ও ভাজিতে অতুলনীয় স্বাদ। প্রতিটি বেগুন ২৫০-৫০০ গ্রাম ওজনের হয়। প্যাকেটে ৩০+ বীজ।', 49, 95, 1730700000000, 1730700000000),

('p-begun-2', 'বিদেশি সবুজ বেগুনের বীজ', 'bideshi-sobuj-begun', 'cat-vegetable', 'সবজি বীজ', 'sub-begun', 'brand-abseed', 90, 120, 90, 120, 350, 350, 'published', NULL, '/images/products/placeholder-begun-green.webp', 'হালকা সবুজ রঙের বিদেশি জাতের বেগুন। নরম ও সুস্বাদু। তরকারি ও গ্রিলে চমৎকার। প্যাকেটে ৩০+ বীজ।', 46, 55, 1730700000000, 1730700000000),

('p-begun-3', 'বারি ১২ কেজি বেগুনের বীজ', 'bari-12-keji-begun', 'cat-vegetable', 'সবজি বীজ', 'sub-begun', 'brand-lalbagh', 145, 180, 145, 180, 250, 250, 'published', NULL, '/images/products/placeholder-begun-bari12.webp', 'BARI-12 জাতের উন্নত বেগুন। প্রতি গাছে ১৫-২০ কেজি পর্যন্ত ফলন। রোগ প্রতিরোধী ও অধিক ফলনশীল। প্যাকেটে ২০+ বীজ।', 48, 78, 1730700000000, 1730700000000),

-- === সবজি বীজ > টমেটো ===
('p-tomato-1', 'লাল চেরি টমেটোর বীজ', 'lal-cherry-tomato', 'cat-vegetable', 'সবজি বীজ', 'sub-tomato', 'brand-abseed', 120, 150, 120, 150, 600, 600, 'published', 'Bestseller', '/images/products/placeholder-tomato-cherry.webp', 'মিষ্টি স্বাদের ছোট লাল চেরি টমেটো। সালাদ ও স্ন্যাকসে দারুণ। ছাদবাগানে টবে চাষ করা যায়। প্যাকেটে ৪০+ বীজ।', 49, 145, 1730700000000, 1730700000000),

('p-tomato-2', 'কালো টমেটোর বীজ', 'kalo-tomato', 'cat-vegetable', 'সবজি বীজ', 'sub-tomato', 'brand-abseed', 120, 160, 120, 160, 200, 200, 'published', 'New', '/images/products/placeholder-tomato-black.webp', 'বিরল কালো রঙের টমেটো — অ্যান্টিঅক্সিডেন্ট সমৃদ্ধ ও অনন্য স্বাদ। ছাদবাগানের প্রিমিয়াম আইটেম। প্যাকেটে ২০+ বীজ।', 47, 40, 1730700000000, 1730700000000),

('p-tomato-3', 'স্টেক টমেটোর বীজ', 'steak-tomato', 'cat-vegetable', 'সবজি বীজ', 'sub-tomato', 'brand-abseed', 120, 150, 120, 150, 350, 350, 'published', NULL, '/images/products/placeholder-tomato-steak.webp', 'বড় আকারের মাংসল স্টেক টমেটো। বার্গার ও স্যান্ডউইচে পারফেক্ট। প্রতিটি ২০০-৩০০ গ্রাম। প্যাকেটে ২০+ বীজ।', 46, 60, 1730700000000, 1730700000000),

('p-tomato-4', 'ম্যাংগো টমেটোর বীজ', 'mango-tomato', 'cat-vegetable', 'সবজি বীজ', 'sub-tomato', 'brand-abseed', 90, 120, 90, 120, 300, 300, 'published', NULL, '/images/products/placeholder-tomato-mango.webp', 'আমের মতো হলুদ রঙের মিষ্টি টমেটো। সালাদ ও জুসে অসাধারণ স্বাদ। প্যাকেটে ২৫+ বীজ।', 48, 55, 1730700000000, 1730700000000),

-- === সবজি বীজ > কুমড়া ===
('p-kumra-1', 'হাইব্রিড কুমড়া বীজ লন্ডন-২', 'hybrid-kumra-london-2', 'cat-vegetable', 'সবজি বীজ', 'sub-kumra', 'brand-abseed', 190, 250, 190, 250, 200, 200, 'published', 'Flagship', '/images/products/placeholder-kumra-hybrid.webp', 'F1 হাইব্রিড মিষ্টি কুমড়া "লন্ডন-২"। প্রতিটি কুমড়া ৩-৫ কেজি ওজনের। উচ্চ ফলন ও রোগ প্রতিরোধী। প্যাকেটে ১০টি বীজ।', 49, 88, 1730700000000, 1730700000000),

('p-kumra-2', 'জাপানি কুমড়ার বীজ', 'japani-kumra', 'cat-vegetable', 'সবজি বীজ', 'sub-kumra', 'brand-abseed', 120, 150, 120, 150, 250, 250, 'published', NULL, '/images/products/placeholder-kumra-japani.webp', 'ছোট সবুজ জাপানি মিষ্টি কুমড়া। ১-২ কেজি ওজন। মিষ্টতা ও পুষ্টিতে অতুলনীয়। প্যাকেটে ১০-১৫টি বীজ।', 47, 65, 1730700000000, 1730700000000),

('p-kumra-3', 'জায়েন্ট কুমড়ার বীজ (২৫-৩৫ কেজি)', 'giant-kumra', 'cat-vegetable', 'সবজি বীজ', 'sub-kumra', 'brand-abseed', 90, 120, 90, 120, 150, 150, 'published', 'New', '/images/products/placeholder-kumra-giant.webp', 'বিশাল আকারের কুমড়া — প্রতিটি ২৫ থেকে ৩৫ কেজি পর্যন্ত! প্রতিযোগিতা ও বাণিজ্যিক চাষে জনপ্রিয়। প্যাকেটে ৫টি বীজ।', 48, 42, 1730700000000, 1730700000000),

-- === সবজি বীজ > শসা ও করলা ===
('p-shosha-1', 'এরাবিয়ান শসার বীজ', 'arabian-shosha', 'cat-vegetable', 'সবজি বীজ', 'sub-shosha', 'brand-abseed', 120, 150, 120, 150, 400, 400, 'published', NULL, '/images/products/placeholder-shosha-arabian.webp', 'খাটো ও মোটা এরাবিয়ান শসা। কুড়মুড়ে ও রসালো। সালাদ ও জুসে চমৎকার। প্যাকেটে ২০+ বীজ।', 47, 70, 1730700000000, 1730700000000),

('p-shosha-2', 'লম্বা সবুজ করলা (Cui Nen) বীজ', 'lomba-sobuj-korola', 'cat-vegetable', 'সবজি বীজ', 'sub-shosha', 'brand-abseed', 60, 80, 60, 80, 500, 500, 'published', NULL, '/images/products/placeholder-korola-green.webp', 'চীনা জাতের লম্বা সবুজ করলা। কম তিতা, বেশি ফলন। দৈর্ঘ্য ২০-৩০ সে.মি.। প্যাকেটে ১৫+ বীজ।', 46, 48, 1730700000000, 1730700000000),

-- === সবজি বীজ > শিম ও বরবটি ===
('p-shim-1', 'লাল সিমের বীজ', 'lal-shim', 'cat-vegetable', 'সবজি বীজ', 'sub-shim', 'brand-abseed', 75, 100, 75, 100, 600, 600, 'published', NULL, '/images/products/placeholder-shim-lal.webp', 'দেশি জাতের বেগুনি-লাল সিম। শীতকালে প্রচুর ফলন। ভর্তা ও তরকারিতে অসাধারণ। প্যাকেটে ২০+ বীজ।', 48, 90, 1730700000000, 1730700000000),

('p-shim-2', 'লম্বা বরবটির বীজ', 'lomba-borboti', 'cat-vegetable', 'সবজি বীজ', 'sub-shim', 'brand-abseed', 120, 150, 120, 150, 350, 350, 'published', NULL, '/images/products/placeholder-borboti-lomba.webp', 'লম্বা সবুজ বরবটি — দৈর্ঘ্য ৩০-৪৫ সে.মি.। সারাবছর চাষযোগ্য। ভাজি ও তরকারিতে চমৎকার। প্যাকেটে ২০+ বীজ।', 47, 72, 1730700000000, 1730700000000),

-- === সবজি বীজ > পাতা জাতীয় ===
('p-leafy-1', 'দেশি ধনিয়া পাতার বীজ', 'deshi-dhonia-pata', 'cat-vegetable', 'সবজি বীজ', 'sub-leafy', 'brand-abseed', 70, 90, 70, 90, 800, 800, 'published', 'Bestseller', '/images/products/placeholder-dhonia.webp', 'সুগন্ধি দেশি ধনিয়া পাতার বীজ। রান্নায় অপরিহার্য মসলা। টবে ও বাগানে সহজে চাষ করা যায়। প্যাকেটে প্রায় ৫ গ্রাম।', 49, 200, 1730700000000, 1730700000000),

('p-leafy-2', 'মোটাডগা লাল পুঁইশাকের বীজ', 'motadoga-lal-puishak', 'cat-vegetable', 'সবজি বীজ', 'sub-leafy', 'brand-abseed', 60, 80, 60, 80, 500, 500, 'published', NULL, '/images/products/placeholder-puishak-lal.webp', 'গাঢ় লাল রঙের মোটা ডগা পুঁইশাক। পুষ্টিগুণে ভরপুর, আয়রন সমৃদ্ধ। ছাদবাগানে দারুণ ফলন। প্যাকেটে ৩০+ বীজ।', 47, 58, 1730700000000, 1730700000000),

-- === সবজি বীজ > শীতকালীন সবজি ===
('p-winter-1', 'পরীক্ষিত ব্রোকলির বীজ', 'porikhkhito-broccoli', 'cat-vegetable', 'সবজি বীজ', 'sub-winter-veg', 'brand-abseed', 120, 160, 120, 160, 300, 300, 'published', NULL, '/images/products/placeholder-broccoli.webp', 'উচ্চমানের পরীক্ষিত ব্রোকলি বীজ। বড় ও ঘন ফুল। শীতকালে অক্টোবর-ডিসেম্বরে বপন করুন। প্যাকেটে ৫০+ বীজ।', 48, 75, 1730700000000, 1730700000000),

('p-winter-2', 'ফুলকপির বীজ', 'fulkopir-bij', 'cat-vegetable', 'সবজি বীজ', 'sub-winter-veg', 'brand-abseed', 120, 150, 120, 150, 400, 400, 'published', NULL, '/images/products/placeholder-fulkopi.webp', 'সাদা ও ঘন ফুলকপি। শীতকালের জনপ্রিয় সবজি। প্রতিটি ৮০০ গ্রাম থেকে ১.৫ কেজি। প্যাকেটে ৫০+ বীজ।', 48, 110, 1730700000000, 1730700000000),

('p-winter-3', 'বাঁধাকপির বীজ', 'badhakopir-bij', 'cat-vegetable', 'সবজি বীজ', 'sub-winter-veg', 'brand-abseed', 120, 150, 120, 150, 350, 350, 'published', NULL, '/images/products/placeholder-badhakopi.webp', 'শীতকালীন বড় বাঁধাকপি। সবুজ পাতা, শক্ত গোল মাথা। প্রতিটি ১-২ কেজি। প্যাকেটে ৫০+ বীজ।', 47, 85, 1730700000000, 1730700000000),

('p-winter-4', 'বেগুনি বাঁধাকপির বীজ', 'beguni-badhakopi', 'cat-vegetable', 'সবজি বীজ', 'sub-winter-veg', 'brand-abseed', 120, 160, 120, 160, 200, 200, 'published', 'New', '/images/products/placeholder-badhakopi-purple.webp', 'আকর্ষণীয় বেগুনি রঙের বাঁধাকপি। সালাদে ও রান্নায় অসাধারণ। অ্যান্টিঅক্সিডেন্ট সমৃদ্ধ। প্যাকেটে ৩০+ বীজ।', 48, 35, 1730700000000, 1730700000000),

-- === সবজি বীজ > লাউ ও ধুন্দুল ===
('p-lau-1', 'হাইব্রিড লাউ সুবর্ণা', 'hybrid-lau-suborna', 'cat-vegetable', 'সবজি বীজ', 'sub-lau', 'brand-abseed', 120, 150, 120, 150, 300, 300, 'published', NULL, '/images/products/placeholder-lau-suborna.webp', 'F1 হাইব্রিড লাউ "সুবর্ণা"। লম্বা ও সুন্দর আকৃতি। প্রতিটি ১.৫-৩ কেজি। উচ্চ ফলনশীল। প্যাকেটে ১০টি বীজ।', 47, 60, 1730700000000, 1730700000000),

('p-lau-2', 'হাইব্রিড ধুন্দুল হোয়াইট প্রিন্স', 'hybrid-dhundul-white-prince', 'cat-vegetable', 'সবজি বীজ', 'sub-lau', 'brand-abseed', 90, 120, 90, 120, 250, 250, 'published', NULL, '/images/products/placeholder-dhundul-white.webp', 'সাদা রঙের মসৃণ ধুন্দুল। ঝোল ও ভাজিতে অতুলনীয়। গ্রীষ্মকালীন সবজি। প্যাকেটে ১৫+ বীজ।', 46, 42, 1730700000000, 1730700000000),

-- === সবজি বীজ (অন্যান্য) ===
('p-misc-1', 'মিক্স কালার ক্যাপসিকাম বীজ', 'mix-color-capsicum', 'cat-vegetable', 'সবজি বীজ', 'sub-morich', 'brand-abseed', 165, 200, 165, 200, 200, 200, 'published', NULL, '/images/products/placeholder-capsicum-mix.webp', 'লাল, হলুদ ও সবুজ — তিন রঙের ক্যাপসিকাম বীজ একত্রে। সালাদ, পিৎজা ও রান্নায় ব্যবহার্য। প্যাকেটে ২০+ বীজ।', 48, 65, 1730700000000, 1730700000000),

('p-misc-2', 'আকর্ষণীয় লাল ঢেঁড়সের বীজ', 'lal-dheros', 'cat-vegetable', 'সবজি বীজ', NULL, 'brand-abseed', 145, 180, 145, 180, 200, 200, 'published', 'New', '/images/products/placeholder-dheros-lal.webp', 'গাঢ় লাল রঙের ঢেঁড়স — দেখতে অসাধারণ ও পুষ্টিকর। রান্না করলে সবুজ রঙ ধারণ করে। ছাদবাগানে চমৎকার। প্যাকেটে ২০+ বীজ।', 47, 38, 1730700000000, 1730700000000),

('p-misc-3', 'F1 হাইব্রিড বিটরুটের বীজ', 'f1-hybrid-bitroot', 'cat-vegetable', 'সবজি বীজ', 'sub-winter-veg', 'brand-abseed', 120, 150, 120, 150, 300, 300, 'published', NULL, '/images/products/placeholder-bitroot.webp', 'গাঢ় লাল রঙের F1 হাইব্রিড বিটরুট। জুস ও সালাদে অসাধারণ। আয়রন ও ফলিক এসিড সমৃদ্ধ। প্যাকেটে ৫০+ বীজ।', 48, 55, 1730700000000, 1730700000000),

-- === ফুল বীজ > জিনিয়া ===
('p-zinnia-1', 'মাল্টি কালার জিনিয়া ফুলের বীজ', 'multi-color-zinnia', 'cat-flower', 'ফুল বীজ', 'sub-zinnia', 'brand-abseed', 145, 180, 145, 180, 500, 500, 'published', 'Bestseller', '/images/products/placeholder-zinnia-mix.webp', 'একটি প্যাকেটে ৭+ রঙের জিনিয়া ফুল — লাল, হলুদ, সাদা, গোলাপি, কমলা। ছাদবাগানে ও বারান্দায় সহজে ফোটে। প্যাকেটে ৫০+ বীজ।', 49, 180, 1730700000000, 1730700000000),

('p-zinnia-2', 'লাল জিনিয়া ফুলের বীজ', 'lal-zinnia', 'cat-flower', 'ফুল বীজ', 'sub-zinnia', 'brand-abseed', 90, 120, 90, 120, 400, 400, 'published', NULL, '/images/products/placeholder-zinnia-red.webp', 'উজ্জ্বল লাল রঙের ডাবল পাপড়ি জিনিয়া। দীর্ঘদিন ফুল থাকে। প্যাকেটে ৫০+ বীজ।', 48, 90, 1730700000000, 1730700000000),

('p-zinnia-3', 'সাদা জিনিয়া ফুলের বীজ', 'sada-zinnia', 'cat-flower', 'ফুল বীজ', 'sub-zinnia', 'brand-abseed', 70, 90, 70, 90, 350, 350, 'published', NULL, '/images/products/placeholder-zinnia-white.webp', 'শুভ্র সাদা জিনিয়া ফুল। বিয়ে ও অনুষ্ঠানের সাজসজ্জায় জনপ্রিয়। প্যাকেটে ৫০+ বীজ।', 47, 55, 1730700000000, 1730700000000),

('p-zinnia-4', 'হলুদ জিনিয়া ফুলের বীজ', 'holud-zinnia', 'cat-flower', 'ফুল বীজ', 'sub-zinnia', 'brand-abseed', 70, 90, 70, 90, 400, 400, 'published', NULL, '/images/products/placeholder-zinnia-yellow.webp', 'সোনালি হলুদ জিনিয়া — বাগানে রোদের মতো ঔজ্জ্বল্য আনে। প্যাকেটে ৫০+ বীজ।', 47, 62, 1730700000000, 1730700000000),

-- === ফুল বীজ > অন্যান্য ===
('p-flower-1', 'মিক্স কালার সূর্যমুখী ফুলের বীজ', 'mix-sunflower', 'cat-flower', 'ফুল বীজ', 'sub-sunflower', 'brand-abseed', 45, 70, 45, 70, 600, 600, 'published', NULL, '/images/products/placeholder-sunflower-mix.webp', 'ছোট ও বড় — বিভিন্ন রঙের সূর্যমুখী মিক্স। ছাদবাগানে দারুণ শোভা। প্যাকেটে ২০+ বীজ।', 48, 95, 1730700000000, 1730700000000),

('p-flower-2', 'মিক্স কালার পর্তুলিকা ফুলের বীজ', 'mix-portulica', 'cat-flower', 'ফুল বীজ', 'sub-other-flower', 'brand-abseed', 145, 180, 145, 180, 300, 300, 'published', NULL, '/images/products/placeholder-portulica-mix.webp', 'টাইম ফুল বা পর্তুলিকা — সকালে ফোটে, বিকেলে বন্ধ হয়। ১০+ রঙের মিশ্রণ। খরায় বাঁচে। প্যাকেটে ১০০+ বীজ।', 49, 110, 1730700000000, 1730700000000),

('p-flower-3', 'বর্ণিল ক্যালেন্ডুলা ফুলের বীজ', 'bornilo-calendula', 'cat-flower', 'ফুল বীজ', 'sub-marigold', 'brand-abseed', 95, 120, 95, 120, 350, 350, 'published', NULL, '/images/products/placeholder-calendula-mix.webp', 'কমলা, হলুদ ও লাল রঙের ক্যালেন্ডুলা। ঔষধি গুণসম্পন্ন ও সুন্দর। শীতকালে চমৎকার ফোটে। প্যাকেটে ৩০+ বীজ।', 48, 70, 1730700000000, 1730700000000),

('p-flower-4', 'মিক্সড ওয়াইল্ড ফ্লাওয়ার বীজ', 'mixed-wildflower', 'cat-flower', 'ফুল বীজ', 'sub-other-flower', 'brand-abseed', 45, 70, 45, 70, 500, 500, 'published', NULL, '/images/products/placeholder-wildflower-mix.webp', '১৫+ প্রজাতির বুনোফুলের মিশ্রণ। ছিটিয়ে দিলেই গজায়। ছাদ, বারান্দা ও মাঠে প্রাকৃতিক সৌন্দর্য। প্যাকেটে ২০০+ বীজ।', 47, 85, 1730700000000, 1730700000000),

('p-flower-5', 'Crystal Daisy সাদা ডেইজি ফুলের বীজ', 'crystal-daisy', 'cat-flower', 'ফুল বীজ', 'sub-sunflower', 'brand-abseed', 90, 120, 90, 120, 250, 250, 'published', NULL, '/images/products/placeholder-daisy-white.webp', 'ছোট সাদা ডেইজি ফুল — মিনিমালিস্ট বাগানে দারুণ। ধীরে ধীরে ছড়িয়ে পড়ে। প্যাকেটে ৫০+ বীজ।', 46, 42, 1730700000000, 1730700000000),

-- === ফল বীজ > তরমুজ ===
('p-tormuj-1', 'F1 হাইব্রিড তরমুজের বীজ (৬-৮ কেজি)', 'f1-hybrid-tormuj-gol', 'cat-fruit', 'ফল বীজ', 'sub-watermelon', 'brand-abseed', 150, 200, 150, 200, 250, 250, 'published', 'Bestseller', '/images/products/placeholder-tormuj-gol.webp', 'গোলাকৃতি F1 হাইব্রিড তরমুজ। ওজন ৬-৮ কেজি। গাঢ় লাল, মিষ্টি ও রসালো। গ্রীষ্মকালে চাষ করুন। প্যাকেটে ১০টি বীজ।', 49, 120, 1730700000000, 1730700000000),

('p-tormuj-2', 'F1 হাইব্রিড তরমুজের বীজ (৮-১০ কেজি)', 'f1-hybrid-tormuj-boro', 'cat-fruit', 'ফল বীজ', 'sub-watermelon', 'brand-abseed', 150, 200, 150, 200, 200, 200, 'published', NULL, '/images/products/placeholder-tormuj-boro.webp', 'বড় আকারের তরমুজ ৮-১০ কেজি। বাণিজ্যিক চাষে অধিক লাভজনক। খুব মিষ্টি ও কম বীজ। প্যাকেটে ১০টি বীজ।', 48, 85, 1730700000000, 1730700000000),

('p-tormuj-3', 'বিদেশি তরমুজের বীজ গ্রিন টেক্সার', 'bideshi-tormuj-green-texar', 'cat-fruit', 'ফল বীজ', 'sub-watermelon', 'brand-abseed', 65, 90, 65, 90, 350, 350, 'published', NULL, '/images/products/placeholder-tormuj-green.webp', 'সবুজ খোসার বিদেশি তরমুজ। ছোট আকার ২-৩ কেজি। ছাদবাগানে চাষযোগ্য। প্যাকেটে ১৫+ বীজ।', 47, 55, 1730700000000, 1730700000000),

-- === ফল বীজ > রকমেলন ===
('p-melon-1', 'সাম্মাম বা রকমেলন ফলের বীজ', 'sammam-rockmelon', 'cat-fruit', 'ফল বীজ', 'sub-melon', 'brand-abseed', 120, 160, 120, 160, 200, 200, 'published', NULL, '/images/products/placeholder-melon-sammam.webp', 'মিষ্টি ও সুগন্ধি সাম্মাম/রকমেলন। মধ্যপ্রাচ্যের জনপ্রিয় ফল এখন বাংলাদেশে চাষযোগ্য। প্যাকেটে ১০+ বীজ।', 48, 45, 1730700000000, 1730700000000),

('p-melon-2', 'গোল্ডেন প্যাশন ফ্রুট বীজ', 'golden-passion-fruit', 'cat-fruit', 'ফল বীজ', 'sub-papaya', 'brand-abseed', 120, 160, 120, 160, 150, 150, 'published', 'New', '/images/products/placeholder-passion-golden.webp', 'হলুদ রঙের গোল্ডেন প্যাশন ফ্রুট। টক-মিষ্টি সুস্বাদু। লতা জাতীয়, মাচায় চাষ করুন। প্যাকেটে ১০+ বীজ।', 47, 35, 1730700000000, 1730700000000),

('p-melon-3', 'রেড লেডি পেঁপের বীজ', 'red-lady-pepe', 'cat-fruit', 'ফল বীজ', 'sub-papaya', 'brand-abseed', 145, 200, 145, 200, 300, 300, 'published', 'Bestseller', '/images/products/placeholder-pepe-redlady.webp', 'থাইল্যান্ডের বিখ্যাত রেড লেডি পেঁপে। প্রতিটি ১-২ কেজি, গাঢ় লাল শাঁস ও অত্যন্ত মিষ্টি। প্যাকেটে ১৫+ বীজ।', 49, 150, 1730700000000, 1730700000000),

-- === ঔষধি বীজ ===
('p-med-1', 'জিনসেং বীজ (চাংবাই পর্বত)', 'ginseng-changbai', 'cat-medicinal', 'ঔষধি বীজ', NULL, 'brand-abseed', 75, 100, 75, 100, 200, 200, 'published', NULL, '/images/products/placeholder-ginseng.webp', 'বিশ্ববিখ্যাত চাংবাই পর্বতের জিনসেং বীজ। ঔষধি গুণে অতুলনীয়। রোগ প্রতিরোধ ক্ষমতা বাড়ায়। প্যাকেটে ১০+ বীজ।', 47, 30, 1730700000000, 1730700000000),

('p-med-2', 'পুদিনা পাতার বীজ', 'pudina-pata', 'cat-medicinal', 'ঔষধি বীজ', NULL, 'brand-abseed', 65, 90, 65, 90, 500, 500, 'published', NULL, '/images/products/placeholder-pudina.webp', 'সুগন্ধি পুদিনা পাতা। চা, শরবত ও রান্নায় ব্যবহার্য। টবে সহজে চাষ করা যায়। প্যাকেটে ১০০+ বীজ।', 48, 85, 1730700000000, 1730700000000),

('p-med-3', 'রোজেলা বীজ', 'rosella-bij', 'cat-medicinal', 'ঔষধি বীজ', NULL, 'brand-abseed', 120, 150, 120, 150, 250, 250, 'published', NULL, '/images/products/placeholder-rosella.webp', 'রোজেলা বা টক জাম। চা, জ্যাম ও শরবত তৈরিতে ব্যবহৃত। ভিটামিন সি সমৃদ্ধ। প্যাকেটে ২০+ বীজ।', 46, 40, 1730700000000, 1730700000000),

-- === কৃষি টুল ===
('p-tool-1', 'মিনি গার্ডেনিং থ্রি টুলস সেট', 'mini-gardening-3-tools', 'cat-tools', 'কৃষি টুল ও সরঞ্জাম', NULL, NULL, 150, 200, 150, 200, 100, 100, 'published', NULL, '/images/products/placeholder-tools-mini.webp', '৩ পিসের মিনি গার্ডেনিং টুলস সেট — বেলচা, ফর্ক ও রেক। ছাদবাগান ও টব পরিচর্যায় আদর্শ। টেকসই প্লাস্টিক ও ধাতু।', 48, 60, 1730700000000, 1730700000000),

('p-tool-2', 'গার্ডেনিং গ্লাভস', 'gardening-gloves', 'cat-tools', 'কৃষি টুল ও সরঞ্জাম', NULL, NULL, 245, 350, 245, 350, 80, 80, 'published', NULL, '/images/products/placeholder-gloves.webp', 'ক্ল পাঞ্জাযুক্ত গার্ডেনিং গ্লাভস। মাটি খোঁড়া, আগাছা পরিষ্কার ও রোপণে সুরক্ষিত। ওয়াটারপ্রুফ ও টেকসই।', 47, 45, 1730700000000, 1730700000000),

('p-tool-3', 'গাছের পুষ্টি ট্যাবলেট', 'gacher-pusti-tablet', 'cat-tools', 'কৃষি টুল ও সরঞ্জাম', NULL, NULL, 390, 500, 390, 500, 150, 150, 'published', 'Bestseller', '/images/products/placeholder-pusti-tablet.webp', 'মাটিতে পুঁতে দিলেই গাছ পায় সম্পূর্ণ পুষ্টি। NPK ও মাইক্রো নিউট্রিয়েন্ট সমৃদ্ধ। ৩০টি ট্যাবলেট প্রতি প্যাকেটে।', 49, 130, 1730700000000, 1730700000000),

('p-tool-4', 'ফিঙ্গার হার্ভেস্টিং টুল', 'finger-harvesting-tool', 'cat-tools', 'কৃষি টুল ও সরঞ্জাম', NULL, NULL, 112, 150, 112, 150, 120, 120, 'published', NULL, '/images/products/placeholder-finger-tool.webp', 'আঙুলে পরে ফল ও সবজি কাটার ছোট টুল। ধারালো ব্লেড, নিরাপদ ডিজাইন। ফুল, ভেষজ ও সবজি সংগ্রহে ব্যবহার্য।', 46, 50, 1730700000000, 1730700000000),

-- === কীটনাশক ===
('p-pest-1', 'একতারা ২৫ ডব্লিউজি (৫ গ্রাম)', 'ektara-25wg-5g', 'cat-pesticide', 'কীটনাশক ও সার', NULL, 'brand-syngenta', 60, 80, 60, 80, 200, 200, 'published', NULL, '/images/products/placeholder-ektara.webp', 'সাকিং পোকা দমনে কার্যকর। জাব পোকা, সাদামাছি ও থ্রিপস নিয়ন্ত্রণ করে। ৫ গ্রাম প্যাকেট — ১ লিটার পানিতে মিশিয়ে স্প্রে করুন।', 48, 75, 1730700000000, 1730700000000),

('p-pest-2', 'অটোমেটিক ওয়াটার ড্রপার', 'automatic-water-dropper', 'cat-tools', 'কৃষি টুল ও সরঞ্জাম', NULL, NULL, 250, 350, 250, 350, 100, 100, 'published', NULL, '/images/products/placeholder-water-dropper.webp', 'স্বয়ংক্রিয় ড্রিপ ওয়াটারিং সিস্টেম। বোতলে লাগিয়ে দিন — ধীরে ধীরে পানি দেবে। ভ্রমণকালে গাছের যত্নে আদর্শ। ৪ পিস প্রতি সেটে।', 47, 55, 1730700000000, 1730700000000);
