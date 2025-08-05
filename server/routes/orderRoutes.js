// routes/orderRoutes.js
const express = require("express");
const router  = express.Router();
const { authenticateUser, isAdmin } = require("../middlewares/authMiddleware");
const {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    updateOrder,
    getAllOrders,
    deleteOrder
} = require("../controllers/orderController");

// Order creation 
router.post("/", authenticateUser, createOrder);

// Customer routes
router.get("/my", authenticateUser, getMyOrders);
router.get("/:id", authenticateUser, getOrderById);
router.patch("/:id/cancel", authenticateUser, cancelOrder);

// Admin routes
router.get("/", authenticateUser, isAdmin, getAllOrders);
router.patch("/:id", authenticateUser, isAdmin, updateOrder);
router.delete("/:id", authenticateUser, isAdmin, deleteOrder);

module.exports = router;
