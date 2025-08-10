const { Schema, model } = require("mongoose");

const VariantSchema = new Schema({
  size: { type: String, trim: true, uppercase: true, default: "FREE" },
  color: { type: String, trim: true, lowercase: true },
  price: { type: Number, required: true },
  availableQty: { type: Number, required: true },
  sku: { type: String, unique: true, trim: true },
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
    images: { type: [String], default: [] },
    tags: [{ type: String, trim: true, lowercase: true }],
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },

    // ✅ Audience targeting
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

    // ✅ Extra metadata/specifications
    specifications: {
      type: Map,
      of: String,
      default: {},
    },

    variants: [VariantSchema],
  },
  { timestamps: true }
);

// ✅ Full-text search index
AccessoryProductSchema.index({ title: "text", description: "text", tags: "text" });

module.exports = model("AccessoryProduct", AccessoryProductSchema);
