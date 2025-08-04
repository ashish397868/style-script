const express = require("express");
const router  = express.Router();
const { authenticateUser, isAdmin } = require("../middlewares/authMiddleware");
const {
  createReview,
  getReviewsForProduct,
  getReviewById,
  updateReview,
  deleteReview,
  getAllReviews,
} = require("../controllers/reviewController");

// Public
router.get("/product/:productId", getReviewsForProduct);

// **Admin-only**
router.get("/all", authenticateUser, isAdmin, getAllReviews);

// Now the single-ID route
router.get("/:id", getReviewById);

// Protected (user must be logged in)
router.post("/", authenticateUser, createReview);
router.patch("/:id", authenticateUser, updateReview);
router.delete("/:id", authenticateUser, deleteReview);

module.exports = router;
