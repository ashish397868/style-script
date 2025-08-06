// controllers/paymentController.js
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const Order = require("../models/Order");
const Product = require("../models/Product");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1️⃣ Simplified Razorpay Order Creation
exports.createPaymentOrder = async (req, res) => {
  try {
    const { amount, currency = "INR" } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    // Generate unique internal orderId (receipt)
    const receipt = uuidv4().slice(0, 20); // max 40 chars, 20 is enough

    // Create Razorpay Order
    const razorOrder = await razorpay.orders.create({
      amount: amount * 100, // ₹ → paise
      currency,
      receipt,
    });

    return res.json({
      success: true,
      razorpayOrder: {
        id: razorOrder.id,
        amount: razorOrder.amount,
        currency: razorOrder.currency,
      },
      receipt,
    });
  } catch (err) {
    console.error("createPaymentOrder error:", err);
    return res.status(500).json({ message: "Server error while creating payment order" });
  }
};

// Verify Payment
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      receipt,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !receipt) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const order = await Order.findOne({ orderId: receipt });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    const paidAmount = payment.amount / 100;

    // ✅ 1. Update Order Info
    order.status = "Paid";
    order.amount = paidAmount;
    order.paymentInfo = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    };

    await order.save();

    // ✅ 2. Decrement stock for each product variant
    for (let item of order.products) {
      const { productId, variantId, qty } = item;

      const product = await Product.findOne({
        _id: productId,
        "variants._id": variantId,
      });

      if (!product) continue; // product not found (edge case)

      const variant = product.variants.id(variantId);
      if (!variant) continue; // variant not found (edge case)

      if (variant.availableQty >= qty) {
        variant.availableQty -= qty;
      } else {
        console.warn(`⚠️ Not enough stock for variant ${variantId}`);
      }

      await product.save(); // save after update
    }

    return res.json({
      success: true,
      message: "Payment verified & stock updated",
      order,
    });
  } catch (err) {
    console.error("verifyPayment error:", err);
    return res.status(500).json({ message: "Payment verification failed", error: err.message });
  }
};


/**
  ❗ Important Notes:
  .find() sirf pehla matching item return karta hai

  Agar multiple items match karte ho, sirf pehla milega

  return karta hai pura object/value, not just true/false (woh filter() karta hai)
 */