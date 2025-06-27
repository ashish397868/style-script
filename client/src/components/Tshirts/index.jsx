import { useEffect } from "react";
import { BeatLoader } from "react-spinners";
import { useProductStore } from "../../store/productStore";
import ProductCard from "../ProductCard";

const Tshirts = () => {
  const { products, fetchProducts, loading, error } = useProductStore();

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, []);

  // Filter t-shirts category (assuming category is 'tshirts' or similar)
  const tshirtProducts = products.filter(
    (prod) => prod.category && prod.category.toLowerCase() === "tshirts"
  );

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

        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <BeatLoader
              // visible={true}
              height="80"
              width="80"
              color="#4fa94d"
              radius="9"
              aria-label="three-dots-loading"
            />
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-8">{error}</div>
        ) : tshirtProducts && tshirtProducts.length > 0 ? (
          <div className="flex flex-wrap -m-4">
            {/* Group products by title and show only one card per title, passing all variants */}
            {Object.entries(
              tshirtProducts.reduce((acc, prod) => {
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
