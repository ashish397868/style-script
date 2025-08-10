import { FaStar, FaStarHalfAlt } from "react-icons/fa";

const ReviewCard = ({ review }) => {
  // Rating ko nearest 0.5 tak round
  const displayRating = Math.round(review.rating * 2) / 2;

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-center mb-4">
        {/* User Avatar (First Letter) */}
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold mr-3">{review.userId?.name?.charAt(0)}</div>

        {/* User Name + Rating */}
        <div>
          <h4 className="font-medium">{review.userId?.name}</h4>
          <div className="flex items-center">
            <div className="flex text-pink-400 mr-2">
              {[...Array(5)].map((_, i) => {
                if (i + 1 <= displayRating) {
                  // Full star
                  return <FaStar key={i} className="w-4 h-4 fill-current" />;
                } else if (i + 0.5 === displayRating) {
                  // Half star
                  return <FaStarHalfAlt key={i} className="w-4 h-4 fill-current" />;
                } else {
                  // Empty star
                  return <FaStar key={i} className="w-4 h-4 text-gray-300" />;
                }
              })}
            </div>
            <span className="text-gray-500 text-sm">{new Date(review.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Comment */}
      <p className="text-gray-700">{review.comment}</p>
    </div>
  );
};

export default ReviewCard;
