const Product = require('../models/Product.model');

/**
 * Build common product filter based on query params
 * Supports: category, price range, new arrivals
 */
function buildProductFilter({ category, minPrice, maxPrice, newArrivals }) {
  const filter = { isActive: true };

  if (category) {
    filter.category = category;
  }

  // Price range filtering (validate numbers)
  if (minPrice || maxPrice) {
    const min = minPrice ? parseFloat(minPrice) : null;
    const max = maxPrice ? parseFloat(maxPrice) : null;
    
    // Only apply filter if values are valid numbers
    if ((min !== null && !isNaN(min)) || (max !== null && !isNaN(max))) {
      filter.finalPrice = {};
      if (min !== null && !isNaN(min)) filter.finalPrice.$gte = min;
      if (max !== null && !isNaN(max)) filter.finalPrice.$lte = max;
    }
  }

  // New arrivals (products created within last X days, default 30)
  if (newArrivals) {
    const daysAgo = parseInt(newArrivals, 10) || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
    filter.createdAt = { $gte: cutoffDate };
  }

  return filter;
}

/**
 * Fetch paginated products with optional category filter and sorting.
 * Sorting options: price_asc, price_desc, newest (default).
 */
async function getProducts({ page = 1, limit = 10, category, minPrice, maxPrice, newArrivals, sort = 'newest' }) {
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

  const filter = buildProductFilter({ category, minPrice, maxPrice, newArrivals });

  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { finalPrice: 1 };
  if (sort === 'price_desc') sortOption = { finalPrice: -1 };
  if (sort === 'newest') sortOption = { createdAt: -1 };

  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

/**
 * Fetch single product by slug.
 */
async function getProductBySlug(slug) {
  if (!slug) return null;
  const product = await Product.findOne({ slug }).lean();
  return product;
}

/**
 * Search products by text query across name and description
 * Supports optional category filter and pagination
 * Backend-driven for performance and data security
 */
async function searchProducts({ q, category, minPrice, maxPrice, newArrivals, page = 1, limit = 10, sort = 'newest' }) {
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

  const filter = buildProductFilter({ category, minPrice, maxPrice, newArrivals });

  // Text search with case-insensitive regex
  if (q && q.trim()) {
    // Normalize spaces: trim and replace multiple spaces with single space
    const normalizedQuery = q.trim().replace(/\s+/g, ' ');
    const searchRegex = new RegExp(normalizedQuery, 'i');
    filter.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { tags: searchRegex },
    ];
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { finalPrice: 1 };
  if (sort === 'price_desc') sortOption = { finalPrice: -1 };
  if (sort === 'newest') sortOption = { createdAt: -1 };

  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
    query: q || '',
  };
}

module.exports = {
  getProducts,
  getProductBySlug,
  searchProducts,
};
