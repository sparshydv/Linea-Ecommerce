/**
 * ========================================================
 * PRODUCT SEEDING SCRIPT - FOR LOCAL/STAGING ONLY
 * ========================================================
 * 
 * PURPOSE:
 * Seeds database with 100+ realistic products to test:
 * - Pagination (large datasets)
 * - Search (varied names, overlapping keywords)
 * - Filtering (price ranges, categories, stock states)
 * - Sorting (price, date)
 * - New arrivals logic
 * - Edge cases (out of stock, similar names)
 * 
 * HOW TO RUN:
 * 1. Ensure MongoDB is running
 * 2. From backend directory: node scripts/seedProducts.js
 * 3. Script will clear existing products and seed fresh data
 * 
 * WARNING:
 * - This script DELETES all existing products
 * - Use ONLY in local/staging environments
 * - DO NOT run in production
 * 
 * ========================================================
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/Product.model');

// Utility: Generate slug from name
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Utility: Get date X days ago
function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

// Product seed data
const productsData = [
  // ==========================================
  // ELECTRONICS (25 products)
  // Testing: Large category, varied prices
  // ==========================================
  {
    name: 'iPhone 15 Pro Max',
    category: 'Electronics',
    basePrice: 134900,
    discount: 5000,
    stock: 15,
    tags: ['smartphone', 'apple', 'premium', 'phone'],
    images: [{ url: 'https://via.placeholder.com/800x600/007bff/fff?text=iPhone+15+Pro' }],
    description: 'Latest flagship iPhone with A17 Pro chip and titanium design',
    createdAt: daysAgo(5),
  },
  {
    name: 'iPhone 15',
    category: 'Electronics',
    basePrice: 79900,
    discount: 3000,
    stock: 22,
    tags: ['smartphone', 'apple', 'phone'],
    images: [{ url: 'https://via.placeholder.com/800x600/007bff/fff?text=iPhone+15' }],
    description: 'Standard iPhone 15 with excellent camera and performance',
    createdAt: daysAgo(5),
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    category: 'Electronics',
    basePrice: 129999,
    discount: 10000,
    stock: 8,
    tags: ['smartphone', 'samsung', 'android', 'phone'],
    images: [{ url: 'https://via.placeholder.com/800x600/28a745/fff?text=Galaxy+S24' }],
    description: 'Premium Android flagship with S Pen and 200MP camera',
    createdAt: daysAgo(10),
  },
  {
    name: 'OnePlus 12',
    category: 'Electronics',
    basePrice: 64999,
    discount: 5000,
    stock: 30,
    tags: ['smartphone', 'oneplus', 'android', 'phone'],
    images: [{ url: 'https://via.placeholder.com/800x600/dc3545/fff?text=OnePlus+12' }],
    description: 'Flagship killer with Snapdragon 8 Gen 3',
    createdAt: daysAgo(15),
  },
  {
    name: 'Google Pixel 8 Pro',
    category: 'Electronics',
    basePrice: 106999,
    discount: 0,
    stock: 0, // Out of stock
    tags: ['smartphone', 'google', 'android', 'phone', 'camera'],
    images: [{ url: 'https://via.placeholder.com/800x600/ffc107/000?text=Pixel+8+Pro' }],
    description: 'Best camera phone with Tensor G3 chip',
    createdAt: daysAgo(20),
  },
  {
    name: 'MacBook Pro 14" M3',
    category: 'Electronics',
    basePrice: 199900,
    discount: 10000,
    stock: 5,
    tags: ['laptop', 'apple', 'macbook', 'premium'],
    images: [{ url: 'https://via.placeholder.com/800x600/6c757d/fff?text=MacBook+Pro' }],
    description: 'Professional laptop with M3 chip for developers and creators',
    createdAt: daysAgo(2),
  },
  {
    name: 'Dell XPS 15',
    category: 'Electronics',
    basePrice: 145000,
    discount: 15000,
    stock: 7,
    tags: ['laptop', 'dell', 'windows', 'business'],
    images: [{ url: 'https://via.placeholder.com/800x600/17a2b8/fff?text=Dell+XPS' }],
    description: 'Premium Windows laptop with InfinityEdge display',
    createdAt: daysAgo(30),
  },
  {
    name: 'Sony WH-1000XM5',
    category: 'Electronics',
    basePrice: 29990,
    discount: 3000,
    stock: 40,
    tags: ['headphones', 'sony', 'wireless', 'noise-cancelling'],
    images: [{ url: 'https://via.placeholder.com/800x600/343a40/fff?text=Sony+WH1000XM5' }],
    description: 'Industry-leading noise cancelling headphones',
    createdAt: daysAgo(45),
  },
  {
    name: 'AirPods Pro 2',
    category: 'Electronics',
    basePrice: 24900,
    discount: 2000,
    stock: 60,
    tags: ['earbuds', 'apple', 'wireless', 'noise-cancelling'],
    images: [{ url: 'https://via.placeholder.com/800x600/007bff/fff?text=AirPods+Pro' }],
    description: 'Premium wireless earbuds with active noise cancellation',
    createdAt: daysAgo(60),
  },
  {
    name: 'iPad Air M2',
    category: 'Electronics',
    basePrice: 59900,
    discount: 5000,
    stock: 12,
    tags: ['tablet', 'apple', 'ipad'],
    images: [{ url: 'https://via.placeholder.com/800x600/6610f2/fff?text=iPad+Air' }],
    description: 'Versatile tablet with M2 chip for work and play',
    createdAt: daysAgo(8),
  },
  {
    name: 'Samsung Galaxy Tab S9',
    category: 'Electronics',
    basePrice: 76999,
    discount: 7000,
    stock: 1, // Low stock edge case
    tags: ['tablet', 'samsung', 'android'],
    images: [{ url: 'https://via.placeholder.com/800x600/28a745/fff?text=Galaxy+Tab' }],
    description: 'Premium Android tablet with S Pen included',
    createdAt: daysAgo(25),
  },
  {
    name: 'Canon EOS R6 Mark II',
    category: 'Electronics',
    basePrice: 249900,
    discount: 0,
    stock: 3,
    tags: ['camera', 'canon', 'photography', 'professional'],
    images: [{ url: 'https://via.placeholder.com/800x600/000/fff?text=Canon+R6' }],
    description: 'Professional mirrorless camera for photography enthusiasts',
    createdAt: daysAgo(90),
  },
  {
    name: 'Sony PlayStation 5',
    category: 'Electronics',
    basePrice: 49990,
    discount: 0,
    stock: 0, // Out of stock
    tags: ['gaming', 'sony', 'console', 'ps5'],
    images: [{ url: 'https://via.placeholder.com/800x600/003791/fff?text=PS5' }],
    description: 'Next-gen gaming console with stunning graphics',
    createdAt: daysAgo(120),
  },
  {
    name: 'Xbox Series X',
    category: 'Electronics',
    basePrice: 52990,
    discount: 3000,
    stock: 8,
    tags: ['gaming', 'xbox', 'microsoft', 'console'],
    images: [{ url: 'https://via.placeholder.com/800x600/107c10/fff?text=Xbox' }],
    description: 'Microsoft gaming console with Game Pass access',
    createdAt: daysAgo(100),
  },
  {
    name: 'Nintendo Switch OLED',
    category: 'Electronics',
    basePrice: 34999,
    discount: 2000,
    stock: 25,
    tags: ['gaming', 'nintendo', 'console', 'portable'],
    images: [{ url: 'https://via.placeholder.com/800x600/e60012/fff?text=Switch' }],
    description: 'Portable gaming console with vibrant OLED screen',
    createdAt: daysAgo(70),
  },
  {
    name: 'LG 55" OLED TV',
    category: 'Electronics',
    basePrice: 139990,
    discount: 20000,
    stock: 4,
    tags: ['tv', 'oled', 'lg', 'smart-tv'],
    images: [{ url: 'https://via.placeholder.com/800x600/a50034/fff?text=LG+OLED' }],
    description: '4K OLED TV with perfect blacks and vivid colors',
    createdAt: daysAgo(150),
  },
  {
    name: 'Amazon Echo Dot 5th Gen',
    category: 'Electronics',
    basePrice: 4999,
    discount: 1000,
    stock: 100,
    tags: ['smart-home', 'alexa', 'speaker'],
    images: [{ url: 'https://via.placeholder.com/800x600/ff9900/000?text=Echo+Dot' }],
    description: 'Compact smart speaker with Alexa voice assistant',
    createdAt: daysAgo(180),
  },
  {
    name: 'Apple Watch Series 9',
    category: 'Electronics',
    basePrice: 45900,
    discount: 4000,
    stock: 18,
    tags: ['smartwatch', 'apple', 'fitness', 'wearable'],
    images: [{ url: 'https://via.placeholder.com/800x600/007bff/fff?text=Apple+Watch' }],
    description: 'Advanced smartwatch with health tracking features',
    createdAt: daysAgo(12),
  },
  {
    name: 'Fitbit Charge 6',
    category: 'Electronics',
    basePrice: 12999,
    discount: 2000,
    stock: 35,
    tags: ['fitness', 'tracker', 'wearable', 'health'],
    images: [{ url: 'https://via.placeholder.com/800x600/00b0b9/fff?text=Fitbit' }],
    description: 'Fitness tracker with heart rate and GPS',
    createdAt: daysAgo(40),
  },
  {
    name: 'Logitech MX Master 3S',
    category: 'Electronics',
    basePrice: 8999,
    discount: 1000,
    stock: 50,
    tags: ['mouse', 'wireless', 'productivity', 'logitech'],
    images: [{ url: 'https://via.placeholder.com/800x600/00b8fc/fff?text=MX+Master' }],
    description: 'Premium wireless mouse for professionals',
    createdAt: daysAgo(55),
  },
  {
    name: 'Keychron K8 Pro',
    category: 'Electronics',
    basePrice: 10999,
    discount: 0,
    stock: 20,
    tags: ['keyboard', 'mechanical', 'wireless', 'productivity'],
    images: [{ url: 'https://via.placeholder.com/800x600/000/fff?text=Keychron+K8' }],
    description: 'Wireless mechanical keyboard for typing enthusiasts',
    createdAt: daysAgo(35),
  },
  {
    name: 'Anker PowerCore 20000mAh',
    category: 'Electronics',
    basePrice: 3499,
    discount: 500,
    stock: 80,
    tags: ['powerbank', 'charger', 'portable', 'anker'],
    images: [{ url: 'https://via.placeholder.com/800x600/39bcfd/000?text=Powerbank' }],
    description: 'High-capacity portable charger for all devices',
    createdAt: daysAgo(200),
  },
  {
    name: 'SanDisk Extreme 1TB SSD',
    category: 'Electronics',
    basePrice: 12999,
    discount: 2000,
    stock: 45,
    tags: ['storage', 'ssd', 'portable', 'sandisk'],
    images: [{ url: 'https://via.placeholder.com/800x600/ff0000/fff?text=SanDisk+SSD' }],
    description: 'Fast portable SSD for photographers and creators',
    createdAt: daysAgo(80),
  },
  {
    name: 'TP-Link WiFi 6 Router',
    category: 'Electronics',
    basePrice: 7999,
    discount: 1500,
    stock: 30,
    tags: ['router', 'wifi', 'networking', 'tp-link'],
    images: [{ url: 'https://via.placeholder.com/800x600/4caf50/fff?text=WiFi+Router' }],
    description: 'High-speed WiFi 6 router for seamless connectivity',
    createdAt: daysAgo(110),
  },
  {
    name: 'Blue Yeti USB Microphone',
    category: 'Electronics',
    basePrice: 9999,
    discount: 1000,
    stock: 15,
    tags: ['microphone', 'recording', 'streaming', 'podcasting'],
    images: [{ url: 'https://via.placeholder.com/800x600/1e88e5/fff?text=Blue+Yeti' }],
    description: 'Professional USB microphone for content creators',
    createdAt: daysAgo(65),
  },

  // ==========================================
  // FASHION (30 products)
  // Testing: Mixed prices, varied stock states
  // ==========================================
  {
    name: 'Levi\'s 501 Original Fit Jeans',
    category: 'Fashion',
    basePrice: 4999,
    discount: 1000,
    stock: 50,
    tags: ['jeans', 'denim', 'levis', 'casual'],
    images: [{ url: 'https://via.placeholder.com/800x600/003f87/fff?text=Levis+Jeans' }],
    description: 'Classic straight-fit jeans in authentic denim',
    createdAt: daysAgo(3),
  },
  {
    name: 'Nike Air Max 270',
    category: 'Fashion',
    basePrice: 12995,
    discount: 2000,
    stock: 40,
    tags: ['shoes', 'sneakers', 'nike', 'sports'],
    images: [{ url: 'https://via.placeholder.com/800x600/000/fff?text=Nike+Air+Max' }],
    description: 'Comfortable lifestyle sneakers with Max Air cushioning',
    createdAt: daysAgo(7),
  },
  {
    name: 'Adidas Ultraboost 23',
    category: 'Fashion',
    basePrice: 16999,
    discount: 3000,
    stock: 25,
    tags: ['shoes', 'running', 'adidas', 'sports'],
    images: [{ url: 'https://via.placeholder.com/800x600/000/fff?text=Ultraboost' }],
    description: 'Premium running shoes with Boost technology',
    createdAt: daysAgo(14),
  },
  {
    name: 'Polo Ralph Lauren Classic Shirt',
    category: 'Fashion',
    basePrice: 7999,
    discount: 1500,
    stock: 60,
    tags: ['shirt', 'polo', 'formal', 'ralph-lauren'],
    images: [{ url: 'https://via.placeholder.com/800x600/003d7a/fff?text=Polo+Shirt' }],
    description: 'Timeless polo shirt for casual elegance',
    createdAt: daysAgo(20),
  },
  {
    name: 'Tommy Hilfiger Denim Jacket',
    category: 'Fashion',
    basePrice: 9999,
    discount: 2000,
    stock: 15,
    tags: ['jacket', 'denim', 'tommy', 'outerwear'],
    images: [{ url: 'https://via.placeholder.com/800x600/041e42/fff?text=Tommy+Jacket' }],
    description: 'Classic denim jacket with iconic branding',
    createdAt: daysAgo(30),
  },
  {
    name: 'Zara Slim Fit Blazer',
    category: 'Fashion',
    basePrice: 6999,
    discount: 0,
    stock: 8,
    tags: ['blazer', 'formal', 'zara', 'business'],
    images: [{ url: 'https://via.placeholder.com/800x600/000/fff?text=Zara+Blazer' }],
    description: 'Modern slim-fit blazer for professional wear',
    createdAt: daysAgo(45),
  },
  {
    name: 'H&M Cotton T-Shirt Pack (3-Pack)',
    category: 'Fashion',
    basePrice: 1499,
    discount: 200,
    stock: 100,
    tags: ['tshirt', 'casual', 'hm', 'basics'],
    images: [{ url: 'https://via.placeholder.com/800x600/e50010/fff?text=H%26M+Tee' }],
    description: 'Essential cotton t-shirts in classic colors',
    createdAt: daysAgo(60),
  },
  {
    name: 'Ray-Ban Aviator Sunglasses',
    category: 'Fashion',
    basePrice: 11999,
    discount: 2000,
    stock: 30,
    tags: ['sunglasses', 'rayban', 'accessories', 'classic'],
    images: [{ url: 'https://via.placeholder.com/800x600/000/fff?text=Ray-Ban' }],
    description: 'Iconic aviator sunglasses with UV protection',
    createdAt: daysAgo(75),
  },
  {
    name: 'Fossil Leather Watch',
    category: 'Fashion',
    basePrice: 9999,
    discount: 1500,
    stock: 20,
    tags: ['watch', 'leather', 'fossil', 'accessories'],
    images: [{ url: 'https://via.placeholder.com/800x600/8b4513/fff?text=Fossil+Watch' }],
    description: 'Elegant analog watch with genuine leather strap',
    createdAt: daysAgo(90),
  },
  {
    name: 'Puma Track Pants',
    category: 'Fashion',
    basePrice: 2999,
    discount: 500,
    stock: 70,
    tags: ['pants', 'sportswear', 'puma', 'athleisure'],
    images: [{ url: 'https://via.placeholder.com/800x600/000/fff?text=Puma+Pants' }],
    description: 'Comfortable track pants for casual and sports wear',
    createdAt: daysAgo(50),
  },
  {
    name: 'Columbia Rain Jacket',
    category: 'Fashion',
    basePrice: 8999,
    discount: 1000,
    stock: 12,
    tags: ['jacket', 'rain', 'columbia', 'outdoor'],
    images: [{ url: 'https://via.placeholder.com/800x600/1e3a8a/fff?text=Rain+Jacket' }],
    description: 'Waterproof jacket for outdoor adventures',
    createdAt: daysAgo(100),
  },
  {
    name: 'Calvin Klein Boxer Briefs (Pack of 3)',
    category: 'Fashion',
    basePrice: 2499,
    discount: 0,
    stock: 90,
    tags: ['underwear', 'calvin-klein', 'basics', 'men'],
    images: [{ url: 'https://via.placeholder.com/800x600/000/fff?text=CK+Boxers' }],
    description: 'Premium cotton boxer briefs for everyday comfort',
    createdAt: daysAgo(120),
  },
  {
    name: 'Vans Old Skool Sneakers',
    category: 'Fashion',
    basePrice: 5499,
    discount: 800,
    stock: 35,
    tags: ['shoes', 'sneakers', 'vans', 'skateboard'],
    images: [{ url: 'https://via.placeholder.com/800x600/000/fff?text=Vans' }],
    description: 'Classic skate shoes with iconic side stripe',
    createdAt: daysAgo(40),
  },
  {
    name: 'Gucci Leather Belt',
    category: 'Fashion',
    basePrice: 34999,
    discount: 0,
    stock: 5,
    tags: ['belt', 'luxury', 'gucci', 'accessories'],
    images: [{ url: 'https://via.placeholder.com/800x600/013220/fff?text=Gucci+Belt' }],
    description: 'Luxury leather belt with signature GG buckle',
    createdAt: daysAgo(10),
  },
  {
    name: 'North Face Puffer Jacket',
    category: 'Fashion',
    basePrice: 15999,
    discount: 3000,
    stock: 10,
    tags: ['jacket', 'winter', 'north-face', 'outdoor'],
    images: [{ url: 'https://via.placeholder.com/800x600/000/fff?text=Puffer+Jacket' }],
    description: 'Insulated winter jacket for extreme cold',
    createdAt: daysAgo(130),
  },
  {
    name: 'Uniqlo Heattech Thermal Wear',
    category: 'Fashion',
    basePrice: 1999,
    discount: 300,
    stock: 80,
    tags: ['thermal', 'winter', 'uniqlo', 'innerwear'],
    images: [{ url: 'https://via.placeholder.com/800x600/ff0000/fff?text=Heattech' }],
    description: 'Heat-retaining innerwear for cold weather',
    createdAt: daysAgo(150),
  },
  {
    name: 'Lululemon Yoga Pants',
    category: 'Fashion',
    basePrice: 9999,
    discount: 2000,
    stock: 0, // Out of stock
    tags: ['yoga', 'activewear', 'lululemon', 'fitness'],
    images: [{ url: 'https://via.placeholder.com/800x600/c8102e/fff?text=Lululemon' }],
    description: 'High-performance yoga pants with moisture-wicking fabric',
    createdAt: daysAgo(25),
  },
  {
    name: 'Converse Chuck Taylor All Star',
    category: 'Fashion',
    basePrice: 4499,
    discount: 700,
    stock: 55,
    tags: ['shoes', 'sneakers', 'converse', 'classic'],
    images: [{ url: 'https://via.placeholder.com/800x600/000/fff?text=Converse' }],
    description: 'Timeless canvas sneakers for everyday style',
    createdAt: daysAgo(85),
  },
  {
    name: 'Michael Kors Handbag',
    category: 'Fashion',
    basePrice: 24999,
    discount: 5000,
    stock: 6,
    tags: ['handbag', 'luxury', 'michael-kors', 'women'],
    images: [{ url: 'https://via.placeholder.com/800x600/000/fff?text=MK+Bag' }],
    description: 'Designer handbag with signature hardware',
    createdAt: daysAgo(15),
  },
  {
    name: 'Timberland Boots',
    category: 'Fashion',
    basePrice: 14999,
    discount: 2500,
    stock: 18,
    tags: ['boots', 'timberland', 'outdoor', 'waterproof'],
    images: [{ url: 'https://via.placeholder.com/800x600/8b4513/fff?text=Timberland' }],
    description: 'Durable waterproof boots for rugged terrain',
    createdAt: daysAgo(95),
  },
  {
    name: 'Cashmere Scarf',
    category: 'Fashion',
    basePrice: 5999,
    discount: 1000,
    stock: 25,
    tags: ['scarf', 'winter', 'cashmere', 'accessories'],
    images: [{ url: 'https://via.placeholder.com/800x600/d2b48c/000?text=Cashmere+Scarf' }],
    description: 'Soft cashmere scarf for elegant warmth',
    createdAt: daysAgo(140),
  },
  {
    name: 'Champion Hoodie',
    category: 'Fashion',
    basePrice: 3999,
    discount: 800,
    stock: 45,
    tags: ['hoodie', 'casual', 'champion', 'streetwear'],
    images: [{ url: 'https://via.placeholder.com/800x600/c8102e/fff?text=Champion' }],
    description: 'Classic pullover hoodie with iconic logo',
    createdAt: daysAgo(35),
  },
  {
    name: 'Reebok Running Shorts',
    category: 'Fashion',
    basePrice: 1999,
    discount: 0,
    stock: 60,
    tags: ['shorts', 'running', 'reebok', 'sportswear'],
    images: [{ url: 'https://via.placeholder.com/800x600/000/fff?text=Reebok+Shorts' }],
    description: 'Lightweight running shorts with moisture management',
    createdAt: daysAgo(70),
  },
  {
    name: 'Superdry Windbreaker',
    category: 'Fashion',
    basePrice: 7499,
    discount: 1500,
    stock: 14,
    tags: ['jacket', 'windbreaker', 'superdry', 'outdoor'],
    images: [{ url: 'https://via.placeholder.com/800x600/00aeef/fff?text=Windbreaker' }],
    description: 'Lightweight jacket for windy conditions',
    createdAt: daysAgo(110),
  },
  {
    name: 'Armani Exchange Cap',
    category: 'Fashion',
    basePrice: 2499,
    discount: 500,
    stock: 40,
    tags: ['cap', 'hat', 'armani', 'accessories'],
    images: [{ url: 'https://via.placeholder.com/800x600/000/fff?text=AX+Cap' }],
    description: 'Stylish baseball cap with embroidered logo',
    createdAt: daysAgo(55),
  },
  {
    name: 'Under Armour Compression Shirt',
    category: 'Fashion',
    basePrice: 2999,
    discount: 500,
    stock: 50,
    tags: ['shirt', 'compression', 'under-armour', 'sports'],
    images: [{ url: 'https://via.placeholder.com/800x600/000/fff?text=UA+Compression' }],
    description: 'Performance compression shirt for intense workouts',
    createdAt: daysAgo(65),
  },
  {
    name: 'Diesel Skinny Jeans',
    category: 'Fashion',
    basePrice: 8999,
    discount: 2000,
    stock: 22,
    tags: ['jeans', 'denim', 'diesel', 'skinny'],
    images: [{ url: 'https://via.placeholder.com/800x600/000/fff?text=Diesel+Jeans' }],
    description: 'Modern skinny-fit jeans with premium denim',
    createdAt: daysAgo(80),
  },
  {
    name: 'Prada Sunglasses',
    category: 'Fashion',
    basePrice: 29999,
    discount: 0,
    stock: 4,
    tags: ['sunglasses', 'luxury', 'prada', 'designer'],
    images: [{ url: 'https://via.placeholder.com/800x600/000/fff?text=Prada' }],
    description: 'Luxury designer sunglasses with Italian craftsmanship',
    createdAt: daysAgo(18),
  },
  {
    name: 'Lee Cooper Cargo Pants',
    category: 'Fashion',
    basePrice: 3499,
    discount: 700,
    stock: 35,
    tags: ['pants', 'cargo', 'lee-cooper', 'casual'],
    images: [{ url: 'https://via.placeholder.com/800x600/004d40/fff?text=Cargo+Pants' }],
    description: 'Multi-pocket cargo pants for utility and style',
    createdAt: daysAgo(105),
  },
  {
    name: 'Skechers Walking Shoes',
    category: 'Fashion',
    basePrice: 5999,
    discount: 1000,
    stock: 30,
    tags: ['shoes', 'walking', 'skechers', 'comfort'],
    images: [{ url: 'https://via.placeholder.com/800x600/000/fff?text=Skechers' }],
    description: 'Comfortable walking shoes with memory foam insoles',
    createdAt: daysAgo(125),
  },

  // ==========================================
  // HOME & KITCHEN (20 products)
  // Testing: Mid-range prices, practical items
  // ==========================================
  {
    name: 'Philips Air Fryer XXL',
    category: 'Home & Kitchen',
    basePrice: 16999,
    discount: 3000,
    stock: 15,
    tags: ['appliance', 'air-fryer', 'philips', 'cooking'],
    images: [{ url: 'https://via.placeholder.com/800x600/0e4194/fff?text=Air+Fryer' }],
    description: 'Large capacity air fryer for healthy cooking',
    createdAt: daysAgo(8),
  },
  {
    name: 'Instant Pot Duo 7-in-1',
    category: 'Home & Kitchen',
    basePrice: 8999,
    discount: 1500,
    stock: 25,
    tags: ['appliance', 'instant-pot', 'pressure-cooker', 'cooking'],
    images: [{ url: 'https://via.placeholder.com/800x600/c8102e/fff?text=Instant+Pot' }],
    description: 'Multi-functional pressure cooker for quick meals',
    createdAt: daysAgo(12),
  },
  {
    name: 'Ninja Blender Pro',
    category: 'Home & Kitchen',
    basePrice: 6999,
    discount: 1000,
    stock: 30,
    tags: ['appliance', 'blender', 'ninja', 'smoothie'],
    images: [{ url: 'https://via.placeholder.com/800x600/e4002b/fff?text=Ninja+Blender' }],
    description: 'Powerful blender for smoothies and food prep',
    createdAt: daysAgo(22),
  },
  {
    name: 'Dyson V15 Vacuum Cleaner',
    category: 'Home & Kitchen',
    basePrice: 54990,
    discount: 5000,
    stock: 8,
    tags: ['appliance', 'vacuum', 'dyson', 'cleaning'],
    images: [{ url: 'https://via.placeholder.com/800x600/6c1d5f/fff?text=Dyson+V15' }],
    description: 'Cordless vacuum with laser detection technology',
    createdAt: daysAgo(5),
  },
  {
    name: 'KitchenAid Stand Mixer',
    category: 'Home & Kitchen',
    basePrice: 34999,
    discount: 4000,
    stock: 10,
    tags: ['appliance', 'mixer', 'kitchenaid', 'baking'],
    images: [{ url: 'https://via.placeholder.com/800x600/c8102e/fff?text=Stand+Mixer' }],
    description: 'Professional stand mixer for baking enthusiasts',
    createdAt: daysAgo(30),
  },
  {
    name: 'Nespresso Coffee Machine',
    category: 'Home & Kitchen',
    basePrice: 12999,
    discount: 2000,
    stock: 20,
    tags: ['appliance', 'coffee', 'nespresso', 'beverage'],
    images: [{ url: 'https://via.placeholder.com/800x600/8d5524/fff?text=Nespresso' }],
    description: 'Premium capsule coffee machine for barista-quality coffee',
    createdAt: daysAgo(18),
  },
  {
    name: 'Cuisinart Food Processor',
    category: 'Home & Kitchen',
    basePrice: 9999,
    discount: 1500,
    stock: 18,
    tags: ['appliance', 'food-processor', 'cuisinart', 'cooking'],
    images: [{ url: 'https://via.placeholder.com/800x600/007ac1/fff?text=Food+Processor' }],
    description: 'Versatile food processor for meal prep',
    createdAt: daysAgo(45),
  },
  {
    name: 'Tefal Non-Stick Pan Set',
    category: 'Home & Kitchen',
    basePrice: 4999,
    discount: 1000,
    stock: 40,
    tags: ['cookware', 'pans', 'tefal', 'non-stick'],
    images: [{ url: 'https://via.placeholder.com/800x600/e4002b/fff?text=Tefal+Pans' }],
    description: 'Durable non-stick pan set for everyday cooking',
    createdAt: daysAgo(60),
  },
  {
    name: 'Pyrex Glass Storage Containers',
    category: 'Home & Kitchen',
    basePrice: 2499,
    discount: 0,
    stock: 60,
    tags: ['storage', 'containers', 'pyrex', 'glass'],
    images: [{ url: 'https://via.placeholder.com/800x600/0066b2/fff?text=Pyrex' }],
    description: 'Stackable glass containers for food storage',
    createdAt: daysAgo(75),
  },
  {
    name: 'OXO Kitchen Utensil Set',
    category: 'Home & Kitchen',
    basePrice: 3499,
    discount: 500,
    stock: 50,
    tags: ['utensils', 'tools', 'oxo', 'cooking'],
    images: [{ url: 'https://via.placeholder.com/800x600/000/fff?text=OXO+Utensils' }],
    description: 'Ergonomic kitchen utensils for comfortable cooking',
    createdAt: daysAgo(90),
  },
  {
    name: 'Lodge Cast Iron Skillet',
    category: 'Home & Kitchen',
    basePrice: 3999,
    discount: 800,
    stock: 25,
    tags: ['cookware', 'cast-iron', 'lodge', 'skillet'],
    images: [{ url: 'https://via.placeholder.com/800x600/000/fff?text=Cast+Iron' }],
    description: 'Pre-seasoned cast iron skillet for versatile cooking',
    createdAt: daysAgo(100),
  },
  {
    name: 'Bosch Dishwasher',
    category: 'Home & Kitchen',
    basePrice: 39999,
    discount: 5000,
    stock: 0, // Out of stock
    tags: ['appliance', 'dishwasher', 'bosch', 'cleaning'],
    images: [{ url: 'https://via.placeholder.com/800x600/ea0016/fff?text=Dishwasher' }],
    description: 'Quiet and efficient dishwasher with multiple programs',
    createdAt: daysAgo(40),
  },
  {
    name: 'Crock-Pot Slow Cooker',
    category: 'Home & Kitchen',
    basePrice: 5999,
    discount: 1000,
    stock: 22,
    tags: ['appliance', 'slow-cooker', 'crock-pot', 'cooking'],
    images: [{ url: 'https://via.placeholder.com/800x600/8b0000/fff?text=Crock-Pot' }],
    description: 'Set-and-forget slow cooker for tender meals',
    createdAt: daysAgo(70),
  },
  {
    name: 'Joseph Joseph Knife Set',
    category: 'Home & Kitchen',
    basePrice: 7999,
    discount: 1500,
    stock: 15,
    tags: ['knives', 'cutlery', 'joseph-joseph', 'cooking'],
    images: [{ url: 'https://via.placeholder.com/800x600/000/fff?text=Knife+Set' }],
    description: 'Color-coded knife set with storage case',
    createdAt: daysAgo(85),
  },
  {
    name: 'IKEA Cookware Organizer',
    category: 'Home & Kitchen',
    basePrice: 1499,
    discount: 0,
    stock: 80,
    tags: ['storage', 'organizer', 'ikea', 'kitchen'],
    images: [{ url: 'https://via.placeholder.com/800x600/0051ba/fff?text=IKEA+Organizer' }],
    description: 'Space-saving organizer for pots and pans',
    createdAt: daysAgo(120),
  },
  {
    name: 'Microwave Oven 25L',
    category: 'Home & Kitchen',
    basePrice: 8999,
    discount: 1500,
    stock: 12,
    tags: ['appliance', 'microwave', 'cooking', 'heating'],
    images: [{ url: 'https://via.placeholder.com/800x600/000/fff?text=Microwave' }],
    description: 'Compact microwave with convection feature',
    createdAt: daysAgo(50),
  },
  {
    name: 'Brabantia Trash Can',
    category: 'Home & Kitchen',
    basePrice: 4999,
    discount: 1000,
    stock: 30,
    tags: ['trash-can', 'bin', 'brabantia', 'storage'],
    images: [{ url: 'https://via.placeholder.com/800x600/c0c0c0/000?text=Trash+Can' }],
    description: 'Stainless steel trash can with soft-close lid',
    createdAt: daysAgo(110),
  },
  {
    name: 'Zojirushi Rice Cooker',
    category: 'Home & Kitchen',
    basePrice: 14999,
    discount: 2000,
    stock: 10,
    tags: ['appliance', 'rice-cooker', 'zojirushi', 'cooking'],
    images: [{ url: 'https://via.placeholder.com/800x600/ff0000/fff?text=Rice+Cooker' }],
    description: 'Fuzzy logic rice cooker for perfect rice every time',
    createdAt: daysAgo(35),
  },
  {
    name: 'Silicone Baking Mat Set',
    category: 'Home & Kitchen',
    basePrice: 1299,
    discount: 200,
    stock: 70,
    tags: ['baking', 'mat', 'silicone', 'tools'],
    images: [{ url: 'https://via.placeholder.com/800x600/ff69b4/fff?text=Baking+Mat' }],
    description: 'Non-stick reusable baking mats for easy cleanup',
    createdAt: daysAgo(130),
  },
  {
    name: 'Bamboo Cutting Board Set',
    category: 'Home & Kitchen',
    basePrice: 2999,
    discount: 500,
    stock: 45,
    tags: ['cutting-board', 'bamboo', 'eco-friendly', 'tools'],
    images: [{ url: 'https://via.placeholder.com/800x600/d2691e/fff?text=Cutting+Board' }],
    description: 'Eco-friendly bamboo cutting boards in multiple sizes',
    createdAt: daysAgo(95),
  },

  // ==========================================
  // SPORTS & FITNESS (15 products)
  // Testing: Price variety, stock variation
  // ==========================================
  {
    name: 'Yoga Mat Premium 6mm',
    category: 'Sports & Fitness',
    basePrice: 2499,
    discount: 500,
    stock: 60,
    tags: ['yoga', 'mat', 'fitness', 'exercise'],
    images: [{ url: 'https://via.placeholder.com/800x600/9c27b0/fff?text=Yoga+Mat' }],
    description: 'Thick non-slip yoga mat with carrying strap',
    createdAt: daysAgo(10),
  },
  {
    name: 'Dumbbell Set 20kg',
    category: 'Sports & Fitness',
    basePrice: 4999,
    discount: 1000,
    stock: 25,
    tags: ['dumbbells', 'weights', 'strength', 'gym'],
    images: [{ url: 'https://via.placeholder.com/800x600/424242/fff?text=Dumbbells' }],
    description: 'Adjustable dumbbell set for home workouts',
    createdAt: daysAgo(15),
  },
  {
    name: 'Resistance Bands Set',
    category: 'Sports & Fitness',
    basePrice: 1299,
    discount: 0,
    stock: 80,
    tags: ['resistance-bands', 'fitness', 'exercise', 'portable'],
    images: [{ url: 'https://via.placeholder.com/800x600/ff9800/fff?text=Resistance+Bands' }],
    description: 'Five resistance levels for versatile workouts',
    createdAt: daysAgo(25),
  },
  {
    name: 'Treadmill Electric Folding',
    category: 'Sports & Fitness',
    basePrice: 34999,
    discount: 5000,
    stock: 5,
    tags: ['treadmill', 'cardio', 'running', 'gym'],
    images: [{ url: 'https://via.placeholder.com/800x600/000/fff?text=Treadmill' }],
    description: 'Foldable electric treadmill for home cardio',
    createdAt: daysAgo(8),
  },
  {
    name: 'Exercise Bike Stationary',
    category: 'Sports & Fitness',
    basePrice: 18999,
    discount: 3000,
    stock: 10,
    tags: ['bike', 'cycling', 'cardio', 'gym'],
    images: [{ url: 'https://via.placeholder.com/800x600/2196f3/fff?text=Exercise+Bike' }],
    description: 'Quiet magnetic resistance bike with LCD display',
    createdAt: daysAgo(20),
  },
  {
    name: 'Kettlebell 12kg',
    category: 'Sports & Fitness',
    basePrice: 2999,
    discount: 500,
    stock: 35,
    tags: ['kettlebell', 'weights', 'strength', 'crossfit'],
    images: [{ url: 'https://via.placeholder.com/800x600/424242/fff?text=Kettlebell' }],
    description: 'Cast iron kettlebell for functional training',
    createdAt: daysAgo(40),
  },
  {
    name: 'Pull-Up Bar Doorway',
    category: 'Sports & Fitness',
    basePrice: 1999,
    discount: 300,
    stock: 50,
    tags: ['pull-up', 'bar', 'strength', 'home-gym'],
    images: [{ url: 'https://via.placeholder.com/800x600/000/fff?text=Pull-Up+Bar' }],
    description: 'Easy-install doorway pull-up bar for upper body',
    createdAt: daysAgo(55),
  },
  {
    name: 'Foam Roller Massage',
    category: 'Sports & Fitness',
    basePrice: 1499,
    discount: 200,
    stock: 70,
    tags: ['foam-roller', 'recovery', 'massage', 'fitness'],
    images: [{ url: 'https://via.placeholder.com/800x600/00bcd4/fff?text=Foam+Roller' }],
    description: 'Textured foam roller for muscle recovery',
    createdAt: daysAgo(65),
  },
  {
    name: 'Jump Rope Speed',
    category: 'Sports & Fitness',
    basePrice: 699,
    discount: 0,
    stock: 100,
    tags: ['jump-rope', 'cardio', 'fitness', 'portable'],
    images: [{ url: 'https://via.placeholder.com/800x600/ff5722/fff?text=Jump+Rope' }],
    description: 'Adjustable speed jump rope for cardio workouts',
    createdAt: daysAgo(80),
  },
  {
    name: 'Gym Gloves Weightlifting',
    category: 'Sports & Fitness',
    basePrice: 999,
    discount: 150,
    stock: 55,
    tags: ['gloves', 'weightlifting', 'gym', 'accessories'],
    images: [{ url: 'https://via.placeholder.com/800x600/000/fff?text=Gym+Gloves' }],
    description: 'Padded gloves for comfortable weightlifting',
    createdAt: daysAgo(90),
  },
  {
    name: 'Ankle Weights 2kg Pair',
    category: 'Sports & Fitness',
    basePrice: 1799,
    discount: 300,
    stock: 40,
    tags: ['ankle-weights', 'resistance', 'fitness', 'training'],
    images: [{ url: 'https://via.placeholder.com/800x600/9e9e9e/fff?text=Ankle+Weights' }],
    description: 'Adjustable ankle weights for resistance training',
    createdAt: daysAgo(100),
  },
  {
    name: 'Protein Shaker Bottle',
    category: 'Sports & Fitness',
    basePrice: 499,
    discount: 0,
    stock: 120,
    tags: ['shaker', 'bottle', 'protein', 'accessories'],
    images: [{ url: 'https://via.placeholder.com/800x600/4caf50/fff?text=Shaker' }],
    description: 'Leak-proof protein shaker with mixing ball',
    createdAt: daysAgo(110),
  },
  {
    name: 'Ab Roller Wheel',
    category: 'Sports & Fitness',
    basePrice: 899,
    discount: 100,
    stock: 65,
    tags: ['ab-roller', 'core', 'fitness', 'home-gym'],
    images: [{ url: 'https://via.placeholder.com/800x600/ff9800/fff?text=Ab+Roller' }],
    description: 'Dual-wheel ab roller for core strengthening',
    createdAt: daysAgo(75),
  },
  {
    name: 'Rowing Machine Magnetic',
    category: 'Sports & Fitness',
    basePrice: 24999,
    discount: 4000,
    stock: 0, // Out of stock
    tags: ['rowing', 'machine', 'cardio', 'full-body'],
    images: [{ url: 'https://via.placeholder.com/800x600/607d8b/fff?text=Rowing+Machine' }],
    description: 'Full-body cardio with magnetic resistance',
    createdAt: daysAgo(30),
  },
  {
    name: 'Boxing Gloves 12oz',
    category: 'Sports & Fitness',
    basePrice: 2999,
    discount: 500,
    stock: 20,
    tags: ['boxing', 'gloves', 'martial-arts', 'training'],
    images: [{ url: 'https://via.placeholder.com/800x600/e53935/fff?text=Boxing+Gloves' }],
    description: 'Professional boxing gloves with wrist support',
    createdAt: daysAgo(50),
  },

  // ==========================================
  // BOOKS (10 products)
  // Testing: Low prices, high stock
  // ==========================================
  {
    name: 'Atomic Habits by James Clear',
    category: 'Books',
    basePrice: 499,
    discount: 50,
    stock: 100,
    tags: ['book', 'self-help', 'habits', 'productivity'],
    images: [{ url: 'https://via.placeholder.com/800x600/ff6b6b/fff?text=Atomic+Habits' }],
    description: 'Bestselling guide to building good habits',
    createdAt: daysAgo(30),
  },
  {
    name: 'The Psychology of Money',
    category: 'Books',
    basePrice: 399,
    discount: 40,
    stock: 120,
    tags: ['book', 'finance', 'psychology', 'money'],
    images: [{ url: 'https://via.placeholder.com/800x600/4ecdc4/fff?text=Psychology+Money' }],
    description: 'Timeless lessons on wealth and happiness',
    createdAt: daysAgo(60),
  },
  {
    name: 'Sapiens by Yuval Noah Harari',
    category: 'Books',
    basePrice: 599,
    discount: 100,
    stock: 80,
    tags: ['book', 'history', 'science', 'humanity'],
    images: [{ url: 'https://via.placeholder.com/800x600/f7b731/fff?text=Sapiens' }],
    description: 'A brief history of humankind',
    createdAt: daysAgo(90),
  },
  {
    name: 'Rich Dad Poor Dad',
    category: 'Books',
    basePrice: 349,
    discount: 0,
    stock: 150,
    tags: ['book', 'finance', 'investing', 'money'],
    images: [{ url: 'https://via.placeholder.com/800x600/5f27cd/fff?text=Rich+Dad' }],
    description: 'Classic personal finance and investing book',
    createdAt: daysAgo(120),
  },
  {
    name: 'The Alchemist by Paulo Coelho',
    category: 'Books',
    basePrice: 299,
    discount: 30,
    stock: 90,
    tags: ['book', 'fiction', 'philosophy', 'inspiration'],
    images: [{ url: 'https://via.placeholder.com/800x600/00d2d3/fff?text=Alchemist' }],
    description: 'Inspirational novel about following your dreams',
    createdAt: daysAgo(150),
  },
  {
    name: 'Think and Grow Rich',
    category: 'Books',
    basePrice: 199,
    discount: 0,
    stock: 200,
    tags: ['book', 'self-help', 'success', 'wealth'],
    images: [{ url: 'https://via.placeholder.com/800x600/ff9ff3/fff?text=Think+Grow+Rich' }],
    description: 'Napoleon Hill\'s philosophy of personal achievement',
    createdAt: daysAgo(180),
  },
  {
    name: 'Harry Potter Complete Set',
    category: 'Books',
    basePrice: 3999,
    discount: 500,
    stock: 25,
    tags: ['book', 'fiction', 'fantasy', 'harry-potter'],
    images: [{ url: 'https://via.placeholder.com/800x600/740001/fff?text=Harry+Potter' }],
    description: 'Complete collection of all 7 Harry Potter books',
    createdAt: daysAgo(45),
  },
  {
    name: '1984 by George Orwell',
    category: 'Books',
    basePrice: 249,
    discount: 25,
    stock: 110,
    tags: ['book', 'fiction', 'dystopian', 'classic'],
    images: [{ url: 'https://via.placeholder.com/800x600/000/fff?text=1984' }],
    description: 'Classic dystopian novel about totalitarianism',
    createdAt: daysAgo(100),
  },
  {
    name: 'The 7 Habits of Highly Effective People',
    category: 'Books',
    basePrice: 449,
    discount: 50,
    stock: 75,
    tags: ['book', 'self-help', 'productivity', 'leadership'],
    images: [{ url: 'https://via.placeholder.com/800x600/48dbfb/fff?text=7+Habits' }],
    description: 'Stephen Covey\'s principles for personal effectiveness',
    createdAt: daysAgo(70),
  },
  {
    name: 'The Subtle Art of Not Giving a F*ck',
    category: 'Books',
    basePrice: 399,
    discount: 40,
    stock: 95,
    tags: ['book', 'self-help', 'mindfulness', 'philosophy'],
    images: [{ url: 'https://via.placeholder.com/800x600/ff6348/fff?text=Subtle+Art' }],
    description: 'Counterintuitive approach to living a good life',
    createdAt: daysAgo(55),
  },

  // ==========================================
  // BEAUTY & PERSONAL CARE (12 products)
  // Testing: Low-mid prices, varied stock
  // ==========================================
  {
    name: 'L\'Oréal Paris Hair Serum',
    category: 'Beauty & Personal Care',
    basePrice: 799,
    discount: 100,
    stock: 60,
    tags: ['hair-care', 'serum', 'loreal', 'beauty'],
    images: [{ url: 'https://via.placeholder.com/800x600/000/fff?text=Loreal+Serum' }],
    description: 'Smoothing serum for frizz-free hair',
    createdAt: daysAgo(20),
  },
  {
    name: 'Nivea Soft Moisturizing Cream',
    category: 'Beauty & Personal Care',
    basePrice: 299,
    discount: 0,
    stock: 150,
    tags: ['skincare', 'moisturizer', 'nivea', 'cream'],
    images: [{ url: 'https://via.placeholder.com/800x600/0057a0/fff?text=Nivea+Cream' }],
    description: 'Lightweight moisturizing cream for all skin types',
    createdAt: daysAgo(35),
  },
  {
    name: 'Maybelline Fit Me Foundation',
    category: 'Beauty & Personal Care',
    basePrice: 549,
    discount: 50,
    stock: 40,
    tags: ['makeup', 'foundation', 'maybelline', 'beauty'],
    images: [{ url: 'https://via.placeholder.com/800x600/000/fff?text=Foundation' }],
    description: 'Matte and poreless foundation for flawless skin',
    createdAt: daysAgo(15),
  },
  {
    name: 'Gillette Fusion5 Razor',
    category: 'Beauty & Personal Care',
    basePrice: 899,
    discount: 150,
    stock: 80,
    tags: ['shaving', 'razor', 'gillette', 'men'],
    images: [{ url: 'https://via.placeholder.com/800x600/0093d0/fff?text=Gillette' }],
    description: 'Precision razor with 5-blade technology',
    createdAt: daysAgo(50),
  },
  {
    name: 'Cetaphil Gentle Cleanser',
    category: 'Beauty & Personal Care',
    basePrice: 699,
    discount: 100,
    stock: 70,
    tags: ['skincare', 'cleanser', 'cetaphil', 'face-wash'],
    images: [{ url: 'https://via.placeholder.com/800x600/009fda/fff?text=Cetaphil' }],
    description: 'Gentle face cleanser for sensitive skin',
    createdAt: daysAgo(40),
  },
  {
    name: 'The Body Shop Vitamin E Cream',
    category: 'Beauty & Personal Care',
    basePrice: 1299,
    discount: 200,
    stock: 30,
    tags: ['skincare', 'cream', 'bodyshop', 'vitamin-e'],
    images: [{ url: 'https://via.placeholder.com/800x600/006341/fff?text=Body+Shop' }],
    description: 'Nourishing cream with vitamin E for dry skin',
    createdAt: daysAgo(25),
  },
  {
    name: 'Dove Shampoo Intense Repair',
    category: 'Beauty & Personal Care',
    basePrice: 399,
    discount: 40,
    stock: 100,
    tags: ['hair-care', 'shampoo', 'dove', 'repair'],
    images: [{ url: 'https://via.placeholder.com/800x600/0057a0/fff?text=Dove+Shampoo' }],
    description: 'Repairing shampoo for damaged hair',
    createdAt: daysAgo(60),
  },
  {
    name: 'Biotique Bio Kelp Shampoo',
    category: 'Beauty & Personal Care',
    basePrice: 249,
    discount: 0,
    stock: 90,
    tags: ['hair-care', 'shampoo', 'biotique', 'natural'],
    images: [{ url: 'https://via.placeholder.com/800x600/4caf50/fff?text=Biotique' }],
    description: 'Protein shampoo for falling hair',
    createdAt: daysAgo(75),
  },
  {
    name: 'Lakme Kajal Absolute',
    category: 'Beauty & Personal Care',
    basePrice: 299,
    discount: 30,
    stock: 120,
    tags: ['makeup', 'kajal', 'lakme', 'eyes'],
    images: [{ url: 'https://via.placeholder.com/800x600/e91e63/fff?text=Lakme+Kajal' }],
    description: 'Smudge-proof kajal for intense black eyes',
    createdAt: daysAgo(45),
  },
  {
    name: 'Plum Green Tea Face Mist',
    category: 'Beauty & Personal Care',
    basePrice: 399,
    discount: 50,
    stock: 50,
    tags: ['skincare', 'mist', 'plum', 'green-tea'],
    images: [{ url: 'https://via.placeholder.com/800x600/8bc34a/fff?text=Face+Mist' }],
    description: 'Refreshing face mist with green tea extract',
    createdAt: daysAgo(30),
  },
  {
    name: 'WOW Skin Science Onion Hair Oil',
    category: 'Beauty & Personal Care',
    basePrice: 599,
    discount: 100,
    stock: 0, // Out of stock
    tags: ['hair-care', 'oil', 'wow', 'onion'],
    images: [{ url: 'https://via.placeholder.com/800x600/ff5722/fff?text=Hair+Oil' }],
    description: 'Hair growth oil with red onion seed extract',
    createdAt: daysAgo(10),
  },
  {
    name: 'Garnier Micellar Water',
    category: 'Beauty & Personal Care',
    basePrice: 449,
    discount: 50,
    stock: 65,
    tags: ['skincare', 'cleanser', 'garnier', 'micellar'],
    images: [{ url: 'https://via.placeholder.com/800x600/00a651/fff?text=Micellar+Water' }],
    description: 'All-in-one makeup remover and cleanser',
    createdAt: daysAgo(55),
  },
];

// Main seeding function
async function seedProducts() {
  try {
    console.log('🌱 Starting product seeding...\n');

    // Connect to MongoDB
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI environment variable not set');
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected\n');

    // Clear existing products
    const deleteResult = await Product.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing products\n`);

    // Generate slugs, calculate finalPrice, and prepare products
    // Note: insertMany() bypasses pre-save hooks, so we must calculate manually
    const productsToInsert = productsData.map((product) => ({
      ...product,
      slug: slugify(product.name),
      finalPrice: Math.max(product.basePrice - product.discount, 0),
      inStock: (product.stock ?? 0) > 0,
    }));

    // Insert products
    const insertedProducts = await Product.insertMany(productsToInsert);
    console.log(`✅ Successfully seeded ${insertedProducts.length} products\n`);

    // Category distribution summary
    const categoryStats = {};
    insertedProducts.forEach((product) => {
      categoryStats[product.category] = (categoryStats[product.category] || 0) + 1;
    });

    console.log('📊 Category Distribution:');
    Object.entries(categoryStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count} products`);
      });

    // Stock state summary
    const inStockCount = insertedProducts.filter((p) => p.inStock).length;
    const outOfStockCount = insertedProducts.filter((p) => !p.inStock).length;
    const lowStockCount = insertedProducts.filter((p) => p.stock > 0 && p.stock <= 5).length;

    console.log('\n📦 Stock Status:');
    console.log(`   In Stock: ${inStockCount} products`);
    console.log(`   Out of Stock: ${outOfStockCount} products`);
    console.log(`   Low Stock (≤5): ${lowStockCount} products`);

    // Price range summary
    const prices = insertedProducts.map((p) => p.finalPrice);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

    console.log('\n💰 Price Range:');
    console.log(`   Min: ₹${minPrice}`);
    console.log(`   Max: ₹${maxPrice}`);
    console.log(`   Average: ₹${avgPrice}`);

    // New arrivals (last 30 days)
    const newArrivals = insertedProducts.filter((p) => {
      const daysSinceCreated = (new Date() - new Date(p.createdAt)) / (1000 * 60 * 60 * 24);
      return daysSinceCreated <= 30;
    }).length;

    console.log('\n🆕 New Arrivals (last 30 days): ' + newArrivals + ' products');

    console.log('\n✨ Seeding complete! Database ready for testing.\n');

    // Close connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

// Run the seeding script
seedProducts();
