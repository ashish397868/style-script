const { Schema, model } = require("mongoose");

const ReviewSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product" },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
}, { timestamps: true });

ReviewSchema.index({ createdAt: -1 });
ReviewSchema.index({ productId: 1 });
ReviewSchema.index({ userId: 1 });

module.exports = model("Review", ReviewSchema);