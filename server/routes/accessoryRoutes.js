const express = require("express");
const router = express.Router();

const {createAccessory,getAccessoriesByCategory,getAccessoryBySlug} = require("../controllers/accessoryController");

const { authenticateUser, isAdmin } = require("../middlewares/authMiddleware");

router.get("/category/:category", getAccessoriesByCategory);
router.get("/slug/:slug", getAccessoryBySlug);

// ADMIN
router.post("/", authenticateUser, isAdmin, createAccessory);

module.exports = router;