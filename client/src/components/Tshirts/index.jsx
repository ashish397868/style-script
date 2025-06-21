import { useState, useEffect } from "react";
import { BeatLoader } from "react-spinners";
import { productAPI } from "../../services/api";
import ProductCard from "../ProductCard";

const Tshirts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await productAPI.getProductsByCategory("tshirts");
        setProducts(response.data);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setError("Failed to load products. Please try again later.");
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="text-gray-600 body-font">
      <div className="container px-5 py-12 mx-auto">
        <div className="flex flex-col text-center w-full mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            T-Shirts Collection
          </h1>
          <p className="lg:w-2/3 mx-auto text-gray-600">
            Browse our latest collection of trendy and comfortable t-shirts.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <BeatLoader
              visible={true}
              height="80"
              width="80"
              color="#4fa94d"
              radius="9"
              ariaLabel="three-dots-loading"
            />
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-8">{error}</div>
        ) : products && products.length > 0 ? (
          <div className="flex flex-wrap -m-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-xl text-gray-700 mb-4">
              No t-shirts available at the moment.
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

export default Tshirts;
