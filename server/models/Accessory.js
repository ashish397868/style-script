const { Schema, model } = require("mongoose");

const VariantSchema = new Schema({
  size: { type: String, trim: true, uppercase: true, default: "FREE" },
  color: { type: String, trim: true, lowercase: true },
  price: { type: Number, required: true },
  availableQty: { type: Number, required: true },
  sku: { type: String, unique: true, trim: true },
  images: { type: [String], default: [] },
});

const AccessorySchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, required: true, trim: true },
    basePrice: { type: Number },
    maxPrice: { type: Number },
    images: { type: [String], default: [] },
    category: {
      type: String,
      required: true,
      enum: ["CAP", "BELT", "WATCH", "KEYCHAIN", "BRACELET"],
      uppercase: true,
      index: true,
      trim: true,
    },
    brand: { type: String, required: true, trim: true, uppercase: true, index: true },
    theme: { type: String, required: true, uppercase: true, index: true, trim: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    isOutOfStock: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    targetAudience: {
      type: String,
      enum: ["MEN", "WOMEN", "KIDS", "UNISEX"],
      default: "UNISEX",
    },
    ageGroup: {
      type: String,
      enum: ["INFANT", "TODDLER", "CHILD", "TEEN", "ADULT"],
      default: "ADULT",
    },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    variants: [VariantSchema],
  },
  { timestamps: true }
);

AccessorySchema.index({ title: "text", description: "text", tags: "text" });

module.exports = model("Accessory", AccessorySchema);
