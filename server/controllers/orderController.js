// controllers/orderController.js
const Order = require("../models/Order");
const Product = require("../models/Product");
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 60 * 60 * 24 }); // 1 day

// Create a new order (customer)
exports.createOrder = async (req, res) => {
  try {
    let { email, name, orderId, paymentInfo, products, phone, address } = req.body;

    // Basic validation
    if (!email || !name || !orderId || !products?.length || !phone || !address) {
      return res.status(400).json({ message: "Missing required fields or address." });
    }

    const exists = await Order.exists({ orderId });
    if (exists) {
      return res.status(400).json({ message: "Duplicate orderId." });
    }

    let totalAmount = 0;

    const updatedProducts = await Promise.all(
      products.map(async (item) => {
        const productId = item._id || item.productId;
        const { size, color, quantity = 1 } = item;

        if (!productId || !size || !color || quantity <= 0) {
          throw new Error("Invalid product item data");
        }

        const dbProduct = await Product.findById(productId).lean();
        if (!dbProduct) throw new Error(`Product not found for ID ${productId}`);

        const variant = dbProduct.variants.find(
          (v) =>
            v.size === size.toUpperCase().trim() &&
            v.color === color.toLowerCase().trim()
        );
        if (!variant) throw new Error(`Variant not found for ${size} / ${color}`);

        if (quantity > variant.availableQty) {
          throw new Error(`Insufficient stock for ${size} / ${color}`);
        }

        const subTotal = variant.price * quantity;
        totalAmount += subTotal;

        return {
          productId,
          name: dbProduct.title,
          image: variant.images?.[0] || dbProduct.images?.[0] || "",
          size: variant.size,
          color: variant.color,
          quantity,
          price: variant.price,
        };
      })
    );

    const userId = req.user?._id || null;

    const order = await Order.create({
      userId,
      email,
      name,
      orderId,
      paymentInfo: paymentInfo || {},
      products: updatedProducts,
      phone,
      address: { ...address },
      amount: totalAmount, // ✅ trusted amount
    });

    cache.del("admin_order_list");

    return res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error("createOrder error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get a single order by ID (customer )
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .select("orderId products amount status deliveryStatus createdAt userId")
      .populate("userId", "name email")
      .populate("products.productId", "title slug images") // still valid
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Only owner can view their order
    if (order.userId?._id?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized." });
    }

    return res.json(order);
  } catch (err) {
    console.error("getOrderById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get all orders for the logged-in user
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ userId })
      .select("orderId products amount status deliveryStatus createdAt")
      .populate("products.productId", "title slug images")
      .sort({ createdAt: -1 })
      .lean();

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
        deliveryStatus: "cancelled",
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

    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const orders = await Order.find()
      .select("orderId userId email name products amount status deliveryStatus createdAt")
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean();

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
    const {
      status,
      deliveryStatus,
      shippingProvider,
      trackingId,
      cancellationReason = "",
    } = req.body;

    const updateData = {}; // Fields to update

    // Validate and apply status
    if (status) {
      const validStatuses = ["Initiated", "Processing", "Paid", "Failed", "Cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value." });
      }
      updateData.status = status;
    }

    // Validate and apply deliveryStatus
    if (deliveryStatus) {
      const validDeliveryStatuses = ["unshipped", "shipped", "out for delivery", "delivered", "returned", "cancelled"];
      if (!validDeliveryStatuses.includes(deliveryStatus)) {
        return res.status(400).json({ message: "Invalid delivery status value." });
      }
      updateData.deliveryStatus = deliveryStatus;
    }

    if (shippingProvider !== undefined) updateData.shippingProvider = shippingProvider;
    if (trackingId !== undefined) updateData.trackingId = trackingId;
    if (cancellationReason) updateData.cancellationReason = cancellationReason;

    // Update order
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