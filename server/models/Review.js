const { Schema, model } = require("mongoose");

const ReviewSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product" },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
}, { timestamps: true });

module.exports = model("Review", ReviewSchema);