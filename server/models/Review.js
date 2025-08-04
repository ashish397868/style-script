const { Schema, model } = require("mongoose");

const ReviewSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    //********** Not Using this below two fields*******************
    // helpfulVotes: { type: Number, default: 0 },  
    // isApproved: { type: Boolean, default: true }, // For admin moderation
  },
  { timestamps: true }
);

ReviewSchema.index({ createdAt: -1 });
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true }); //// One review per user per product, this will prevent spam

// function to calculate average rating  note :- Jab poore model ka data access ya process karna ho then we use statics
ReviewSchema.statics.getAverageRating = async function (productId) {
  const reviews = await this.find({ productId });

  if (reviews.length === 0) {
    return { averageRating: 0, totalReviews: 0 };
  }

  const total = reviews.reduce((acc, review) => acc + review.rating, 0);
  const avg = total / reviews.length;

  return {
    averageRating: parseFloat(avg.toFixed(1)), // e.g. 4.3
    totalReviews: reviews.length,
  };
};


module.exports = model("Review", ReviewSchema);
