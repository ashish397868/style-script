// src/components/ReviewForm.jsx
import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { useSelector } from "react-redux";

export default function ReviewForm({ productId, onSuccess }) {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info("Please login to submit a review");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }
    
    if (!rating || !comment.trim()) {
      return toast.error("Please provide a rating and comment.");
    }
    setSubmitting(true);
    try {
      await api.post("/reviews", { productId, rating, comment });
      toast.success("Review submitted!");
      setComment("");
      setRating(5);
      // Call onSuccess safely after successful submission
      if (typeof onSuccess === "function") {
        try { onSuccess(); } catch (e) { /* ignore */ }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  // If not authenticated, show a message with login link
  if (!isAuthenticated) {
    return (
      <div className="mt-8 p-4 border border-gray-200 rounded-md bg-gray-50">
        <h3 className="text-lg font-semibold">Add a Review</h3>
        <p className="mt-2 text-gray-600">
          Please{" "}
          <Link to="/login" state={{ from: window.location.pathname }} className="text-pink-600 font-medium hover:text-pink-700">
            login
          </Link>{" "}
          to submit a review for this product.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3">
      <h3 className="text-lg font-semibold">Add a Review</h3>
      <label className="flex items-center gap-2">
        <span>Rating:</span>
        <select
          value={rating}
          onChange={e => setRating(Number(e.target.value))}
          className="border rounded px-2 py-1"
        >
          {[5, 4, 3, 2, 1].map(r => (
            <option key={r} value={r}>
              {r} Star{r > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </label>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Write your review..."
        rows={3}
        className="border rounded px-2 py-1"
        required
      />
      <button
        type="submit"
        disabled={submitting}
        className="self-start bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
