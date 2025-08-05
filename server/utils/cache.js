// utils/cache.js
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 * 5 }); // 5 minutes

const invalidateReviewCache = (productId) => {
  cache.del("all-reviews");
  if (productId) {
    cache.del(`reviews-product-${productId}`);
  }
};

// Invalidate cache for products
const invalidateProductCache = () => {
  const keys = cache.keys();
  const productKeys = keys.filter((k) => k.startsWith("product:")); // strict prefix
  productKeys.forEach((key) => cache.del(key));
  console.log("❌ Product cache invalidated:", productKeys);
};

module.exports = { cache, invalidateReviewCache , invalidateProductCache};