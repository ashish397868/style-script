const express = require("express");
const multer = require("multer");
const uploadCsv = multer({ dest: "tmp/csv/" }).single("file");
const router = express.Router();
const { importCSV, createMultipleProducts } = require("../controllers/bulkUploadController");
const { authenticateUser, isAdmin } = require("../middlewares/authMiddleware");

router.post("/multiple", authenticateUser, isAdmin, createMultipleProducts);

//Advanced
router.post("/import", authenticateUser, isAdmin, uploadCsv, importCSV);

module.exports = router;