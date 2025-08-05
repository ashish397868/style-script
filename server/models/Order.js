const { Schema, model } = require("mongoose");

const OrderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    orderId: { type: String, required: true, trim: true, unique: true },
    paymentInfo: {
      razorpay_order_id: String,
      razorpay_payment_id: String,
      razorpay_signature: String,
    },
    products: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
        sku:{ type: String },
        image: { type: String }, // Store first image of product at order time
        name: { type: String, required: true, trim: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        size: { type: String, trim: true, uppercase: true },
        color: { type: String, trim: true, lowercase: true },
      },
    ],
    phone: { type: String, required: true, trim: true },
    address: {
      name: { type: String, default: "", trim: true },
      phone: { type: String, default: "", trim: true },
      country: { type: String, default: "India", trim: true }, // default to India
      addressLine1: { type: String, default: "", trim: true },
      addressLine2: { type: String, default: "", trim: true },
      city: { type: String, default: "", trim: true },
      state: { type: String, default: "", trim: true },
      pincode: { type: String, default: "", trim: true },
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
    shippingProvider: { type: String, default: "", trim: true }, // e.g., Shiprocket, Delhivery
    trackingId: { type: String, default: "", trim: true }, // for tracking deliveries
    cancellationReason: { type: String, default: "", trim: true }, // reason for cancellation
  },
  { timestamps: true }
);

OrderSchema.index({ userId: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1 }); // MongoDB internally organizes the index like: Cancelled → Initiated → Paid → Processing

module.exports = model("Order", OrderSchema);
