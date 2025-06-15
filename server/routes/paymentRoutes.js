// routes/paymentRoutes.js
const express = require("express");
const router  = express.Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const {createPaymentOrder,verifyPayment} = require("../controllers/paymentController");

// 1. Create a Razorpay order (must be logged in)
router.post("/create", authenticateUser, createPaymentOrder);

// 2. Verify payment & update your Order
router.post("/verify", authenticateUser, verifyPayment);

module.exports = router;
