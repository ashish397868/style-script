
import React, { useState, useEffect } from 'react';
import { productAPI, mediaAPI } from '../../services/api';
import Loader from '../Loader';

const AddProduct = () => {
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    images: [],
    category: '',
    brand: '',
    size: '',
    color: '',
    tags: [],
    availableQty: '',
    isFeatured: false,
  });
  
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (form.title && !form.slug) {
      const generatedSlug = form.title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');
      setForm(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [form.title, form.slug]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addImage = (e) => {
    e.preventDefault();
    if (imageInput.trim() && !form.images.includes(imageInput.trim())) {
      setForm(prev => ({
        ...prev,
        images: [...prev.images, imageInput.trim()]
      }));
      setImageInput('');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await mediaAPI.uploadImage(formData);
      const imageUrl = res.data?.url || res.data?.imageUrl || res.data?.path;
      if (imageUrl && !form.images.includes(imageUrl)) {
        setForm(prev => ({
          ...prev,
          images: [...prev.images, imageUrl]
        }));
      }
    } catch (err) {
      setError('Image upload failed');
    }
    setUploading(false);
  };

  const removeImage = (imageToRemove) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== imageToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      // Post product data to server
      await productAPI.createProduct(form);
      setSuccess(true);
      setForm({
        title: '',
        slug: '',
        description: '',
        price: '',
        images: [],
        category: '',
        brand: '',
        size: '',
        color: '',
        tags: [],
        availableQty: '',
        isFeatured: false,
      });
      setTagInput('');
      setImageInput('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add product');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-600 to-purple-700 p-6 text-white">
            <h1 className="text-3xl font-bold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
              Add New Product
            </h1>
            <p className="mt-2 text-pink-200">Fill in the details below to add a new product to your inventory</p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div>
                {/* Title */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Title *
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Premium Cotton T-Shirt"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                  />
                </div>
                
                {/* Slug */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Slug *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      yourstore.com/products/
                    </div>
                    <input
                      name="slug"
                      value={form.slug}
                      onChange={handleChange}
                      placeholder="premium-cotton-tshirt"
                      required
                      className="w-full pl-48 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Unique URL identifier for your product</p>
                </div>
                
                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Detailed product description..."
                    rows="4"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                  ></textarea>
                </div>
                
                {/* Price & Quantity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        ₹
                      </div>
                      <input
                        name="price"
                        type="number"
                        value={form.price}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Quantity *
                    </label>
                    <input
                      name="availableQty"
                      type="number"
                      value={form.availableQty}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>
              
              {/* Right Column */}
              <div>
                {/* Category & Brand */}
                <div className="grid grid-cols-1 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <div className="flex gap-2">
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                      >
                        <option value="">Select category</option>
                        <option value="TShirts">TShirts</option>
                        <option value="Sweatshirts">Sweatshirts</option>
                        <option value="Hoodies">Hoodies</option>
                        <option value="Zipper Hoodies">Zipper Hoodies</option>
                        <option value="Polo TShirts">Polo TShirts</option>
                        <option value="Oversized Tshirts">Oversized Tshirts</option>
                        {form.category && !["T-Shirts","Sweatshirts","Hoodies","Zipper Hoodies","Polo TShirts","Oversized Tshirts"].includes(form.category) && (
                          <option value={form.category}>
                            {form.category.charAt(0).toUpperCase() + form.category.slice(1)}
                          </option>
                        )}
                      </select>
                      <input
                        type="text"
                        placeholder="Add new category"
                        value={form.newCategory || ''}
                        onChange={e =>
                          setForm(prev => ({
                            ...prev,
                            newCategory: e.target.value
                          }))
                        }
                        className="px-4 py-3 border border-gray-300 rounded-lg"
                      />
                      <button
                        type="button"
                        className="bg-pink-600 hover:bg-pink-700 text-white px-3 rounded-lg"
                        onClick={() => {
                          if (
                            form.newCategory &&
                            !["Clothing","Electronics","Home & Kitchen","Beauty","Sports"].includes(form.newCategory)
                          ) {
                            setForm(prev => ({
                              ...prev,
                              category: prev.newCategory,
                              newCategory: ''
                            }));
                          }
                        }}
                      >
                        Add
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Select or add a new category</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand
                    </label>
                    <input
                      name="brand"
                      value={form.brand}
                      onChange={handleChange}
                      placeholder="e.g. Nike, Apple"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
                
                {/* Size & Color */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Size
                    </label>
                    <input
                      name="size"
                      value={form.size}
                      onChange={handleChange}
                      placeholder="e.g. S, M, L"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <input
                      name="color"
                      value={form.color}
                      onChange={handleChange}
                      placeholder="e.g. Red, pink"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
                
                {/* Tags */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-pink-600 hover:text-pink-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag and press Enter"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                      onKeyPress={(e) => e.key === 'Enter' && addTag(e)}
                    />
                    <button
                      onClick={addTag}
                      className="bg-pink-600 hover:bg-pink-700 text-white px-4 rounded-r-lg transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
                
                {/* Images */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URLs or Upload
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.images.map((img, index) => (
                      <div key={index} className="relative">
                        {/* Show image preview if URL is valid */}
                        {img.match(/^https?:\/\//) ? (
                          <img src={img} alt="preview" className="w-16 h-16 object-cover rounded-xl border-2 border-dashed" />
                        ) : (
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
                            <span className="text-xs text-gray-500">Image</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(img)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex mb-2">
                    <input
                      type="text"
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      placeholder="Paste image URL"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                    />
                    <button
                      onClick={addImage}
                      className="bg-pink-600 hover:bg-pink-700 text-white px-4 rounded-r-lg transition"
                    >
                      Add
                    </button>
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="mb-2"
                    />
                    {uploading && <span className="text-pink-600 ml-2">Uploading...</span>}
                  </div>
                </div>
                
                {/* Featured */}
                <div className="flex items-center mb-6">
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        name="isFeatured"
                        type="checkbox"
                        checked={form.isFeatured}
                        onChange={handleChange}
                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="isFeatured" className="font-medium text-gray-700">
                        Feature this product
                      </label>
                      <p className="text-gray-500">Show this product prominently on your store</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200">
              <div>
                {success && (
                  <div className="flex items-center text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Product added successfully!
                  </div>
                )}
                {error && (
                  <div className="flex items-center text-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 rounded-lg font-medium transition flex items-center ${
                  loading 
                    ? 'bg-pink-400 cursor-not-allowed' 
                    : 'bg-pink-600 hover:bg-pink-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                } text-white`}
              >
                {loading ? (
                  <>
                    <Loader />
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* Info Panel */}
        <div className="mt-8 bg-pink-50 rounded-xl p-6 border border-pink-100">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-pink-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-pink-800">Product Information</h3>
              <div className="mt-2 text-sm text-pink-700">
                <p>All fields marked with * are required. The slug will be automatically generated from the title but can be customized.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;