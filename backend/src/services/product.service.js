const Product = require('../models/Product.model');

/**
 * Fetch paginated products with optional category filter and sorting.
 * Sorting options: price_asc, price_desc, newest (default).
 */
async function getProducts({ page = 1, limit = 10, category, sort = 'newest' }) {
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

  const filter = {};
  if (category) {
    filter.category = category;
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

module.exports = {
  getProducts,
  getProductBySlug,
};
