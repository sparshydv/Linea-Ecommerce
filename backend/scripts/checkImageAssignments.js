require('dotenv').config();

const fs = require('fs');
const mongoose = require('mongoose');
const Product = require('../src/models/Product.model');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const docs = await Product.find({ isActive: true }, { name: 1, category: 1, images: 1 }).lean();
  const urls = docs.map((d) => d.images?.[0]?.url).filter(Boolean);
  const uniqueUrls = Array.from(new Set(urls));

  const lines = [];
  lines.push(`TOTAL=${docs.length}`);
  lines.push(`WITH_IMAGE=${urls.length}`);
  lines.push(`UNIQUE_URLS=${uniqueUrls.length}`);
  lines.push('SAMPLE_START');

  for (const d of docs.slice(0, 20)) {
    lines.push(`${d.category}|${d.name}|${d.images?.[0]?.url || 'NO_IMAGE'}`);
  }

  lines.push('UNIQUE_SAMPLE_START');
  for (const url of uniqueUrls.slice(0, 20)) {
    lines.push(url);
  }

  fs.writeFileSync('scripts/image-db-check.txt', lines.join('\n'), 'utf8');
  await mongoose.connection.close();
}

run().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.connection.close();
  } catch {
    // noop
  }
  process.exit(1);
});
