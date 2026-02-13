/**
 * ========================================================
 * PRODUCT SEEDING SCRIPT - FOR LOCAL/STAGING ONLY
 * ========================================================
 *
 * PURPOSE:
 * Seeds database with 100+ jewelry products to test:
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

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

const categoryConfig = [
  { category: 'Earrings', count: 28 },
  { category: 'Rings', count: 24 },
  { category: 'Necklaces', count: 18 },
  { category: 'Bracelets', count: 16 },
  { category: 'Watches', count: 8 },
  { category: 'Charms', count: 6 },
];

const styleWords = [
  'Pantheon',
  'Eclipse',
  'Halo',
  'Oblique',
  'Lintel',
  'Shadowline',
  'Meridian',
  'Vertex',
  'Apex',
  'Zenith',
  'Prism',
  'Radiant',
  'Stellar',
  'Cosmos',
  'Aurora',
  'Nebula',
  'Orbit',
  'Galaxy',
  'Lunar',
  'Solar',
  'Astral',
  'Cosmic',
  'Celestial',
  'Ethereal',
  'Arcus',
  'Vesper',
  'Nocturne',
  'Solis',
  'Drift',
  'Helix',
];

const materials = [
  '18k Gold',
  '14k Gold',
  'Sterling Silver',
  'Rose Gold',
  'Platinum',
  'Gold Vermeil',
];

const finishes = ['Polished', 'Brushed', 'Matte', 'Hammered', 'Textured'];

const keywords = [
  'minimal',
  'architectural',
  'statement',
  'stackable',
  'everyday',
  'classic',
  'modern',
  'heirloom',
];

const priceTiers = [
  { min: 99, max: 199 },
  { min: 500, max: 2000 },
  { min: 10000, max: 50000 },
];

const stockStates = [
  { stock: 0 },
  { stock: 1 },
  { stock: 3 },
  { stock: 8 },
  { stock: 15 },
  { stock: 40 },
];

function pick(list, index) {
  return list[index % list.length];
}

function buildName(style, category, index) {
  const suffix = index % 3 === 0 ? 'Edition' : index % 4 === 0 ? 'Noir' : '';
  const categoryLabel = category.endsWith('s') ? category.slice(0, -1) : category;
  return `${style} ${categoryLabel}${suffix ? ' ' + suffix : ''}`;
}

function buildDescription(name, material, finish, category) {
  return `${name} blends ${material} with a ${finish.toLowerCase()} finish. Designed for ${category.toLowerCase()} lovers who prefer refined, architectural forms and everyday comfort.`;
}

function buildImages(slug) {
  return [
    { url: `https://picsum.photos/seed/${slug}-1/900/900` },
    { url: `https://picsum.photos/seed/${slug}-2/900/900` },
  ];
}

function buildCreatedAt(index) {
  if (index % 10 === 0) return daysAgo(1);
  if (index % 7 === 0) return daysAgo(12);
  if (index % 5 === 0) return daysAgo(35);
  if (index % 4 === 0) return daysAgo(60);
  return daysAgo(220);
}

function buildPrice(index) {
  const tier = priceTiers[index % priceTiers.length];
  const raw = tier.min + ((index * 137) % (tier.max - tier.min + 1));
  return Math.round(raw / 10) * 10;
}

function buildDiscount(index, basePrice) {
  if (index % 6 === 0) return Math.min(500, Math.round(basePrice * 0.08));
  if (index % 9 === 0) return Math.min(2000, Math.round(basePrice * 0.12));
  return 0;
}

function buildTags(category, material, style) {
  return [
    category.toLowerCase(),
    material.toLowerCase(),
    style.toLowerCase(),
    pick(keywords, style.length),
  ];
}

function buildProducts() {
  const products = [];
  let index = 0;

  categoryConfig.forEach(({ category, count }) => {
    for (let i = 0; i < count; i += 1) {
      const style = pick(styleWords, index);
      const material = pick(materials, index + 2);
      const finish = pick(finishes, index + 3);
      const name = buildName(style, category, index);
      const basePrice = buildPrice(index);
      const discount = buildDiscount(index, basePrice);
      const stock = pick(stockStates, index + 1).stock;
      const slug = slugify(name);

      products.push({
        name,
        slug,
        category,
        tags: buildTags(category, material, style),
        basePrice,
        discount,
        finalPrice: Math.max(basePrice - discount, 0),
        stock,
        inStock: stock > 0,
        images: buildImages(slug),
        description: buildDescription(name, material, finish, category),
        createdAt: buildCreatedAt(index),
      });

      index += 1;
    }
  });

  return products;
}

async function seedProducts() {
  try {
    console.log('Starting product seeding...\n');

    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI environment variable not set');
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected\n');

    const deleteResult = await Product.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing products\n`);

    const productsToInsert = buildProducts();
    const insertedProducts = await Product.insertMany(productsToInsert);
    console.log(`Successfully seeded ${insertedProducts.length} products\n`);

    const categoryStats = {};
    insertedProducts.forEach((product) => {
      categoryStats[product.category] = (categoryStats[product.category] || 0) + 1;
    });

    console.log('Category Distribution:');
    Object.entries(categoryStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count} products`);
      });

    const inStockCount = insertedProducts.filter((p) => p.inStock).length;
    const outOfStockCount = insertedProducts.filter((p) => !p.inStock).length;
    const lowStockCount = insertedProducts.filter((p) => p.stock > 0 && p.stock <= 5).length;

    console.log('\nStock Status:');
    console.log(`  In Stock: ${inStockCount} products`);
    console.log(`  Out of Stock: ${outOfStockCount} products`);
    console.log(`  Low Stock (<=5): ${lowStockCount} products`);

    const prices = insertedProducts.map((p) => p.finalPrice);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

    console.log('\nPrice Range:');
    console.log(`  Min: ${minPrice}`);
    console.log(`  Max: ${maxPrice}`);
    console.log(`  Average: ${avgPrice}`);

    const newArrivals = insertedProducts.filter((p) => {
      const daysSinceCreated = (new Date() - new Date(p.createdAt)) / (1000 * 60 * 60 * 24);
      return daysSinceCreated <= 30;
    }).length;

    console.log(`\nNew Arrivals (last 30 days): ${newArrivals} products`);
    console.log('\nSeeding complete.\n');

    await mongoose.connection.close();
    console.log('MongoDB connection closed\n');

    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seedProducts();
