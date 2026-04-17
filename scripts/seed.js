/**
 * Dusk Commerce — Database Seed Script
 * Run with: npm run seed
 *
 * Seeds:
 *  - 1 Admin user
 *  - 5 Categories
 *  - 20 Products (with realistic Indian pricing, variants, specs)
 *  - 3 Coupons
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Now you can access it
const uri = process.env.mongoDb_URI;
// Double check the casing! Your error says mongoDb_URI 
// (case sensitive)

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../src/config/database');

const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
const Coupon = require('../src/models/Coupon');

// ─── Categories ───────────────────────────────────────────

const categories = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Latest gadgets, smartphones, laptops, and accessories',
    icon: 'https://picsum.photos/seed/cat_elec/80/80',
    image: 'https://picsum.photos/seed/banner_electronics/800/300',
    order: 1,
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Trending clothing, footwear, and accessories',
    icon: 'https://picsum.photos/seed/cat_fash/80/80',
    image: 'https://picsum.photos/seed/banner_fashion/800/300',
    order: 2,
  },
  {
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Furniture, décor, kitchen, and more',
    icon: 'https://picsum.photos/seed/cat_home/80/80',
    image: 'https://picsum.photos/seed/banner_home/800/300',
    order: 3,
  },
  {
    name: 'Sports & Fitness',
    slug: 'sports-fitness',
    description: 'Equipment and apparel for an active lifestyle',
    icon: 'https://picsum.photos/seed/cat_sport/80/80',
    image: 'https://picsum.photos/seed/banner_sports/800/300',
    order: 4,
  },
  {
    name: 'Books',
    slug: 'books',
    description: 'Bestsellers, textbooks, and educational content',
    icon: 'https://picsum.photos/seed/cat_book/80/80',
    image: 'https://picsum.photos/seed/banner_books/800/300',
    order: 5,
  },
];

// ─── Products (built dynamically after category IDs are known) ───

const buildProducts = (catMap) => [
  // ── Electronics ──────────────────────────────────────────────
  {
    name: 'iPhone 15 Pro Max',
    slug: 'iphone-15-pro-max',
    shortDescription: 'Titanium build, A17 Pro chip, 48MP ProRAW camera',
    description:
      'Experience the most powerful iPhone ever made. The iPhone 15 Pro Max features an aerospace-grade titanium body, the groundbreaking A17 Pro chip, and a 48MP triple camera system with ProRAW support. The Super Retina XDR ProMotion display delivers breathtaking visuals.',
    brand: 'Apple',
    sku: 'APL-IP15PM-NAT-256',
    category: catMap['electronics'],
    images: [
      'https://picsum.photos/seed/ip15pm_1/400/400',
      'https://picsum.photos/seed/ip15pm_2/400/400',
      'https://picsum.photos/seed/ip15pm_3/400/400',
    ],
    price: 159900,
    mrp: 172900,
    discount: 8,
    stock: 50,
    variants: [
      { name: 'Storage', options: ['256GB', '512GB', '1TB'] },
      { name: 'Color', options: ['Natural Titanium', 'Black Titanium', 'White Titanium', 'Blue Titanium'] },
    ],
    specifications: [
      { key: 'Display', value: '6.7" Super Retina XDR ProMotion, 2796×1290' },
      { key: 'Processor', value: 'Apple A17 Pro Bionic' },
      { key: 'RAM', value: '8 GB' },
      { key: 'Camera', value: '48MP + 12MP + 12MP Triple camera' },
      { key: 'Battery', value: '4422 mAh, USB-C fast charge' },
      { key: 'OS', value: 'iOS 17' },
      { key: 'Weight', value: '221g' },
    ],
    tags: ['smartphone', 'apple', 'iphone', '5g', 'flagship', 'camera'],
    isFeatured: true,
    isOnDeal: true,
    ratings: { average: 4.8, count: 1247 },
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    slug: 'samsung-galaxy-s24-ultra',
    shortDescription: 'Galaxy AI, built-in S Pen, 200MP camera',
    description:
      'The Samsung Galaxy S24 Ultra redefines mobile intelligence with Galaxy AI features built right in. Featuring a built-in S Pen, a 200MP camera with 100x Space Zoom, and a stunning Titanium body with a Snapdragon 8 Gen 3 processor.',
    brand: 'Samsung',
    sku: 'SAM-S24U-BLK-256',
    category: catMap['electronics'],
    images: [
      'https://picsum.photos/seed/s24u_1/400/400',
      'https://picsum.photos/seed/s24u_2/400/400',
      'https://picsum.photos/seed/s24u_3/400/400',
    ],
    price: 129999,
    mrp: 144999,
    discount: 10,
    stock: 35,
    variants: [
      { name: 'Storage', options: ['256GB', '512GB', '1TB'] },
      { name: 'Color', options: ['Titanium Black', 'Titanium Gray', 'Titanium Violet', 'Titanium Yellow'] },
    ],
    specifications: [
      { key: 'Display', value: '6.8" Dynamic AMOLED 2X, 120Hz' },
      { key: 'Processor', value: 'Snapdragon 8 Gen 3' },
      { key: 'RAM', value: '12 GB' },
      { key: 'Camera', value: '200MP + 50MP + 10MP + 12MP' },
      { key: 'Battery', value: '5000 mAh, 45W fast charge' },
      { key: 'S Pen', value: 'Built-in' },
    ],
    tags: ['smartphone', 'samsung', 'galaxy', 's pen', '5g', 'flagship'],
    isFeatured: true,
    isOnDeal: true,
    ratings: { average: 4.7, count: 892 },
  },
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    slug: 'sony-wh1000xm5-headphones',
    shortDescription: 'Industry-leading ANC, 30hr battery, Hi-Res Audio',
    description:
      'The Sony WH-1000XM5 sets the benchmark for noise cancellation. With 8 microphones and two processors, it delivers unparalleled sound quality and comfort for extended listening sessions.',
    brand: 'Sony',
    sku: 'SONY-WH1XM5-BLK',
    category: catMap['electronics'],
    images: [
      'https://picsum.photos/seed/sonyxm5_1/400/400',
      'https://picsum.photos/seed/sonyxm5_2/400/400',
    ],
    price: 26990,
    mrp: 34990,
    discount: 23,
    stock: 80,
    variants: [{ name: 'Color', options: ['Black', 'Silver'] }],
    specifications: [
      { key: 'Driver Size', value: '30mm' },
      { key: 'Frequency', value: '4Hz–40,000Hz' },
      { key: 'Battery Life', value: '30 hours (ANC on)' },
      { key: 'Charging', value: 'USB-C, 3 min = 3 hours' },
      { key: 'Connectivity', value: 'Bluetooth 5.2, Multipoint' },
    ],
    tags: ['headphones', 'sony', 'anc', 'wireless', 'audio'],
    isFeatured: false,
    isOnDeal: true,
    ratings: { average: 4.9, count: 3201 },
  },
  {
    name: 'Apple MacBook Air M3',
    slug: 'apple-macbook-air-m3',
    shortDescription: 'M3 chip, 18hr battery, 13.6" Liquid Retina',
    description:
      'The MacBook Air with M3 is the thinnest and lightest Mac, yet incredibly capable. With the new M3 chip, you get blazing performance and up to 18 hours of battery life in the sleekest possible package.',
    brand: 'Apple',
    sku: 'APL-MBA-M3-8-256',
    category: catMap['electronics'],
    images: [
      'https://picsum.photos/seed/mba_m3_1/400/400',
      'https://picsum.photos/seed/mba_m3_2/400/400',
    ],
    price: 114900,
    mrp: 124900,
    discount: 8,
    stock: 25,
    variants: [
      { name: 'Memory', options: ['8GB', '16GB', '24GB'] },
      { name: 'Storage', options: ['256GB', '512GB', '1TB', '2TB'] },
      { name: 'Color', options: ['Midnight', 'Starlight', 'Silver', 'Sky Blue'] },
    ],
    specifications: [
      { key: 'Display', value: '13.6" Liquid Retina, 2560×1664' },
      { key: 'Processor', value: 'Apple M3 (8-core CPU, 10-core GPU)' },
      { key: 'Battery', value: '52.6Wh — up to 18 hours' },
      { key: 'Weight', value: '1.24 kg' },
      { key: 'Ports', value: '2x Thunderbolt 4, MagSafe 3, 3.5mm' },
    ],
    tags: ['laptop', 'macbook', 'apple', 'M3', 'ultrabook'],
    isFeatured: true,
    isOnDeal: false,
    ratings: { average: 4.9, count: 541 },
  },
  {
    name: 'OnePlus 12 5G',
    slug: 'oneplus-12-5g',
    shortDescription: 'Snapdragon 8 Gen 3, Hasselblad camera, 100W charge',
    description:
      'The OnePlus 12 5G combines flagship performance with a stunning Hasselblad-tuned camera system and lightning-fast 100W SUPERVOOC charging that fills up in just 26 minutes.',
    brand: 'OnePlus',
    sku: 'OP12-MBK-16-512',
    category: catMap['electronics'],
    images: [
      'https://picsum.photos/seed/op12_1/400/400',
      'https://picsum.photos/seed/op12_2/400/400',
    ],
    price: 64999,
    mrp: 72999,
    discount: 11,
    stock: 60,
    variants: [
      { name: 'RAM + Storage', options: ['12GB+256GB', '16GB+512GB'] },
      { name: 'Color', options: ['Silky Black', 'Flowy Emerald'] },
    ],
    specifications: [
      { key: 'Display', value: '6.82" LTPO AMOLED, 120Hz, 2K+' },
      { key: 'Processor', value: 'Snapdragon 8 Gen 3' },
      { key: 'Camera', value: '50MP (Hasselblad) + 48MP + 64MP' },
      { key: 'Battery', value: '5400 mAh, 100W SUPERVOOC' },
    ],
    tags: ['smartphone', 'oneplus', '5g', 'flagship', 'fast charge'],
    isFeatured: false,
    isOnDeal: true,
    ratings: { average: 4.5, count: 678 },
  },
  {
    name: 'JBL Flip 6 Portable Speaker',
    slug: 'jbl-flip-6-speaker',
    shortDescription: 'IP67 waterproof, JBL Pro Sound, 12hr battery',
    description:
      'The JBL Flip 6 delivers powerful sound in a sleek portable design. Fully waterproof and dustproof (IP67), it is built for any adventure with 12 hours of playtime.',
    brand: 'JBL',
    sku: 'JBL-FLIP6-BLK',
    category: catMap['electronics'],
    images: ['https://picsum.photos/seed/jblflip6_1/400/400'],
    price: 8499,
    mrp: 11999,
    discount: 29,
    stock: 120,
    variants: [{ name: 'Color', options: ['Black', 'Blue', 'Red', 'Teal', 'Squad'] }],
    specifications: [
      { key: 'Output Power', value: '30W RMS' },
      { key: 'Waterproof', value: 'IP67' },
      { key: 'Battery', value: '12 hours, USB-C' },
      { key: 'Connectivity', value: 'Bluetooth 5.1' },
      { key: 'PartyBoost', value: 'Yes — link 100+ JBL speakers' },
    ],
    tags: ['speaker', 'jbl', 'bluetooth', 'waterproof', 'portable'],
    isFeatured: false,
    isOnDeal: true,
    ratings: { average: 4.6, count: 4521 },
  },

  // ── Fashion ────────────────────────────────────────────────────
  {
    name: 'Premium Raw Denim Jacket',
    slug: 'premium-raw-denim-jacket',
    shortDescription: 'Selvedge raw denim, slim fit, button closure',
    description:
      'Crafted from Japanese selvedge raw denim, this jacket ages beautifully to form unique fades personal to you. Features a slim contemporary fit and an unlined body for year-round versatility.',
    brand: 'Dusk Apparel',
    sku: 'DA-RDNM-JKT-IND',
    category: catMap['fashion'],
    images: [
      'https://picsum.photos/seed/denim_jkt_1/400/400',
      'https://picsum.photos/seed/denim_jkt_2/400/400',
    ],
    price: 2999,
    mrp: 4999,
    discount: 40,
    stock: 75,
    variants: [{ name: 'Size', options: ['S', 'M', 'L', 'XL', 'XXL'] }],
    specifications: [
      { key: 'Material', value: '100% Selvedge Cotton Denim' },
      { key: 'Fit', value: 'Slim' },
      { key: 'Wash', value: 'Raw (unwashed)' },
      { key: 'Closure', value: 'Button front' },
    ],
    tags: ['jacket', 'denim', 'men', 'fashion', 'casual'],
    isFeatured: false,
    isOnDeal: true,
    ratings: { average: 4.3, count: 289 },
  },
  {
    name: 'Supima Cotton Oversized Tee',
    slug: 'supima-cotton-oversized-tee',
    shortDescription: '200 GSM Supima cotton, dropped shoulder, pigment dye',
    description:
      'Made from premium Supima cotton (the longest staple cotton), this 200 GSM tee offers exceptional softness that only improves with washing. The oversized fit and dropped shoulders give it a modern, relaxed silhouette.',
    brand: 'Dusk Apparel',
    sku: 'DA-SCOT-OVR-WHT',
    category: catMap['fashion'],
    images: ['https://picsum.photos/seed/supimatee_1/400/400'],
    price: 799,
    mrp: 1299,
    discount: 38,
    stock: 200,
    variants: [
      { name: 'Color', options: ['Washed White', 'Faded Black', 'Desert Rose', 'Sage Green', 'Navy'] },
      { name: 'Size', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    ],
    specifications: [
      { key: 'Material', value: 'Supima Cotton 200 GSM' },
      { key: 'Fit', value: 'Oversized / Relaxed' },
      { key: 'Neckline', value: 'Crew neck' },
      { key: 'Care', value: 'Machine wash cold' },
    ],
    tags: ['t-shirt', 'cotton', 'unisex', 'oversized', 'casual'],
    isFeatured: false,
    isOnDeal: false,
    ratings: { average: 4.5, count: 1102 },
  },
  {
    name: 'Air Cushion Running Sneakers',
    slug: 'air-cushion-running-sneakers',
    shortDescription: 'Knit upper, air cushion sole, ultra-lightweight 198g',
    description:
      'Advanced knit upper technology adapts to your foot for a sock-like fit, while the innovative air cushion sole delivers responsive cushioning for long-distance comfort. At just 198g per shoe, these are born to run.',
    brand: 'Dusk Run',
    sku: 'DR-AIR-RUN-WHT-42',
    category: catMap['fashion'],
    images: [
      'https://picsum.photos/seed/airsneak_1/400/400',
      'https://picsum.photos/seed/airsneak_2/400/400',
    ],
    price: 3499,
    mrp: 5499,
    discount: 36,
    stock: 90,
    variants: [
      { name: 'Size (EU)', options: ['39', '40', '41', '42', '43', '44', '45', '46'] },
      { name: 'Color', options: ['Arctic White', 'Midnight Black', 'Coral Pink', 'Sky Blue'] },
    ],
    specifications: [
      { key: 'Upper', value: 'Engineered Knit' },
      { key: 'Sole', value: 'Air Cushion TPU' },
      { key: 'Weight', value: '198g per shoe' },
      { key: 'Drop', value: '8mm heel-to-toe' },
    ],
    tags: ['sneakers', 'running', 'shoes', 'unisex', 'footwear'],
    isFeatured: true,
    isOnDeal: true,
    ratings: { average: 4.4, count: 765 },
  },

  // ── Home & Living ──────────────────────────────────────────────
  {
    name: 'Artisan Pour-Over Coffee Maker Set',
    slug: 'artisan-pour-over-coffee-maker',
    shortDescription: 'Borosilicate glass, gooseneck kettle, precision filters',
    description:
      'Elevate your morning ritual with this complete pour-over coffee set. The borosilicate glass carafe, precision laser-cut filters, and stainless steel frame work together to extract the perfect cup every time.',
    brand: 'Brew & Co',
    sku: 'BC-POUROVER-SET',
    category: catMap['home-living'],
    images: [
      'https://picsum.photos/seed/coffee_1/400/400',
      'https://picsum.photos/seed/coffee_2/400/400',
    ],
    price: 2499,
    mrp: 3999,
    discount: 37,
    stock: 60,
    variants: [{ name: 'Size', options: ['2 Cup (400ml)', '4 Cup (800ml)', '6 Cup (1200ml)'] }],
    specifications: [
      { key: 'Material', value: 'Borosilicate Glass + Stainless Steel' },
      { key: 'Capacity', value: '800ml (4 cups)' },
      { key: 'Includes', value: 'Dripper, carafe, 100 filters, gooseneck kettle' },
      { key: 'Heat Resistant', value: 'Up to 400°C' },
    ],
    tags: ['coffee', 'kitchen', 'pour-over', 'home', 'gift'],
    isFeatured: false,
    isOnDeal: true,
    ratings: { average: 4.7, count: 432 },
  },
  {
    name: 'Smart LED Architect Desk Lamp',
    slug: 'smart-led-architect-desk-lamp',
    shortDescription: 'Touch control, USB-C charging port, 5 colour temps',
    description:
      'This architect-style LED lamp offers precision lighting with 5 colour temperatures (2700K–6500K) and 10 brightness levels via capacitive touch control. The built-in USB-C port keeps your devices charged.',
    brand: 'LumoTech',
    sku: 'LT-DESK-LED-WHT',
    category: catMap['home-living'],
    images: ['https://picsum.photos/seed/desklamp_1/400/400'],
    price: 1799,
    mrp: 2999,
    discount: 40,
    stock: 85,
    variants: [{ name: 'Color', options: ['White', 'Black', 'Rose Gold'] }],
    specifications: [
      { key: 'Power', value: '10W LED' },
      { key: 'Colour Temperature', value: '2700K–6500K (5 modes)' },
      { key: 'Brightness', value: '10 levels' },
      { key: 'USB Charging', value: 'USB-C 18W PD' },
      { key: 'Eye Care', value: 'Flicker-free, anti-glare' },
    ],
    tags: ['lamp', 'desk lamp', 'LED', 'home office', 'study'],
    isFeatured: false,
    isOnDeal: false,
    ratings: { average: 4.4, count: 890 },
  },
  {
    name: 'Ergonomic Memory Foam Pillow',
    slug: 'ergonomic-memory-foam-pillow',
    shortDescription: 'Cervical support, gel-infused, washable cover',
    description:
      'Wake up refreshed with our ergonomically contoured memory foam pillow. The gel-infused foam regulates temperature while the cervical support curve aligns your spine for optimal sleep posture.',
    brand: 'DreamRest',
    sku: 'DR-MEMFOAM-PIL-STD',
    category: catMap['home-living'],
    images: ['https://picsum.photos/seed/pillow_1/400/400'],
    price: 1299,
    mrp: 1999,
    discount: 35,
    stock: 150,
    variants: [{ name: 'Size', options: ['Standard', 'Queen', 'King'] }],
    specifications: [
      { key: 'Fill', value: 'Gel-infused memory foam' },
      { key: 'Cover', value: '100% bamboo, machine washable' },
      { key: 'Density', value: '60D high-density foam' },
      { key: 'Height', value: 'Dual loft: 4" / 5"' },
      { key: 'Certifications', value: 'OEKO-TEX Standard 100' },
    ],
    tags: ['pillow', 'memory foam', 'sleep', 'bedroom', 'ergonomic'],
    isFeatured: false,
    isOnDeal: false,
    ratings: { average: 4.3, count: 2103 },
  },
  {
    name: 'Insulated Stainless Steel Water Bottle',
    slug: 'insulated-water-bottle-1l',
    shortDescription: 'Double-wall vacuum insulation, 24hr cold / 12hr hot',
    description:
      'Built for hydration on the go, this 1-litre vacuum-insulated bottle keeps drinks cold for 24 hours and hot for 12. The wide-mouth lid doubles as a cup, and the powder-coated finish provides a secure grip.',
    brand: 'HydroCore',
    sku: 'HC-INSUL-1L-NAVY',
    category: catMap['home-living'],
    images: ['https://picsum.photos/seed/bottle_1/400/400'],
    price: 799,
    mrp: 1299,
    discount: 38,
    stock: 300,
    variants: [
      { name: 'Capacity', options: ['500ml', '750ml', '1L'] },
      { name: 'Color', options: ['Navy Blue', 'Sage Green', 'Matte Black', 'Coral', 'Stone White'] },
    ],
    specifications: [
      { key: 'Material', value: '18/8 Food-grade stainless steel' },
      { key: 'Insulation', value: 'Double-wall vacuum' },
      { key: 'Cold', value: '24 hours' },
      { key: 'Hot', value: '12 hours' },
      { key: 'BPA Free', value: 'Yes' },
    ],
    tags: ['water bottle', 'hydration', 'insulated', 'eco-friendly', 'gym'],
    isFeatured: false,
    isOnDeal: false,
    ratings: { average: 4.6, count: 5412 },
  },

  // ── Sports & Fitness ───────────────────────────────────────────
  {
    name: 'Premium Grip Yoga Mat 6mm',
    slug: 'premium-grip-yoga-mat-6mm',
    shortDescription: 'Non-slip TPE, alignment lines, carry strap included',
    description:
      'Designed for serious practitioners, this 6mm TPE yoga mat delivers superior grip on both sides — sticky grip on top, non-slip rubber texture below. Alignment guides help perfect your form.',
    brand: 'FlowForm',
    sku: 'FF-YOGA-6MM-PRP',
    category: catMap['sports-fitness'],
    images: ['https://picsum.photos/seed/yogamat_1/400/400'],
    price: 1499,
    mrp: 2499,
    discount: 40,
    stock: 100,
    variants: [
      { name: 'Thickness', options: ['4mm', '6mm', '8mm'] },
      { name: 'Color', options: ['Deep Purple', 'Teal', 'Coral', 'Midnight Black', 'Sage'] },
    ],
    specifications: [
      { key: 'Material', value: 'Eco-friendly TPE' },
      { key: 'Thickness', value: '6mm' },
      { key: 'Dimensions', value: '183cm × 61cm' },
      { key: 'Weight', value: '1.1 kg' },
      { key: 'Includes', value: 'Carry strap + alignment marks' },
    ],
    tags: ['yoga', 'mat', 'exercise', 'fitness', 'non-slip'],
    isFeatured: false,
    isOnDeal: true,
    ratings: { average: 4.5, count: 1893 },
  },
  {
    name: 'Pro Resistance Bands Set (5 Levels)',
    slug: 'pro-resistance-bands-set',
    shortDescription: 'Latex-free, door anchor, handles, ankle straps included',
    description:
      'A complete home gym in a bag. This set of 5 resistance bands (5–50 lbs) comes with foam handles, ankle straps, a door anchor, and a carry bag — everything you need for a full-body workout anywhere.',
    brand: 'IronFlex',
    sku: 'IF-RESBAND-SET5',
    category: catMap['sports-fitness'],
    images: ['https://picsum.photos/seed/resbands_1/400/400'],
    price: 899,
    mrp: 1499,
    discount: 40,
    stock: 250,
    variants: [],
    specifications: [
      { key: 'Material', value: 'Natural latex-free TPE' },
      { key: 'Resistance Levels', value: '5–50 lbs (5 bands)' },
      { key: 'Includes', value: 'Door anchor, 2 handles, 2 ankle straps, carry bag' },
      { key: 'Length', value: '1.2m each' },
    ],
    tags: ['resistance bands', 'gym', 'workout', 'home gym', 'fitness'],
    isFeatured: false,
    isOnDeal: false,
    ratings: { average: 4.4, count: 2987 },
  },
  {
    name: 'Advanced GPS Fitness Smartwatch',
    slug: 'advanced-gps-fitness-smartwatch',
    shortDescription: 'GPS, SpO2, heart rate 24/7, 14-day battery, AMOLED',
    description:
      'Track every metric that matters. This GPS smartwatch features a 1.4" AMOLED always-on display, continuous heart rate monitoring, SpO2 sensor, sleep tracking, and over 100 sport modes — all on a 14-day battery.',
    brand: 'Lumin Sport',
    sku: 'LS-GPSWATCH-PRO-BLK',
    category: catMap['sports-fitness'],
    images: [
      'https://picsum.photos/seed/swatch_1/400/400',
      'https://picsum.photos/seed/swatch_2/400/400',
    ],
    price: 5999,
    mrp: 8999,
    discount: 33,
    stock: 45,
    variants: [{ name: 'Color', options: ['Midnight Black', 'Tungsten Gray', 'Rose Gold'] }],
    specifications: [
      { key: 'Display', value: '1.4" AMOLED, 454×454' },
      { key: 'GPS', value: 'Built-in multi-band GPS' },
      { key: 'Battery', value: '14 days typical, 30hrs GPS' },
      { key: 'Water Resistance', value: '5ATM (50m)' },
      { key: 'Sensors', value: 'HR, SpO2, Stress, Sleep' },
      { key: 'Sport Modes', value: '100+' },
    ],
    tags: ['smartwatch', 'gps', 'fitness', 'health tracker', 'watch'],
    isFeatured: true,
    isOnDeal: true,
    ratings: { average: 4.3, count: 1432 },
  },

  // ── Books ──────────────────────────────────────────────────────
  {
    name: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    slug: 'clean-code-robert-martin',
    shortDescription: 'By Robert C. Martin — Essential reading for every developer',
    description:
      'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees. In this book, legendary software craftsman Robert C. Martin presents a revolutionary paradigm with Clean Code.',
    brand: 'Pearson Education',
    sku: 'BK-CLEANCODE-MARTIN',
    category: catMap['books'],
    images: ['https://picsum.photos/seed/cleancode_1/400/400'],
    price: 699,
    mrp: 999,
    discount: 30,
    stock: 500,
    variants: [{ name: 'Format', options: ['Paperback', 'Hardcover'] }],
    specifications: [
      { key: 'Author', value: 'Robert C. Martin' },
      { key: 'Pages', value: '464' },
      { key: 'Publisher', value: 'Pearson Education' },
      { key: 'Language', value: 'English' },
      { key: 'Edition', value: '1st' },
    ],
    tags: ['programming', 'software', 'clean code', 'development', 'tech'],
    isFeatured: false,
    isOnDeal: false,
    ratings: { average: 4.8, count: 8931 },
  },
  {
    name: 'Atomic Habits',
    slug: 'atomic-habits-james-clear',
    shortDescription: 'By James Clear — Tiny Changes, Remarkable Results',
    description:
      'The #1 New York Times bestseller. James Clear, one of the world\'s leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.',
    brand: 'Penguin Random House',
    sku: 'BK-ATOMICHABITS-CLEAR',
    category: catMap['books'],
    images: ['https://picsum.photos/seed/atomichabits_1/400/400'],
    price: 399,
    mrp: 599,
    discount: 33,
    stock: 800,
    variants: [{ name: 'Format', options: ['Paperback', 'Hardcover', 'e-Book'] }],
    specifications: [
      { key: 'Author', value: 'James Clear' },
      { key: 'Pages', value: '320' },
      { key: 'Publisher', value: 'Penguin Random House' },
      { key: 'Language', value: 'English' },
    ],
    tags: ['self-help', 'habits', 'productivity', 'bestseller', 'motivation'],
    isFeatured: false,
    isOnDeal: false,
    ratings: { average: 4.9, count: 21043 },
  },
  {
    name: 'Digital Photography Complete Manual',
    slug: 'digital-photography-complete-manual',
    shortDescription: 'Master composition, lighting, post-processing — all cameras',
    description:
      'Whether you\'re shooting with a DSLR, mirrorless, or smartphone, this comprehensive guide covers everything from understanding exposure to advanced post-processing techniques in Lightroom and Photoshop.',
    brand: 'DK Publishing',
    sku: 'BK-DIGI-PHOTO-DK',
    category: catMap['books'],
    images: ['https://picsum.photos/seed/photobook_1/400/400'],
    price: 549,
    mrp: 799,
    discount: 31,
    stock: 200,
    variants: [{ name: 'Format', options: ['Paperback', 'Hardcover'] }],
    specifications: [
      { key: 'Author', value: 'Tom Ang' },
      { key: 'Pages', value: '560' },
      { key: 'Publisher', value: 'DK Publishing' },
      { key: 'Fully Illustrated', value: 'Yes — 2000+ photos' },
    ],
    tags: ['photography', 'camera', 'DSLR', 'creative', 'photo editing'],
    isFeatured: false,
    isOnDeal: false,
    ratings: { average: 4.5, count: 1234 },
  },
];

// ─── Coupons ───────────────────────────────────────────────

const coupons = [
  {
    code: 'WELCOME200',
    description: 'Flat ₹200 off on your first order above ₹999',
    discountType: 'fixed',
    discountValue: 200,
    minOrder: 999,
    maxDiscount: 200,
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  },
  {
    code: 'DUSK10',
    description: '10% off (max ₹500) on orders above ₹2000',
    discountType: 'percentage',
    discountValue: 10,
    minOrder: 2000,
    maxDiscount: 500,
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  },
  {
    code: 'FLAT500',
    description: 'Flat ₹500 off on orders above ₹5000',
    discountType: 'fixed',
    discountValue: 500,
    minOrder: 5000,
    validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
  },
];

// ─── Main seed function ───────────────────────────────────

const seed = async () => {
  await connectDB();
  console.log('🌱 Starting seed...\n');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Coupon.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await User.create({
    name: 'Dusk Admin',
    email: 'admin@duskcommerce.com',
    phone: '9000000000',
    password: adminPassword,
    role: 'admin',
    isVerified: true,
    avatar: 'https://picsum.photos/seed/admin_avatar/100/100',
  });
  console.log(`👤 Admin created: admin@duskcommerce.com / Admin@123`);

  // Create demo user
  const demoPassword = await bcrypt.hash('Demo@123', 10);
  await User.create({
    name: 'Demo User',
    email: 'demo@duskcommerce.com',
    phone: '9111111111',
    password: demoPassword,
    role: 'user',
    isVerified: true,
    avatar: 'https://picsum.photos/seed/demo_avatar/100/100',
  });
  console.log(`👤 Demo user: demo@duskcommerce.com / Demo@123`);

  // Seed categories
  const createdCategories = await Category.insertMany(categories);
  console.log(`📂 ${createdCategories.length} categories seeded`);

  // Build catMap: slug → ObjectId
  const catMap = {};
  createdCategories.forEach((c) => { catMap[c.slug] = c._id; });

  // Seed products
  const products = buildProducts(catMap);
  const createdProducts = await Product.insertMany(products);
  console.log(`📦 ${createdProducts.length} products seeded`);

  // Seed coupons
  const createdCoupons = await Coupon.insertMany(coupons);
  console.log(`🎟️  ${createdCoupons.length} coupons seeded`);

  console.log('\n✅ Seed complete!');
  console.log('──────────────────────────────────────');
  console.log('Available coupons at checkout:');
  createdCoupons.forEach((c) => console.log(`  • ${c.code} — ${c.description}`));
  console.log('──────────────────────────────────────\n');

  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
