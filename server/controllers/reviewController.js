// controllers/reviewController.js
const Review = require("../models/Review");
const { cache, invalidateReviewCache } = require("../utils/cache");
const updateProductRating = require("../utils/updateProductRating");

// Create a new review (authenticated users)
exports.createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!productId || rating == null) {
      return res.status(400).json({ message: "productId and rating are required" });
    }

    if (rating != null && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: "Invalid rating" });
    }

    //prevent duplicate reviews by same user
    const existing = await Review.exists({ productId, userId });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    const review = await Review.create({ productId, userId, rating, comment });

    await updateProductRating(productId);
    invalidateReviewCache(productId);

    return res.status(201).json({ message: "Review created", review });
  } catch (err) {
    console.error("createReview error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get a single review by ID (public)
exports.getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id).populate("userId", "name").lean();

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.json(review);
  } catch (err) {
    console.error("getReviewById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update a review (owner only)
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (!review.userId.equals(userId)) {
      // .equals() is built into Mongoose (via BSON ObjectId) , in this === not works because In Mongoose, review.userId is usually a MongoDB ObjectId (ObjectId("...")), not a plain string.
      return res.status(403).json({ message: "Not authorized" });
    }

    if (rating != null && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: "Invalid rating" });
    }

    if (rating != null) review.rating = rating;
    if (comment != null) review.comment = comment;

    await review.save();

    await updateProductRating(review.productId);
    invalidateReviewCache(review.productId);

    return res.json({ message: "Review updated", review });
  } catch (err) {
    console.error("updateReview error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete a review (owner or admin)
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Only allow if user is the review owner OR an admin
    if (!review.userId.equals(userId) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Review.findByIdAndDelete(id);

    await updateProductRating(review.productId);
    invalidateReviewCache(review.productId);

    return res.json({ message: "Review deleted" });
  } catch (err) {
    console.error("deleteReview error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get all reviews for a product (public)
exports.getReviewsForProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const cacheKey = `reviews-product-${productId}`;

    // Try cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const reviews = await Review.find({ productId }).populate("userId", "name").sort({ createdAt: -1 }).lean();

    cache.set(cacheKey, reviews);

    return res.json(reviews);
  } catch (err) {
    console.error("getReviewsForProduct error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Admin: get all reviews (admin)
exports.getAllReviews = async (req, res) => {
  try {
    const cacheKey = "all-reviews";

    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const reviews = await Review.find().populate("userId", "name email").populate("productId", "title slug").sort({ createdAt: -1 }).lean();

    cache.set(cacheKey, reviews); // Cache the result
    return res.json(reviews);
  } catch (err) {
    console.error("getAllReviews error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
