const { Schema, model } = require("mongoose");;

const ProductSchema = new Schema(
  {
    price: { type: Number, required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    images: { type: [String], default: [] },
    category: { type: String, required: true, index: true , lowercase: true },
    brand: { type: String, index: true, lowercase: true },
    size: { type: String, index: true, lowercase: true },
    color: { type: String, index: true, lowercase: true },
    tags: [String],
    availableQty: { type: Number, required: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);
// 🔍 Create text index for full-text search
ProductSchema.index({ title: "text", description: "text", tags: "text" });

module.exports = model("Product", ProductSchema);
