// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getFeaturedProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getRelatedProducts,
  getProducts,
  getProductsByCategory,
  getProductVariantByTitle,
  getSpecificVariant,
  getProductsByTheme,
} = require("../controllers/productController");
const { authenticateUser, isAdmin } = require("../middlewares/authMiddleware");

// PUBLIC
router.get("/", getAllProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/theme/:theme", getProductsByTheme);
router.get("/featured", getFeaturedProducts);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id", getProductById);
router.get("/:id/related", getRelatedProducts);
router.get("/search", getProducts);
router.get("/variant/:title", getProductVariantByTitle);
router.get("/:id/variants/:variantId", getSpecificVariant);

// ADMIN
router.post("/", authenticateUser, isAdmin, createProduct);
router.put("/:id", authenticateUser, isAdmin, updateProduct);
router.delete("/:id", authenticateUser, isAdmin, deleteProduct);

module.exports = router;
