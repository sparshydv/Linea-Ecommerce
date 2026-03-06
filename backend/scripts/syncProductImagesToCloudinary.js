require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const cloudinary = require('../src/config/cloudinary');
const Product = require('../src/models/Product.model');

const FALLBACK_IMAGE_URL = 'https://placehold.co/1200x1200/png?text=LINEA+Product';
const CACHE_DIR = path.join(__dirname, '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'image-search-cache.json');
const LOCAL_ASSET_BASE_DIR = path.resolve(__dirname, '../../frontend/remix-of-linea-jewelry');

const LOCAL_IMAGE_POOLS = {
  earrings: [
    'public/earrings-collection.png',
    'src/assets/organic-earring.png',
    'src/assets/eclipse.jpg',
    'src/assets/halo.jpg',
    'src/assets/pantheon.jpg',
  ],
  rings: [
    'public/rings-collection.png',
    'src/assets/shadowline.jpg',
    'src/assets/shadowline-1.jpg',
    'src/assets/lintel.jpg',
    'src/assets/oblique.jpg',
  ],
  necklaces: [
    'src/assets/circular-collection.png',
    'src/assets/hero-image.png',
    'src/assets/founders.png',
  ],
  bracelets: [
    'public/arcus-bracelet.png',
    'public/span-bracelet.png',
    'src/assets/link-bracelet.png',
    'src/assets/circular-collection.png',
  ],
  watches: [
    'src/assets/hero-image.png',
    'src/assets/circular-collection.png',
    'src/assets/founders.png',
  ],
  charms: [
    'src/assets/circular-collection.png',
    'src/assets/link-bracelet.png',
    'src/assets/hero-image.png',
  ],
  general: [
    'src/assets/circular-collection.png',
    'src/assets/hero-image.png',
    'src/assets/founders.png',
  ],
};

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function loadCache() {
  ensureCacheDir();

  if (!fs.existsSync(CACHE_FILE)) {
    return {};
  }

  try {
    const data = fs.readFileSync(CACHE_FILE, 'utf8');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveCache(cache) {
  ensureCacheDir();
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
}

function isCloudinaryUrl(url) {
  return typeof url === 'string' && url.includes('res.cloudinary.com');
}

function hasValidCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return false;
  }

  const placeholderValues = new Set([
    'your_cloud_name',
    'your_api_key',
    'your_api_secret',
  ]);

  return ![
    cloudName,
    apiKey,
    apiSecret,
  ].some((value) => placeholderValues.has(String(value).trim().toLowerCase()));
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function hashString(value) {
  let hash = 0;
  const input = String(value || 'linea-product');
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getProductTypeKeywords(product) {
  const text = `${product.name || ''} ${product.category || ''} ${(product.tags || []).join(' ')}`.toLowerCase();

  if (text.includes('earring')) return ['jewelry', 'earrings', 'product'];
  if (text.includes('ring')) return ['jewelry', 'ring', 'product'];
  if (text.includes('necklace')) return ['jewelry', 'necklace', 'product'];
  if (text.includes('bracelet')) return ['jewelry', 'bracelet', 'product'];
  if (text.includes('watch')) return ['watch', 'luxury', 'product'];
  if (text.includes('charm')) return ['jewelry', 'charm', 'product'];

  return ['jewelry', 'product', 'studio'];
}

function getProductType(product) {
  const text = `${product.name || ''} ${product.category || ''} ${(product.tags || []).join(' ')}`.toLowerCase();

  if (text.includes('earring')) return 'earrings';
  if (text.includes('ring')) return 'rings';
  if (text.includes('necklace')) return 'necklaces';
  if (text.includes('bracelet')) return 'bracelets';
  if (text.includes('watch')) return 'watches';
  if (text.includes('charm')) return 'charms';
  return 'general';
}

function buildFreshExternalCandidates(product, runId) {
  const productTypeKeywords = getProductTypeKeywords(product).join(',');
  const seedBase = `${slugify(product.name || product.slug || String(product._id))}-${product._id}`;
  const unsplashSig = hashString(`${seedBase}-${runId}`).toString();

  return [
    `https://source.unsplash.com/1600x1600/?${encodeURIComponent(productTypeKeywords)}&sig=${unsplashSig}`,
    `https://picsum.photos/seed/${encodeURIComponent(`linea-${seedBase}-${runId}`)}/1600/1600`,
    `https://picsum.photos/seed/${encodeURIComponent(`linea-alt-${seedBase}-${runId}`)}/1600/1600`,
  ];
}

async function validateImageUrl(url, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`request failed: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.toLowerCase().startsWith('image/')) {
      throw new Error(`non-image content type: ${contentType || 'unknown'}`);
    }

    return response.url || url;
  } finally {
    clearTimeout(timeout);
  }
}

async function resolveFreshExternalImageUrl(product, runId, usedSourceUrls) {
  const candidates = buildFreshExternalCandidates(product, runId);

  for (const candidate of candidates) {
    try {
      const resolved = await validateImageUrl(candidate);
      if (!usedSourceUrls.has(resolved)) {
        usedSourceUrls.add(resolved);
        return resolved;
      }
    } catch (error) {
      console.warn(`[WARN] Fresh external image failed for "${product.name}": ${error.message}`);
    }
  }

  return null;
}

function pickLocalImagePath(product) {
  const productType = getProductType(product);
  const pool = LOCAL_IMAGE_POOLS[productType] || LOCAL_IMAGE_POOLS.general;

  const existingPaths = pool
    .map((relativePath) => path.resolve(LOCAL_ASSET_BASE_DIR, relativePath))
    .filter((absolutePath) => fs.existsSync(absolutePath));

  if (!existingPaths.length) {
    return null;
  }

  const index = hashString(`${product.slug || product._id}-${product.name || ''}`) % existingPaths.length;
  return existingPaths[index];
}

function buildSearchQueries(product) {
  const name = product.name || '';
  const category = product.category || '';
  const tags = Array.isArray(product.tags) ? product.tags : [];

  return [
    `${name} ${category} product photography`,
    `${name} jewelry closeup`,
    `${category} luxury product`,
    tags.join(' '),
    name,
    category,
  ].filter(Boolean);
}

async function resolveUnsplashImageUrl(query) {
  const endpoint = `https://source.unsplash.com/1600x1600/?${encodeURIComponent(query)}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Unsplash request failed: ${response.status}`);
    }

    // After redirects, response.url usually points to the final CDN image URL.
    return response.url || endpoint;
  } finally {
    clearTimeout(timeout);
  }
}

async function resolveLoremFlickrImageUrl(product, query) {
  const keywordSet = new Set([
    ...getProductTypeKeywords(product),
    ...String(query || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2),
  ]);

  const keywords = Array.from(keywordSet).slice(0, 4).join(',');
  const lock = hashString(`${product.slug || product._id}-${query}`).toString();
  const endpoint = `https://loremflickr.com/1600/1600/${encodeURIComponent(keywords)}?lock=${lock}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`LoremFlickr request failed: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.toLowerCase().startsWith('image/')) {
      throw new Error(`LoremFlickr returned non-image content type: ${contentType || 'unknown'}`);
    }

    return response.url || endpoint;
  } finally {
    clearTimeout(timeout);
  }
}

