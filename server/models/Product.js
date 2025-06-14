const { Schema, model } = mongoose;

const ProductSchema = new Schema(
  {
    price: { type: Number, required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    images: { type: [String], default: [] },
    category: { type: String, required: true, index: true },
    brand: { type: String, index: true },
    size: { type: String, index: true },
    color: { type: String, index: true },
    tags: [String],
    availableQty: { type: Number, required: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = model("Product", ProductSchema);
