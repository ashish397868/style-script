const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="border border-gray-50 rounded-lg p-6 text-center shadow-sm hover:shadow-md transition">
      <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-pink-100 text-pink-600 text-2xl">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default FeatureCard;
