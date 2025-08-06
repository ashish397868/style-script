
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../../redux/features/product/productSlice';
import Loader from '../Loader';
import api from '../../services/api';

const AdminProductList = () => {
  const { products, loading, error } = useSelector(state => state.product);
  const dispatch = useDispatch();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchProducts({ 
      page,
      limit,
      includeUnpublished: true, // For admin view, we want to see all products
      includeOutOfStock: true
    }));
  }, [dispatch, page, limit]);

  // Delete handler
  const handleDelete = async (productId) => {
    if (!productId) return;
    try {
      await api.delete(`/products/${productId}`);
      // Refresh the current page
      dispatch(fetchProducts({ 
        page,
        limit,
        includeUnpublished: true,
        includeOutOfStock: true
      }));
      setDeleteConfirm(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete product';
      alert(errorMessage);
      console.error('Delete product error:', err);
    }
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortConfig.key) {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
    }
    return 0;
  });

  const filteredProducts = sortedProducts.filter(product => 
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <Loader/>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="px-4 md:px-6 py-4 bg-gradient-to-r from-pink-600 to-purple-700 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-xl md:text-2xl font-bold">Product Inventory</h2>
              <p className="text-pink-200 mt-1">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} in your catalog
              </p>
            </div>
            <div className="mt-4 md:mt-0 w-full md:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-lg bg-pink-700 placeholder-pink-200 text-white focus:outline-none focus:ring-2 focus:ring-white"
                />
                <svg 
                  className="absolute left-3 top-2.5 h-5 w-5 text-pink-200" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="px-4 md:px-6 py-4 bg-red-50 border-l-4 border-red-500">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-500 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Products Table - Hidden on mobile */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center">
                    Price
                    {sortConfig.key === 'price' && (
                      <svg 
                        className={`ml-1 h-4 w-4 ${sortConfig.direction === 'ascending' ? '' : 'transform rotate-180'}`} 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('availableQty')}
                >
                  <div className="flex items-center">
                    Stock
                    {sortConfig.key === 'availableQty' && (
                      <svg 
                        className={`ml-1 h-4 w-4 ${sortConfig.direction === 'ascending' ? '' : 'transform rotate-180'}`} 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('isFeatured')}
                >
                  <div className="flex items-center">
                    Featured
                    {sortConfig.key === 'isFeatured' && (
                      <svg 
                        className={`ml-1 h-4 w-4 ${sortConfig.direction === 'ascending' ? '' : 'transform rotate-180'}`} 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg 
                        className="h-16 w-16 text-gray-300 mb-4" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-700 mb-1">No products found</h3>
                      <p className="text-gray-500">Try adjusting your search query</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product._id || product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden bg-gray-200 border border-gray-300 flex items-center justify-center">
                          {product.images && product.images.length > 0 ? (
                            <img 
                              src={product.images[0]} 
                              alt={product.title} 
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <svg 
                              className="h-8 w-8 text-gray-400" 
                              xmlns="http://www.w3.org/2000/svg" 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.title}</div>
                          <div className="text-sm text-gray-500">{product.brand || 'No brand'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">₹{product.basePrice.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {product.isOutOfStock === false ? (
                          <>
                            <span className={`h-2 w-2 rounded-full mr-2
                            }`}></span>
                           In stock
                          </>
                        ) : (
                          <>
                            <span className="h-2 w-2 rounded-full mr-2 bg-red-500"></span>
                            Out of stock
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {product.isFeatured ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Featured
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Standard
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          className="text-pink-600 hover:text-pink-900 bg-pink-50 p-2 rounded-lg transition-colors"
                          onClick={() => navigate(`/admin/edit-product/${product._id || product.id}`)}
                        >
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg transition-colors"
                          onClick={() => setDeleteConfirm(product._id)}
                        >
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between items-center">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1 || loading}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {page}
            </span>
            <button
              onClick={() => setPage(prev => prev + 1)}
              disabled={products.length < limit || loading}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>

        {/* Mobile Product Cards */}
        <div className="md:hidden">
          {filteredProducts.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <div className="flex flex-col items-center justify-center">
                <svg 
                  className="h-16 w-16 text-gray-300 mb-4" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-700 mb-1">No products found</h3>
                <p className="text-gray-500">Try adjusting your search query</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredProducts.map(product => (
                <div key={product._id || product.id} className="p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden bg-gray-200 border border-gray-300 flex items-center justify-center">
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.title} 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <svg 
                          className="h-8 w-8 text-gray-400" 
                          xmlns="http://www.w3.org/2000/svg" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-4 flex-grow">
                      <div className="font-medium text-gray-900">{product.title}</div>
                      <div className="text-sm text-gray-500">{product.brand || 'No brand'}</div>
                      <div className="text-sm font-medium text-gray-900 mt-1">₹{product.basePrice.toFixed(2)}</div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: product.availableQty > 10 
                              ? '#f0fdf4' 
                              : product.availableQty > 0 
                                ? '#fffbeb' 
                                : '#fef2f2',
                            color: product.availableQty > 10 
                              ? '#166534' 
                              : product.availableQty > 0 
                                ? '#854d0e' 
                                : '#b91c1c'
                          }}
                        >
                          {product.availableQty > 0 ? (
                            <>{product.availableQty} in stock</>
                          ) : (
                            <>Out of stock</>
                          )}
                        </div>
                        
                        {product.isFeatured && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end space-x-3">
                    <button
                      onClick={() => navigate(`/admin/edit-product/${product._id}`)}
                      className="inline-flex items-center px-3 py-1 border border-indigo-600 text-sm leading-4 font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(product._id)}
                      className="inline-flex items-center px-3 py-1 border border-red-600 text-sm leading-4 font-medium rounded-md text-red-600 bg-white hover:bg-red-50 focus:outline-none transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Delete Product
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete this product? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button 
                    type="button" 
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => handleDelete(deleteConfirm)}
                  >
                    Delete
                  </button>
                  <button 
                    type="button" 
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setDeleteConfirm(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductList;