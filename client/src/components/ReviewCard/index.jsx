// src/components/ReviewCard.jsx
import { FaStar } from "react-icons/fa";

const ReviewCard = ({ review }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold mr-3">
          {review.userId.name.charAt(0)}
        </div>
        <div>
          <h4 className="font-medium">{review.userId.name}</h4>
          <div className="flex items-center">
            <div className="flex text-amber-400 mr-2">
              {[...Array(5)].map((_, i) => (
                <FaStar 
                  key={i} 
                  className={i < review.rating ? "w-4 h-4 fill-current" : "w-4 h-4 text-gray-300"} 
                />
              ))}
            </div>
            <span className="text-gray-500 text-sm">{new Date(review.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      <p className="text-gray-700">{review.comment}</p>
    </div>
  );
};

export default ReviewCard;