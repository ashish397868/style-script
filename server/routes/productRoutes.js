// routes/productRoutes.js
const express = require("express");
const multer = require("multer");
const uploadCsv = multer({ dest: "tmp/csv/" }).single("file");
const { importCSV } = require("../controllers/bulkUploadController");
const router = express.Router();
const {
    getAllProducts,getFeaturedProducts,getProductBySlug,getProductById,
    createProduct, updateProduct, deleteProduct,getRelatedProducts,getProducts
} = require("../controllers/productController");
const { authenticateUser, isAdmin } = require("../middlewares/authMiddleware");

// PUBLIC
router.get("/", getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id", getProductById);
router.get("/:id/related", getRelatedProducts);
router.get("/search", getProducts);


// ADMIN
router.post("/", authenticateUser, isAdmin, createProduct);
router.put("/:id", authenticateUser, isAdmin, updateProduct);
router.delete("/:id", authenticateUser, isAdmin, deleteProduct);

//Advanced
router.post("/products/import", authenticateUser, isAdmin, uploadCsv, importCSV);

module.exports = router;
