const { Schema, model } = require("mongoose");

const VariantSchema = new Schema({
  size: { type: String, required: true, uppercase: true, index: true, trim: true },
  color: { type: String, required: true, lowercase: true, index: true, trim: true },
  price: { type: Number, required: true },
  availableQty: { type: Number, required: true },
  sku: { type: String, unique: true ,trim : true},
  /*  SKU stands for Stock Keeping Unit.
    It’s a unique identifier assigned to each variant of a product (e.g., TSHIRT-M-BLK for a Medium Black T-shirt)
  */
  images: { type: [String], default: [] }, // variant-specific images
});

const ProductSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, required: true ,trim: true},
    basePrice: { type: Number }, // optional, default display
    maxPrice: { type: Number }, // optional,  default display
    images: { type: [String]},
    category: { type: String, required: true, uppercase: true, index: true, trim: true },
    brand: { type: String, required: true, uppercase: true, index: true, trim: true },
    theme: { type: String, required: true, uppercase: true, index: true, trim: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    isOutOfStock: { type: Boolean, default: false },

    variants: [VariantSchema], // ✅ new structure for multiple size/color options
  },
  { timestamps: true }
);

// 🔍 Full-text index
ProductSchema.index({ title: "text", description: "text", tags: "text" });

module.exports = model("Product", ProductSchema);