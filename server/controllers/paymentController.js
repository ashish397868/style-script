// controllers/paymentController.js
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const Order = require("../models/Order");

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
    const receipt = "order_" + uuidv4();

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

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      receipt, // your internal orderId
    } = req.body;

    // 1️⃣ Basic validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !receipt) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 2️⃣ Fetch your order by internal orderId (receipt)
    const order = await Order.findOne({ orderId: receipt });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 3️⃣ Verify Razorpay Signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // 4️⃣ Fetch payment from Razorpay (double-check)
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    const paidAmount = payment.amount / 100; // convert paise → ₹

    // 5️⃣ Update order with confirmed amount & status
    order.status = "Paid";
    order.amount = paidAmount;
    order.paymentInfo = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    };

    await order.save();

    return res.json({ success: true, message: "Payment verified successfully", order });
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