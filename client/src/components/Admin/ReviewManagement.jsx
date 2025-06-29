import React, { useState, useEffect } from 'react';
import { FiTrash2, FiStar } from 'react-icons/fi';
import api from '../../services/api';
import Loader from '../Loader';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = async () => {
    try {
      const response = await api.get('/reviews/all');
      setReviews(response.data || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch reviews');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews(reviews.filter((r) => r._id !== reviewId));
    } catch (err) {
      setError('Failed to delete review');
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mt-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-700 p-6 text-white rounded-t-2xl">
        <h1 className="text-3xl font-bold flex items-center">
          <FiStar className="h-8 w-8 mr-3" />
          Review Management
        </h1>
        <p className="mt-2 text-pink-200">View and moderate product reviews</p>
      </div>
      <div className="p-6">
        <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reviews.map((review) => (
              <tr key={review._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {review.productId?.title || 'Deleted Product'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {review.userId?.name || 'Deleted User'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FiStar className="text-yellow-400 mr-1" />
                    {review.rating}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-xs truncate">{review.comment || 'No comment'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(review.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>);
};

export default ReviewManagement;
