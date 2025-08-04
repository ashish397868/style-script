// src/pages/components/ProductTabs.jsx
import { useState } from "react";
import ReviewForm from "../ReviewForm";
import ReviewCard from "../ReviewCard";
import { FaStar } from "react-icons/fa";
import { reviewAPI } from "../../services/api";

export default function ProductTabs({ product, reviews, setReviews }) {
  const [activeTab, setActiveTab] = useState("description");
  
  // Calculate average rating
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1) 
    : 0;

  return (
    <div className="mt-16 max-w-4xl mx-auto">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button 
            className={`cursor-pointer py-4 px-1 border-b-2 text-sm font-medium ${
              activeTab === "description" 
                ? "border-pink-500 text-pink-600" 
                : "border-transparent text-gray-500 hover:text-pink-700"
            }`} 
            onClick={() => setActiveTab("description")}
          >
            Description
          </button>
          <button 
            className={`cursor-pointer py-4 px-1 border-b-2 text-sm font-medium ${
              activeTab === "reviews" 
                ? "border-pink-500 text-pink-600" 
                : "border-transparent text-gray-500 hover:text-pink-700"
            }`} 
            onClick={() => setActiveTab("reviews")}
          >
            Reviews ({reviews.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-8">
        {activeTab === "description" ? (
          <div className="prose max-w-none">
            <h3 className="text-xl font-bold mb-4">Product Details</h3>
            <p className="mb-4">{product.description}</p>

            <h3 className="text-xl font-bold mb-4 mt-8">Features</h3>
            <ul className="list-disc pl-5 space-y-2">
              {product.features?.map((feature, index) => 
                <li key={index}>{feature}</li>
              ) || (
                <>
                  <li>High-quality materials for durability</li>
                  <li>Designed for comfort and style</li>
                  <li>Easy to maintain and care for</li>
                  <li>Eco-friendly production process</li>
                </>
              )}
            </ul>
          </div>
        ) : (
          <ReviewSection 
            product={product}
            reviews={reviews}
            setReviews={setReviews}
            avgRating={avgRating}
          />
        )}
      </div>
    </div>
  );
}

import { useCallback } from "react";

function ReviewSection({ product, reviews, setReviews, avgRating }) {
  // Memoized fetchReviews to avoid unnecessary re-renders
  const fetchReviews = useCallback(() => {
    if (!product?._id) return;
    reviewAPI
      .getProductReviews(product._id)
      .then(({ data }) => setReviews(data))
      .catch(console.error);
  }, [product?._id, setReviews]);

  return (
    <div>
      {/* Review Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center">
          <div className="text-center mb-4 md:mb-0 md:mr-8">
            <div className="text-5xl font-bold text-pink-600">{avgRating}</div>
            <div className="flex justify-center mt-2">
              {[...Array(5)].map((_, i) => (
                <FaStar 
                  key={i} 
                  className={
                    i < Math.round(avgRating) 
                      ? "w-5 h-5 text-pink-400 fill-current" 
                      : "w-5 h-5 text-gray-300"
                  } 
                />
              ))}
            </div>
            <p className="text-gray-600 mt-1">{reviews.length} reviews</p>
          </div>

          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => Math.round(r.rating) === star).length;
              const percentage = reviews.length ? (count / reviews.length) * 100 : 0;

              return (
                <div key={star} className="flex items-center mb-2">
                  <span className="text-sm w-16">{star} star</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full mx-2">
                    <div 
                      className="h-full bg-pink-400 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm w-10 text-gray-600">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review) => 
            <ReviewCard key={review._id || review.createdAt} review={review} />
          )
        ) : (
          <div className="text-center py-8 text-gray-500">
            No reviews yet. Be the first to review this product!
          </div>
        )}
      </div>

      {/* Review Form */}
      <div className="mt-12 border-t border-gray-200 pt-8">
        <h3 className="text-xl font-bold mb-6">Write a Review</h3>
        <ReviewForm
          productId={product._id}
          onSuccess={fetchReviews}
        />
      </div>
    </div>
  );
}