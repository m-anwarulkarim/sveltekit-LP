-- Clear old carousel records
DELETE FROM carousels;

-- Insert 3 new agriculture & seed hero banners
INSERT INTO carousels (
    id, name, description, image, mobile_image, target_url, url_type, sort_order, status, created_at, updated_at
) VALUES
(
    'car-seed-1',
    'উন্নত জাতের সবজি ও ফল বীজ',
    'শতভাগ অঙ্কুরোদগম ক্ষমতাসম্পন্ন দেশি ও হাইব্রিড বীজ সংগ্রহ',
    '/images/hero/vegetable-seeds-hero.webp',
    '',
    '/catalog/all-product',
    'Internal',
    1,
    'Publish',
    1730700000000,
    1730700000000
),
(
    'car-seed-2',
    'ছাদবাগান ও কিচেন গার্ডেনিং স্পেশাল',
    'শহুরে ছাদবাগান ও বারান্দার জন্য উপযুক্ত জাত ও পরামর্শ',
    '/images/hero/rooftop-gardening-hero.webp',
    '',
    '/catalog/all-product?tag=rooftop-garden',
    'Internal',
    2,
    'Publish',
    1730700000000,
    1730700000000
),
(
    'car-seed-3',
    'আধুনিক কৃষি সরঞ্জাম ও সুরক্ষা',
    'বাগান পরিচর্যা ও ফসল সুরক্ষায় সেরা কৃষি যন্ত্রপাতি',
    '/images/hero/garden-tools-hero.webp',
    '',
    '/catalog/all-product?category=krishi-tools',
    'Internal',
    3,
    'Publish',
    1730700000000,
    1730700000000
);

