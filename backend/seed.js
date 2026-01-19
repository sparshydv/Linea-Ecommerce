const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./src/models/Product.model');

dotenv.config();

// Helper to calculate finalPrice
const calculateFinalPrice = (basePrice, discount = 0) =>
  Math.max(basePrice - discount, 0);

const SEED_DATA = [
  // === JEWELRY (High-end, various prices) ===
  {
    name: 'Gold Necklace 24K',
    slug: 'gold-necklace-24k',
    category: 'jewelry',
    description: 'Beautiful 24K gold necklace with premium finish',
    tags: ['gold', 'necklace', 'premium'],
    basePrice: 500,
    discount: 50,
    stock: 20,
    images: [{ url: 'https://via.placeholder.com/300?text=Gold+Necklace' }],
    isActive: true,
  },
  {
    name: 'Silver Ring',
    slug: 'silver-ring',
    category: 'jewelry',
    description: 'Elegant silver ring with diamond accent',
    tags: ['silver', 'ring', 'diamond'],
    basePrice: 150,
    discount: 15,
    stock: 15,
    images: [{ url: 'https://via.placeholder.com/300?text=Silver+Ring' }],
    isActive: true,
  },
  {
    name: 'Diamond Bracelet',
    slug: 'diamond-bracelet',
    category: 'jewelry',
    description: 'Luxury diamond bracelet for special occasions',
    tags: ['diamond', 'bracelet', 'luxury'],
    basePrice: 800,
    discount: 100,
    stock: 5,
    images: [{ url: 'https://via.placeholder.com/300?text=Diamond+Bracelet' }],
    isActive: true,
  },
  {
    name: 'Pearl Earrings',
    slug: 'pearl-earrings',
    category: 'jewelry',
    description: 'Classic pearl earrings for everyday wear',
    tags: ['pearl', 'earrings', 'classic'],
    basePrice: 200,
    discount: 30,
    stock: 10,
    images: [{ url: 'https://via.placeholder.com/300?text=Pearl+Earrings' }],
    isActive: true,
  },
  {
    name: 'Gold Ring Premium',
    slug: 'gold-ring-premium',
    category: 'jewelry',
    description: 'High-quality gold ring with intricate design',
    tags: ['gold', 'ring', 'premium'],
    basePrice: 350,
    discount: 35,
    stock: 8,
    images: [{ url: 'https://via.placeholder.com/300?text=Gold+Ring' }],
    isActive: true,
  },
  {
    name: 'Copper Bracelet',
    slug: 'copper-bracelet',
    category: 'jewelry',
    description: 'Handmade copper bracelet with health benefits',
    tags: ['copper', 'bracelet', 'health'],
    basePrice: 80,
    discount: 8,
    stock: 30,
    images: [{ url: 'https://via.placeholder.com/300?text=Copper+Bracelet' }],
    isActive: true,
  },

  // === ELECTRONICS (Various price points) ===
  {
    name: 'Wireless Headphones Pro',
    slug: 'wireless-headphones-pro',
    category: 'electronics',
    description: 'Premium wireless headphones with noise cancellation',
    tags: ['headphones', 'wireless', 'audio', 'premium'],
    basePrice: 300,
    discount: 60,
    stock: 25,
    images: [{ url: 'https://via.placeholder.com/300?text=Headphones' }],
    isActive: true,
  },
  {
    name: 'USB-C Cable Fast Charge',
    slug: 'usb-c-cable-fast-charge',
    category: 'electronics',
    description: 'Fast charging USB-C cable 2 meters',
    tags: ['cable', 'usb', 'charging'],
    basePrice: 25,
    discount: 5,
    stock: 100,
    images: [{ url: 'https://via.placeholder.com/300?text=USB+Cable' }],
    isActive: true,
  },
  {
    name: 'Phone Stand Adjustable',
    slug: 'phone-stand-adjustable',
    category: 'electronics',
    description: 'Adjustable phone stand for all devices',
    tags: ['stand', 'phone', 'adjustable'],
    basePrice: 45,
    discount: 10,
    stock: 50,
    images: [{ url: 'https://via.placeholder.com/300?text=Phone+Stand' }],
    isActive: true,
  },
  {
    name: 'Portable Power Bank 20000mAh',
    slug: 'power-bank-20000',
    category: 'electronics',
    description: 'High capacity portable power bank',
    tags: ['powerbank', 'battery', 'portable'],
    basePrice: 60,
    discount: 12,
    stock: 40,
    images: [{ url: 'https://via.placeholder.com/300?text=Power+Bank' }],
    isActive: true,
  },
  {
    name: 'Screen Protector Glass',
    slug: 'screen-protector-glass',
    category: 'electronics',
    description: 'Tempered glass screen protector',
    tags: ['screen', 'protector', 'glass'],
    basePrice: 15,
    discount: 2,
    stock: 150,
    images: [{ url: 'https://via.placeholder.com/300?text=Screen+Protector' }],
    isActive: true,
  },

  // === FASHION (Clothing items) ===
  {
    name: 'Premium Cotton T-Shirt',
    slug: 'premium-cotton-tshirt',
    category: 'fashion',
    description: '100% organic cotton t-shirt, comfortable and breathable',
    tags: ['shirt', 'cotton', 'mens', 'organic'],
    basePrice: 40,
    discount: 8,
    stock: 80,
    images: [{ url: 'https://via.placeholder.com/300?text=T-Shirt' }],
    isActive: true,
  },
  {
    name: 'Classic Denim Jeans',
    slug: 'classic-denim-jeans',
    category: 'fashion',
    description: 'Classic fit denim jeans perfect for casual wear',
    tags: ['jeans', 'denim', 'mens', 'casual'],
    basePrice: 90,
    discount: 15,
    stock: 40,
    images: [{ url: 'https://via.placeholder.com/300?text=Jeans' }],
    isActive: true,
  },
  {
    name: 'Leather Jacket Black',
    slug: 'leather-jacket-black',
    category: 'fashion',
    description: 'Premium black leather jacket for style',
    tags: ['jacket', 'leather', 'mens', 'premium'],
    basePrice: 350,
    discount: 70,
    stock: 12,
    images: [{ url: 'https://via.placeholder.com/300?text=Jacket' }],
    isActive: true,
  },
  {
    name: 'Summer Dress Floral',
    slug: 'summer-dress-floral',
    category: 'fashion',
    description: 'Light and comfortable summer dress with floral pattern',
    tags: ['dress', 'summer', 'womens', 'floral'],
    basePrice: 70,
    discount: 14,
    stock: 30,
    images: [{ url: 'https://via.placeholder.com/300?text=Summer+Dress' }],
    isActive: true,
  },
  {
    name: 'Sports Sneakers',
    slug: 'sports-sneakers',
    category: 'fashion',
    description: 'Comfortable sports sneakers for running',
    tags: ['shoes', 'sneakers', 'sports', 'running'],
    basePrice: 120,
    discount: 24,
    stock: 50,
    images: [{ url: 'https://via.placeholder.com/300?text=Sneakers' }],
    isActive: true,
  },

  // === HOME & DECOR ===
  {
    name: 'Wooden Table Lamp',
    slug: 'wooden-table-lamp',
    category: 'home',
    description: 'Beautiful wooden lamp perfect for bedroom or living room',
    tags: ['lamp', 'wood', 'decor', 'lighting'],
    basePrice: 120,
    discount: 24,
    stock: 18,
    images: [{ url: 'https://via.placeholder.com/300?text=Lamp' }],
    isActive: true,
  },
  {
    name: 'Minimalist Wall Clock',
    slug: 'minimalist-wall-clock',
    category: 'home',
    description: 'Modern minimalist wall clock for any room',
    tags: ['clock', 'wall', 'decor', 'modern'],
    basePrice: 65,
    discount: 13,
    stock: 25,
    images: [{ url: 'https://via.placeholder.com/300?text=Clock' }],
    isActive: true,
  },
  {
    name: 'Throw Pillow Set',
    slug: 'throw-pillow-set',
    category: 'home',
    description: 'Comfortable throw pillow set (pack of 2)',
    tags: ['pillow', 'cushion', 'decor'],
    basePrice: 60,
    discount: 12,
    stock: 60,
    images: [{ url: 'https://via.placeholder.com/300?text=Pillow' }],
    isActive: true,
  },
  {
    name: 'Area Rug Wool',
    slug: 'area-rug-wool',
    category: 'home',
    description: 'Premium wool area rug (5x7 feet)',
    tags: ['rug', 'wool', 'decor', 'floor'],
    basePrice: 250,
    discount: 50,
    stock: 10,
    images: [{ url: 'https://via.placeholder.com/300?text=Rug' }],
    isActive: true,
  },
  {
    name: 'Ceramic Vase Set',
    slug: 'ceramic-vase-set',
    category: 'home',
    description: 'Handcrafted ceramic vase set (3 pieces)',
    tags: ['vase', 'ceramic', 'decor', 'art'],
    basePrice: 85,
    discount: 17,
    stock: 20,
    images: [{ url: 'https://via.placeholder.com/300?text=Vase' }],
    isActive: true,
  },

  // === BOOKS ===
  {
    name: 'JavaScript Advanced Guide',
    slug: 'javascript-advanced-guide',
    category: 'books',
    description: 'Comprehensive guide to advanced JavaScript concepts',
    tags: ['javascript', 'programming', 'education', 'tech'],
    basePrice: 45,
    discount: 9,
    stock: 35,
    images: [{ url: 'https://via.placeholder.com/300?text=JS+Book' }],
    isActive: true,
  },
  {
    name: 'The Art of Code',
    slug: 'art-of-code',
    category: 'books',
    description: 'Learn software design patterns and best practices',
    tags: ['programming', 'design', 'education', 'tech'],
    basePrice: 55,
    discount: 11,
    stock: 20,
    images: [{ url: 'https://via.placeholder.com/300?text=Code+Book' }],
    isActive: true,
  },

  // === INACTIVE PRODUCT (for testing) ===
  {
    name: 'Discontinued Item',
    slug: 'discontinued-item',
    category: 'electronics',
    description: 'This product is no longer available',
    tags: ['discontinued'],
    basePrice: 100,
    discount: 0,
    stock: 0,
    images: [{ url: 'https://via.placeholder.com/300?text=Discontinued' }],
    isActive: false,
  },
];

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // Clear existing products
    const deleted = await Product.deleteMany({});
    console.log(`✓ Cleared ${deleted.deletedCount} existing products`);

    // Calculate finalPrice for each item before insertion
    const processedData = SEED_DATA.map((item) => ({
      ...item,
      finalPrice: calculateFinalPrice(item.basePrice, item.discount),
      inStock: item.stock > 0,
    }));

    // Insert all documents at once
    const inserted = await Product.insertMany(processedData);
    console.log(`✓ Seeded ${inserted.length} products successfully`);

    // Display summary
    const summary = {};
    inserted.forEach((product) => {
      summary[product.category] = (summary[product.category] || 0) + 1;
    });
    console.log('\nCategory breakdown:');
    Object.entries(summary).forEach(([category, count]) => {
      console.log(`  - ${category}: ${count} products`);
    });

    console.log('\n✓ Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('✗ Seed error:', err.message);
    process.exit(1);
  }
}

seedDB();
