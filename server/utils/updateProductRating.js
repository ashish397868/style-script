// utils/updateProductRating.js
const Review = require("../models/Review");
const Product = require("../models/Product");

const updateProductRating = async (productId) => {
  const stats = await Review.getAverageRating(productId);
  await Product.findByIdAndUpdate(productId, {
    averageRating: stats.averageRating,
    reviewCount: stats.totalReviews,
  });
};

module.exports = updateProductRating;
