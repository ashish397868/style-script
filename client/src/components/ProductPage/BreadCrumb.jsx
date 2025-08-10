import { Link } from "react-router-dom";

// ProductBreadcrumb.jsx
function ProductBreadcrumb({ product }) {
  return (
    <nav className="flex mb-8" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link to="/" className="text-gray-600 hover:text-pink-600 text-sm">
            Home
          </Link>
        </li>

        {/* <li>
          <div className="flex items-center">
            <svg className="w-3 h-3 text-gray-400 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link to="/products" className="ml-1 text-sm text-gray-600 hover:text-pink-600 md:ml-2">
              Products
            </Link>
          </div>
        </li> */}
        
        <li>
          <div className="flex items-center">
            <svg className="w-3 h-3 text-gray-400 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {product?.category ? (
              <Link 
                to={`/category/${product.category.toLowerCase().replace(/\s+/g, "-")}`} 
                className="ml-1 text-sm text-gray-600 hover:text-pink-600 md:ml-2"
              >
                {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
              </Link>
            ) : (
              <span className="ml-1 text-sm text-gray-400 md:ml-2">Category</span>
            )}
          </div>
        </li>
        <li aria-current="page">
          <div className="flex items-center">
            <svg className="w-3 h-3 text-gray-400 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="ml-1 text-sm text-gray-500 md:ml-2 font-medium">{product.title}</span>
          </div>
        </li>
      </ol>
    </nav>
  );
}

export default ProductBreadcrumb;