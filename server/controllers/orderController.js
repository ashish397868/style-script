// controllers/orderController.js
const Order = require("../models/Order");
const Product = require("../models/Product");

// Create a new order (customer)
exports.createOrder = async (req, res) => {
  try {
    let { email, name, orderId, paymentInfo, products, phone, address, amount } = req.body;

    // Basic validation
    if (!email || !name || !orderId || !products || products.length === 0 || !phone || !amount || !address) {
      return res.status(400).json({ message: "Missing required fields or address." });
    }

    const exists = await Order.findOne({ orderId });
    if (exists) {
      return res.status(400).json({ message: "Duplicate orderId." });
    }

    // Store productId reference for each product
    // For each product, fetch the first image and store it in the order
    products = await Promise.all(products.map(async (product) => {
      let productId = product._id || product.productId;
      let image = product.image || "";
      if (!image && productId) {
        const dbProduct = await Product.findById(productId).select("images");
        image = dbProduct?.images?.[0] || "";
      }
      return {
        productId,
        image,
        quantity: product.quantity || 1,
        price: product.price,
        size: product.size,
        color: product.color,
        name: product.name
      };
    }));

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
        name: address.name,
        phone: address.phone,
        country: address.country || "India",
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        pincode: address.pincode
      },
      amount,
    });

    return res.status(201).json({ message: "Order placed.", order });
  } catch (err) {
    console.error("createOrder error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get a single order by ID (customer or admin)
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate("userId", "name email")
      .populate("products.productId", "images title slug");
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    // Only owner can view
    if (!order.userId?._id.equals(req.user._id)) {
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
    const orders = await Order.find({ userId: req.user._id })
      .populate('products.productId', 'images title slug')
      .sort({ createdAt: -1 });
    return res.json(orders);
  } catch (err) {
    console.error("getMyOrders error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    return res.json(orders);
  } catch (err) {
    console.error("getAllOrders error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update order status or deliveryStatus (admin)
exports.updateOrder = async (req, res) => {
  try {
    console.log("updateOrder called with ID:", req.params.id);
    console.log("updateOrder body:", req.body);
    
    const { id } = req.params;
    const { status, deliveryStatus, shippingProvider, trackingId, cancellationReason } = req.body;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid order ID format." });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    console.log("Current order found:", order.orderId);

    // Create update object
    const updateData = {};
    if (status) {
      // Validate status enum
      const validStatuses = ["Initiated", "Processing", "Paid", "Failed", "Cancelled"];
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

    console.log("Update data:", updateData);

    // Use findByIdAndUpdate without runValidators for partial updates
    const updatedOrder = await Order.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    );

    console.log("Order updated successfully");
    return res.json({ message: "Order updated.", order: updatedOrder });
  } catch (err) {
    console.error("updateOrder error details:", err);
    
    // Handle specific mongoose errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: "Validation error", errors });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({ message: "Invalid data format." });
    }
    
    return res.status(500).json({ 
      message: "Server error", 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
};

// Cancel an order (customer, if not already shipped/paid)
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    if (!order.userId.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized." });
    }
    if (["shipped", "out for delivery", "delivered"].includes(order.deliveryStatus)) {
      return res.status(400).json({ message: "Cannot cancel at this stage." });
    }
    
    order.status = "Cancelled";
    order.deliveryStatus = "returned";
    if (cancellationReason) {
      order.cancellationReason = cancellationReason;
    }
    
    await order.save();
    return res.json({ message: "Order cancelled.", order });
  } catch (err) {
    console.error("cancelOrder error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete an order (admin)
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    return res.json({ message: "Order deleted." });
  } catch (err) {
    console.error("deleteOrder error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};