async function findBestImageUrl(product, cache, options = {}) {
  const {
    ignoreCache = false,
    preferExternalFresh = false,
    allowExternalFallback = false,
    runId = String(Date.now()),
    usedSourceUrls = new Set(),
  } = options;
  const cacheKey = product.slug || String(product._id);

  if (preferExternalFresh) {
    const freshExternalUrl = await resolveFreshExternalImageUrl(product, runId, usedSourceUrls);
    if (freshExternalUrl) {
      cache[cacheKey] = { sourceUrl: freshExternalUrl, query: 'fresh-external' };
      return freshExternalUrl;
    }
  }

  const localImagePath = pickLocalImagePath(product);
  if (localImagePath) {
    cache[cacheKey] = { sourceUrl: localImagePath, query: 'local-asset' };
    return localImagePath;
  }

  if (!allowExternalFallback) {
    cache[cacheKey] = { sourceUrl: FALLBACK_IMAGE_URL, query: 'fallback' };
    return FALLBACK_IMAGE_URL;
  }

  if (!ignoreCache && cache[cacheKey]?.sourceUrl) {
    return cache[cacheKey].sourceUrl;
  }

  const queries = buildSearchQueries(product);

  for (const query of queries) {
    const queryCacheKey = `query:${query.toLowerCase()}`;

    if (!ignoreCache && cache[queryCacheKey]?.sourceUrl) {
      cache[cacheKey] = { sourceUrl: cache[queryCacheKey].sourceUrl, query };
      return cache[queryCacheKey].sourceUrl;
    }

    try {
      let url = null;

      try {
        url = await resolveLoremFlickrImageUrl(product, query);
      } catch (loremErr) {
        console.warn(`[WARN] LoremFlickr lookup failed for "${query}": ${loremErr.message}`);
      }

      if (!url) {
        try {
          url = await resolveUnsplashImageUrl(query);
        } catch (unsplashErr) {
          console.warn(`[WARN] Unsplash lookup failed for "${query}": ${unsplashErr.message}`);
        }
      }

      if (url && /^https?:\/\//i.test(url)) {
        cache[queryCacheKey] = { sourceUrl: url, query };
        cache[cacheKey] = { sourceUrl: url, query };
        return url;
      }
    } catch (error) {
      console.warn(`[WARN] Source lookup failed for "${query}": ${error.message}`);
    }
  }

  cache[cacheKey] = { sourceUrl: FALLBACK_IMAGE_URL, query: 'fallback' };
  return FALLBACK_IMAGE_URL;
}

