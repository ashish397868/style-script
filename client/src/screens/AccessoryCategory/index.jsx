import { useParams } from "react-router-dom";
import ProductCard from "../../components/ProductCard"; // Can still use ProductCard if it supports accessories
import { useEffect, useState } from "react";
import { accessoryAPI } from "../../services/api"; // ✅ Accessory API
import Loader from "../../components/Loader";

const AccessoryCategoryPage = () => {
  const { category } = useParams();

  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchAccessories = async () => {
      try {
        setTitle(`${category} Collection`);
        setSubtitle(`Browse our latest collection of ${category.toLowerCase()}.`);

        const response = await accessoryAPI.getAccessoryByCategory(category);
        setAccessories(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching accessories:", err);
        setError(err.message || "Failed to load accessories");
        setLoading(false);
      }
    };

    fetchAccessories();
  }, [category]);

  if (loading) {
    return (
      <section className="text-gray-600 body-font">
        <div className="container px-5 py-12 mx-auto">
          <Loader />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="text-gray-600 body-font">
        <div className="container px-5 py-12 mx-auto">
          <div className="text-center py-8">
            <p className="text-xl text-red-600 mb-4">Error loading {category.toLowerCase()}</p>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="text-gray-600 body-font">
      <div className="container px-5 py-12 mx-auto">
        <div className="flex flex-col text-center w-full mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 capitalize">{title}</h1>
          <p className="lg:w-2/3 mx-auto text-gray-600">{subtitle}</p>
        </div>

        {accessories && accessories.length > 0 ? (
          <>
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Showing {accessories.length}{" "}
                {accessories.length === 1 ? "accessory" : "accessories"}
              </p>
            </div>

            <div className="flex flex-wrap -m-4">
              {accessories.map((accessory) => (
                <ProductCard key={accessory._id} product={accessory} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-xl text-gray-700 mb-4">
                No {category.toLowerCase()} available at the moment.
              </p>
              <p className="text-gray-600 mb-6">
                Please check back later for new arrivals.
              </p>
              <button
                onClick={() => window.history.back()}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AccessoryCategoryPage;
