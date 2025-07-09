const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const sendEmail = require("../utils/sendEmail");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1️⃣ Create a Razorpay order
exports.createPaymentOrder = async (req, res) => {
  try {
    const { amount, currency = "INR" } = req.body;
    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    // generate your own internal order ID (receipt)
    const receiptId = "order_" + Date.now();

    // Razorpay expects amount in paise
    const options = {
      amount: amount * 100, //paise
      currency,
      receipt: receiptId,
    };

    const razorOrder = await razorpay.orders.create(options);

    // return both DB order and Razorpay order
    res.json({
      success: true,
      order: {
        id: razorOrder.id,
        amount: razorOrder.amount,
        currency: razorOrder.currency,
      },
      receipt: receiptId,
    });
  } catch (error) {
    console.error("Create Payment Order Error:", error);
    res.status(500).json({ message: "Failed to create Razorpay order" });
  }
};

// 2️⃣ Verify payment and update your Order
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      receipt, // your internal orderId
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !receipt) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1. Recompute signature
    const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Unauthorized payment attempt" });
    }

    // 2. Find & update your Order
    const order = await Order.findOneAndUpdate(
      { orderId: receipt },
      {
        status: "Paid",
        paymentInfo: { razorpay_order_id, razorpay_payment_id, razorpay_signature },
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 3. Send confirmation email (optional)
    setImmediate(()=>{
      sendEmail({
          to: req.user.email,
          subject: `Payment Received for ${receipt}`,
          html: `
            <h2>Thank you for your purchase!</h2>
            <p>Your payment for <strong>Order ${receipt}</strong> of amount <strong>₹${order.amount}</strong> has been received successfully.</p>
            <p>We’re now processing your order and will notify you once it’s shipped.</p>
            <br/>
            <p>Happy Shopping,<br/><strong>ScriptStyle Team</strong></p>
          `,
        })
    })

    res.json({ success: true, message: "Payment verified and order updated", order });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ message: "Payment verification failed" });
  }
};