async function uploadToCloudinary(imageUrl, product) {
  const folder = 'linea/products';
  const publicId = `${slugify(product.name || product.slug || String(product._id))}-${product._id}`;

  return cloudinary.uploader.upload(imageUrl, {
    folder,
    public_id: publicId,
    overwrite: true,
    resource_type: 'image',
    transformation: [
      { width: 1400, height: 1400, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
  });
}

async function deleteFromCloudinary(publicId) {
  if (!publicId) {
    return;
  }

  await cloudinary.uploader.destroy(publicId, {
    resource_type: 'image',
    invalidate: true,
  });
}

async function syncProductImages() {
  if (!hasValidCloudinaryConfig()) {
    throw new Error('Cloudinary environment variables are missing or using placeholders. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to real values.');
  }

  await connectDB();

  const overwriteCloudinary = process.argv.includes('--overwrite-cloudinary');
  const deleteExisting = process.argv.includes('--delete-existing');
  const freshExternal = process.argv.includes('--fresh-external');
  const allowExternalFallback = process.argv.includes('--allow-external-fallback');
  const runId = String(Date.now());
  const usedSourceUrls = new Set();
  const cache = loadCache();
  const products = await Product.find({ isActive: true });

  if (!products.length) {
    console.log('[INFO] No products found to process.');
    return;
  }

  console.log(`[INFO] Found ${products.length} products. Starting image sync...`);

  let successCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const product of products) {
    try {
      const existingImage = product.images?.[0];

      if (!overwriteCloudinary && isCloudinaryUrl(existingImage?.url)) {
        skippedCount += 1;
        console.log(`[SKIP] ${product.name} already has a Cloudinary image.`);
        continue;
      }

      if (deleteExisting && existingImage?.publicId) {
        await deleteFromCloudinary(existingImage.publicId);
        console.log(`[DEL] ${product.name} removed old image ${existingImage.publicId}`);
      }

      const sourceUrl = await findBestImageUrl(product, cache, {
        ignoreCache: overwriteCloudinary,
        preferExternalFresh: freshExternal,
        allowExternalFallback,
        runId,
        usedSourceUrls,
      });
      const uploadResult = await uploadToCloudinary(sourceUrl, product);

      product.images = [
        {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
        },
      ];

      await product.save();
      const cacheKey = product.slug || String(product._id);
      cache[cacheKey] = {
        sourceUrl,
        cloudinaryUrl: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id,
      };
      saveCache(cache);

      successCount += 1;
      console.log(`[OK] ${product.name} -> ${uploadResult.secure_url}`);

      // Small delay to avoid hitting free-tier limits too aggressively.
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      failedCount += 1;
      console.error(`[FAIL] ${product.name}: ${error.message}`);
    }
  }

  console.log('\n[SUMMARY]');
  console.log(`Processed: ${products.length}`);
  console.log(`Uploaded: ${successCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Failed: ${failedCount}`);
}

(async () => {
  try {
    await syncProductImages();
  } catch (error) {
    console.error(`[FATAL] ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
})();
