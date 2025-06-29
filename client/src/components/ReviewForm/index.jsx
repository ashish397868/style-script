// src/components/ReviewForm.jsx
import { useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";

export default function ReviewForm({ productId, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!rating || !comment.trim()) {
      return toast.error("Please provide a rating and comment.");
    }
    setSubmitting(true);
    try {
      await api.post("/reviews", { productId, rating, comment });
      toast.success("Review submitted!");
      setComment("");
      setRating(5);
      onSuccess?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

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
