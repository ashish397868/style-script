// controllers/paymentController.js
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const sendEmail = require("../utils/sendEmail");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1️⃣ Create a Razorpay order
// POST /api/payments/create
exports.createPaymentOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;
    if (!amount || !receipt) {
      return res.status(400).json({ message: "Amount and receipt are required" });
    }

    // Razorpay expects amount in paise (1 INR = 100 paise)
    const options = {
      amount: amount * 100,
      currency,
      receipt, // your internal orderId, e.g. "order_ABC123"
    };

    const razorOrder = await razorpay.orders.create(options);
    return res.json(razorOrder);
  } catch (error) {
    console.error("Create Payment Order Error:", error);
    return res.status(500).json({ message: "Failed to create Razorpay order" });
  }
};

// 2️⃣ Verify payment and update your Order
// POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId, // your internal orderId (receipt)
      email, // to send payment confirmation
    } = req.body;

    // 1. Recompute signature
    const generatedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // 2. Mark your Order as paid
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = "Paid";
    order.paymentInfo = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    };
    await order.save();

    // 3. Send confirmation email
    await sendEmail({
      to: email,
      subject: `Payment Received for Order ${orderId}`,
      html: `
        <h2>Thank you for your purchase!</h2>
        <p>Your payment for <strong>Order ${orderId}</strong> of amount <strong>₹${order.amount}</strong> has been received successfully.</p>
        <p>We’re now processing your order and will notify you once it’s shipped.</p>
        <p>You can view your order details in your account dashboard.</p>
        <br/>
        <p>Happy Shopping,<br/><strong>ScriptStyle Team</strong></p>
      `,
    });

    return res.json({ success: true, message: "Payment verified and order updated", order });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    return res.status(500).json({ message: "Payment verification failed" });
  }
};
