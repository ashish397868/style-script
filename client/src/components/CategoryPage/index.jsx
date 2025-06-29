import { useParams } from "react-router-dom";
import ProductCard from "../ProductCard";
import { useEffect, useState } from "react";
import { productAPI } from "../../services/api";
import { BeatLoader } from "react-spinners";

const CategoryPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    productAPI.getProductsByCategory(category)
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category]);

  // Capitalize category name for heading
  const displayCategory = category
    ? category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')
    : '';

  return (
    <section className="text-gray-600 body-font">
      <div className="container px-5 py-12 mx-auto">
        <div className="flex flex-col text-center w-full mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {displayCategory} Collection
          </h1>
          <p className="lg:w-2/3 mx-auto text-gray-600">
            Browse our latest collection of {displayCategory.toLowerCase()}.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <BeatLoader color="#6b21a8" size={18} />
          </div>
        ) : products && products.length > 0 ? (
          <div className="flex flex-wrap -m-4">
            {/* Group products by title and show only one card per title, passing all variants */}
            {Object.entries(
              products.reduce((acc, prod) => {
                if (!acc[prod.title]) acc[prod.title] = [];
                acc[prod.title].push(prod);
                return acc;
              }, {})
            ).map(([title, variants]) => (
              <ProductCard key={variants[0]._id} product={variants[0]} variants={variants} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-xl text-gray-700 mb-4">
              No {displayCategory.toLowerCase()} available at the moment.
            </p>
            <p className="text-gray-600">
              Please check back later for new arrivals.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryPage;