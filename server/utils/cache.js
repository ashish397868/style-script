// utils/cache.js
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 * 5 }); // 5 minutes

const invalidateReviewCache = (productId) => {
  cache.del("all-reviews");
  if (productId) {
    cache.del(`reviews-product-${productId}`);
  }
};

module.exports = { cache, invalidateReviewCache };
