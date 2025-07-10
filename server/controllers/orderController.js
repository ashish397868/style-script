// controllers/orderController.js
const Order = require("../models/Order");
const Product = require("../models/Product");
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 60 * 60 * 24 }); // 1 day

// Create a new order (customer)
exports.createOrder = async (req, res) => {
  try {
    let { email, name, orderId, paymentInfo, products, phone, address, amount } = req.body;

    // Basic validation
    if (!email || !name || !orderId || !products || products.length === 0 || !phone || !amount || !address) {
      return res.status(400).json({ message: "Missing required fields or address." });
    }

    const exists = await Order.exists({ orderId });
    if (exists) {
      return res.status(400).json({ message: "Duplicate orderId." });
    }

    products = await Promise.all(
      products.map(async (p) => {
        let productId = p._id || p.productId;
        let image = p.image || "";

        if (!image && productId) {
          const dbProduct = await Product.findById(productId).select("images").lean();
          image = dbProduct?.images?.[0] || "";
        }
        const { quantity = 1, price, size, color, name } = p;
        return { productId, image, quantity, price, size, color, name };
      })
    );

    const userId = req.user?._id || null;
    const order = await Order.create({
      userId,
      email,
      name,
      orderId,
      paymentInfo: paymentInfo || {},
      products,
      phone,
      address: {
        ...address
      },
      amount,
    });

    cache.del("admin_order_list");

    return res.status(201).json({ message: "Order placed.", order });
  } catch (err) {
    console.error("createOrder error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get a single order by ID (customer )
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).select("orderId products amount status deliveryStatus createdAt userId").populate("userId", "name email").populate("products.productId", "images title slug").lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    // Only owner can view
    if (order.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized." });
    }
    return res.json(order);
  } catch (err) {
    console.error("getOrderById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get all orders for the logged-in user - Using Populate
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ userId }).select("orderId products amount status deliveryStatus createdAt").populate("products.productId", "images title slug").sort({ createdAt: -1 }).lean();

    return res.json(orders);
  } catch (err) {
    console.error("getMyOrders error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Cancel an order (customer, if not already shipped)
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason = "" } = req.body;

    const nonCancelableStages = ["shipped", "out for delivery", "delivered"];

    const order = await Order.findOneAndUpdate(
      {
        _id: id,
        userId: req.user._id,
        deliveryStatus: { $nin: nonCancelableStages }, // Only allow cancellation if not shipped/delivered
      },
      {
        status: "Cancelled",
        deliveryStatus: "returned",
        cancellationReason,
      },
      { new: true }
    );

    if (!order) {
      return res.status(400).json({ message: "Order not found or cannot be cancelled." });
    }

    cache.del("admin_order_list");

    return res.json({ message: "Order cancelled.", order });
  } catch (err) {
    console.error("cancelOrder error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const cacheKey = "admin_order_list";

    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const orders = await Order.find().select("orderId userId email name products amount status deliveryStatus createdAt").populate("userId", "name email").sort({ createdAt: -1 }).lean();

    cache.set(cacheKey, orders);
    return res.json(orders);
  } catch (err) {
    console.error("getAllOrders error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update order status or deliveryStatus (admin)
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, deliveryStatus, shippingProvider, trackingId, cancellationReason = " " } = req.body;

    const updateData = {}; // Create update object
    if (status) {
      const validStatuses = ["Initiated", "Processing", "Paid", "Failed", "Cancelled"]; // Validate status enum
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value." });
      }
      updateData.status = status;
    }

    if (deliveryStatus) {
      const validDeliveryStatuses = ["unshipped", "shipped", "out for delivery", "delivered", "returned"];
      if (!validDeliveryStatuses.includes(deliveryStatus)) {
        return res.status(400).json({ message: "Invalid delivery status value." });
      }
      updateData.deliveryStatus = deliveryStatus;
    }

    if (shippingProvider) updateData.shippingProvider = shippingProvider;
    if (trackingId) updateData.trackingId = trackingId;
    if (cancellationReason) updateData.cancellationReason = cancellationReason;

    // Use findByIdAndUpdate without runValidators for partial updates
    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, { new: true }).lean();

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found." });
    }

    cache.del("admin_order_list");

    return res.json({ message: "Order updated.", order: updatedOrder });
  } catch (err) {
    console.error("updateOrder error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete an order (admin)
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id).lean();
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    cache.del("admin_order_list");
    return res.json({ message: "Order deleted." });
  } catch (err) {
    console.error("deleteOrder error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
