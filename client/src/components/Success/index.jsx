import { Link } from "react-router-dom";
import RelatedProducts from "../RelatedProducts";

export default function Success() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-white p-8 rounded shadow text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Order Placed Successfully!</h2>
        <p className="mb-6">Thank you for your purchase. Your order has been placed and is being processed.</p>
        <Link to="/" className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">Go to Home</Link>
      </div>
      <RelatedProducts />
    </section>
  );
}
