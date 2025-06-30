const { Schema, model } = require("mongoose");

const OrderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    email: { type: String, required: true },
    name: { type: String, required: true },
    orderId: { type: String, required: true },
    paymentInfo: {
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,
  },
    products: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
        image: { type: String }, // Store first image of product at order time
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        size: { type: String },
        color: { type: String },
      },
    ],
    phone: { type: String, required: true },
    address: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      country: { type: String, default: "India" }, // default to India
      addressLine1: { type: String, default: "" },
      addressLine2: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Initiated", "Processing", "Paid", "Failed", "Cancelled"],
      default: "Initiated",
    },
    deliveryStatus: {
      type: String,
      enum: ["unshipped", "shipped", "out for delivery", "delivered", "returned"],
      default: "unshipped",
    },
    shippingProvider: { type: String, default: "" }, // e.g., Shiprocket, Delhivery
    trackingId: { type: String, default: "" }, // for tracking deliveries
    cancellationReason: { type: String, default: "" }, // reason for cancellation
  },
  { timestamps: true }
);

OrderSchema.index({ orderId: 1 }, { unique: true });

module.exports = model("Order", OrderSchema);
