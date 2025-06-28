const { Schema, model } = require("mongoose");

const OrderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    email: { type: String, required: true },
    name: { type: String, required: true },
    orderId: { type: String, required: true },
    paymentInfo: { type: Object, required: true },// reference to the Address, for live updates if needed
    products: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
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
  },
  { timestamps: true }
);

OrderSchema.index({ orderId: 1 }, { unique: true });

module.exports = model("Order", OrderSchema);
