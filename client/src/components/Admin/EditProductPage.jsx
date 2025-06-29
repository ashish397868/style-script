import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, mediaAPI } from '../../services/api';
import Loader from '../Loader';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await productAPI.getProductById(id);
        setForm(res.data);
      } catch (err) {
        setError('Failed to fetch product');
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (form && form.title && !form.slug) {
      const generatedSlug = form.title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');
      setForm(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [form?.title, form?.slug]);

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
      await productAPI.updateProduct(id, form);
      setSuccess(true);
      setTimeout(() => navigate('/admin/all-products'), 1200);
    } catch (err) {
      setError('Failed to update product');
    }
    setLoading(false);
  };

  if (loading || !form) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-pink-600 to-purple-700 p-6 text-white">
            <h1 className="text-3xl font-bold flex items-center">Edit Product</h1>
            <p className="mt-2 text-pink-200">Update product details below</p>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Title *</label>
                <input name="title" value={form.title} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              {/* Slug */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Slug *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    yourstore.com/products/
                  </div>
                  <input
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    required
                    className="w-full pl-48 pr-4 py-3 border border-gray-300 rounded-lg"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Unique URL identifier for your product</p>
              </div>
              {/* Description */}
              <div className="mb-6 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                ></textarea>
              </div>
              {/* Price & Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    ₹
                  </div>
                  <input
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                <input
                  name="availableQty"
                  type="number"
                  value={form.availableQty}
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              {/* Category & Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <div className="flex gap-2">
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select category</option>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              {/* Size & Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                <input
                  name="size"
                  value={form.size}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input
                  name="color"
                  value={form.color}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              {/* Tags */}
              <div className="mb-6 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
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
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg"
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
              <div className="mb-6 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URLs or Upload</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.images.map((img, index) => (
                    <div key={index} className="relative">
                      {img.match(/^https?:\/\//) ? (
                        <img src={img} alt="preview" className="w-16 h-16 object-contain rounded-xl border-2 border-dashed" />
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
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg"
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
              <div className="flex items-center mb-6 md:col-span-2">
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
            <div className="flex justify-end mt-6">
              <button type="submit" className="px-6 py-3 rounded-lg font-medium bg-pink-600 text-white hover:bg-pink-700 transition">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            {success && <div className="text-green-600 mt-4">Product updated!</div>}
            {error && <div className="text-red-600 mt-4">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProductPage;