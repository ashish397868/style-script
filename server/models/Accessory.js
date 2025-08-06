const { Schema, model } = require("mongoose");

const VariantSchema = new Schema({
  size: { type: String, trim: true, uppercase: true, default: "FREE" },
  color: { type: String, trim: true, lowercase: true },
  price: { type: Number, required: true },
  availableQty: { type: Number, required: true },
  sku: { type: String, unique: true, trim: true }, // SKU = Stock Keeping Unit
  images: { type: [String], default: [] },
});

const AccessoryProductSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["CAP", "BELT", "WATCH", "KEYCHAIN", "BRACELET"],
      uppercase: true,
    },
    brand: { type: String, trim: true, uppercase: true },
    images: { type: [String], default: [] }, // General product images
    tags: [{ type: String, trim: true, lowercase: true }],
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },

    variants: [VariantSchema], // ✅ Just like garments — size/color/price/etc.
  },
  { timestamps: true }
);

AccessoryProductSchema.index({ title: "text", description: "text", tags: "text" });

module.exports = model("AccessoryProduct", AccessoryProductSchema);


// for future