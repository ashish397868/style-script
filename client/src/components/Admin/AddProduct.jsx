import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { productAPI, mediaAPI } from "../../services/api";
import { initialValues, validationSchema } from "../../utils/formConfig/productFormConfig";
import colorMap from "../../constants/colorMap";

const AddProduct = () => {
  const [tagInput, setTagInput] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Convert string numbers to actual numbers
        const productData = {
          ...values,
          price: Number(values.price),
          availableQty: Number(values.availableQty),
          theme: values.theme || null, // will be null if not selected
        };

        await productAPI.createProduct(productData);
        setSuccess(true);
        formik.resetForm();
        setTagInput("");
        setImageInput("");
        setError("");
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to add product");
      }
    },
  });

  // Auto-generate slug from title
  useEffect(() => {
    if (formik.values.title && !formik.values.slug) {
      const generatedSlug = formik.values.title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");
      formik.setFieldValue("slug", generatedSlug);
    }
  }, [formik.values.title, formik.values.slug]);

  const addTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formik.values.tags.includes(tagInput.trim())) {
      formik.setFieldValue("tags", [...formik.values.tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    formik.setFieldValue(
      "tags",
      formik.values.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  const addImage = (e) => {
    e.preventDefault();
    if (imageInput.trim() && !formik.values.images.includes(imageInput.trim())) {
      formik.setFieldValue("images", [...formik.values.images, imageInput.trim()]);
      setImageInput("");
    }
  };

  const removeImage = (imageToRemove) => {
    formik.setFieldValue(
      "images",
      formik.values.images.filter((img) => img !== imageToRemove)
    );
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await mediaAPI.uploadImage(formData);
      const imageUrl = res.data?.url || res.data?.imageUrl || res.data?.path;
      if (imageUrl && !formik.values.images.includes(imageUrl)) {
        formik.setFieldValue("images", [...formik.values.images, imageUrl]);
      }
    } catch (err) {
      setError("Image upload failed", err);
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-600 to-purple-700 p-4 md:p-6 text-white">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 mr-2 md:mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                  clipRule="evenodd"
                />
              </svg>
              Add New Product
            </h1>
            <p className="mt-1 text-sm md:text-base text-pink-200">Fill in the details below to add a new product to your inventory</p>
          </div>

          {/* Form */}
          <form onSubmit={formik.handleSubmit} className="p-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Left Column */}
              <div>
                {/* Title */}
                <div className="mb-4 md:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Title *</label>
                  <input
                    name="title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="e.g. Premium Cotton T-Shirt"
                    className={`w-full outline-none px-3 md:px-4 py-2 md:py-3 border ${
                      formik.touched.title && formik.errors.title ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition`}
                  />
                  {formik.touched.title && formik.errors.title && <div className="text-red-500 text-xs mt-1">{formik.errors.title}</div>}
                </div>

                {/* Slug */}
                <div className="mb-4 md:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Slug *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 text-xs md:text-sm truncate w-32 md:w-auto">yourstore.com/products/</div>
                    <input
                      name="slug"
                      value={formik.values.slug}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="premium-cotton-tshirt"
                      className={`w-full outline-none pl-[7.5rem] md:pl-48 pr-3 md:pr-4 py-2 md:py-3 border ${
                        formik.touched.slug && formik.errors.slug ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition`}
                    />
                  </div>
                  {formik.touched.slug && formik.errors.slug && <div className="text-red-500 text-xs mt-1">{formik.errors.slug}</div>}
                  <p className="mt-1 text-xs text-gray-500">Unique URL identifier for your product</p>
                </div>

                {/* Description */}
                <div className="mb-4 md:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Detailed product description..."
                    rows="4"
                    className={`w-full outline-none px-3 md:px-4 py-2 md:py-3 border ${
                      formik.touched.description && formik.errors.description ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition`}
                  ></textarea>
                  {formik.touched.description && formik.errors.description && <div className="text-red-500 text-xs mt-1">{formik.errors.description}</div>}
                </div>

                {/* Price & Quantity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 md:mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">₹</div>
                      <input
                        name="price"
                        type="number"
                        value={formik.values.price}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className={`w-full outline-none pl-7 md:pl-8 pr-3 md:pr-4 py-2 md:py-3 border ${
                          formik.touched.price && formik.errors.price ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition`}
                      />
                    </div>
                    {formik.touched.price && formik.errors.price && <div className="text-red-500 text-xs mt-1">{formik.errors.price}</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                    <input
                      name="availableQty"
                      type="number"
                      value={formik.values.availableQty}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="0"
                      min="0"
                      className={`w-full outline-none px-3 md:px-4 py-2 md:py-3 border ${
                        formik.touched.availableQty && formik.errors.availableQty ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition`}
                    />
                    {formik.touched.availableQty && formik.errors.availableQty && <div className="text-red-500 text-xs mt-1">{formik.errors.availableQty}</div>}
                  </div>
                </div>

                {/* Category & Brand */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 md:mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <div className="relative">
                      <select
                        name="category"
                        value={formik.values.category}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full appearance-none outline-none px-3 md:px-4 py-2 md:py-3 border ${
                          formik.touched.category && formik.errors.category ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition pr-8`}
                      >
                        <option value="">Select category</option>
                        <option value="Sweatshirts">Sweatshirts</option>
                        <option value="Hoodies">Hoodies</option>
                        <option value="Zipper Hoodies">Zipper Hoodies</option>
                        <option value="TShirts">TShirts</option>
                        <option value="Polo TShirts">Polo TShirts</option>
                        <option value="Oversized Tshirts">Oversized Tshirts</option>
                        {formik.values.category && !["Sweatshirts", "Hoodies", "Zipper Hoodies", "TShirts", "Polo TShirts", "Oversized Tshirts"].includes(formik.values.category) && (
                          <option value={formik.values.category}>{formik.values.category}</option>
                        )}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {formik.touched.category && formik.errors.category && <div className="text-red-500 text-xs mt-1">{formik.errors.category}</div>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <input
                      name="brand"
                      value={formik.values.brand}
                      onChange={formik.handleChange}
                      placeholder="e.g. Nike, Apple"
                      className="w-full outline-none px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Size & Color */}
                <div className="grid grid-cols-2 gap-4 mb-4 md:mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                    <div className="relative">
                      <select
                        name="size"
                        value={formik.values.size}
                        onChange={formik.handleChange}
                        className="w-full appearance-none outline-none px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition pr-8"
                      >
                        <option value="">Select size</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <div className="relative">
                      <select
                        name="color"
                        value={formik.values.color}
                        onChange={formik.handleChange}
                        className="w-full appearance-none outline-none px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition pr-8"
                      >
                        <option value="">Select color</option>
                        {colorMap.map((color) => (
                          <option key={color.name} value={color.name}>
                            {color.name
                              .split(" ")
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(" ")}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* {theme} */}
                            <div className="mb-4 md:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Themes
              </label>
              <div className="relative">
                <select
                  name="theme"
                  value={formik.values.theme || ''}
                  onChange={formik.handleChange}
                  className="w-full appearance-none outline-none px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition pr-8"
                >
                  <option value="">Select theme (optional)</option>
                  <option value="Combo Offers">Combo Offers</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Programming">Programming</option>
                  <option value="Trending">Trending</option>
                  {formik.values.theme && 
                    !["Combo Offers", "Gaming", "Fitness", "Lifestyle", "Programming", "Trending"].includes(formik.values.theme) && (
                      <option value={formik.values.theme}>
                        {formik.values.theme}
                      </option>
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

                {/* Tags */}
                <div className="mb-4 md:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <div className="flex flex-wrap mb-2 gap-1">
                    {formik.values.tags.map((tag, index) => (
                      <div key={index} className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="ml-1 text-gray-500 hover:text-gray-700 focus:outline-none">
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Enter tag and press Add"
                      className="flex-grow outline-none px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag(e);
                        }
                      }}
                    />
                    <button type="button" onClick={addTag} className="px-3 md:px-4 py-2 md:py-3 bg-gray-200 text-gray-800 rounded-r-lg hover:bg-gray-300 transition">
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div>
                {/* Featured Switch */}
                <div className="mb-4 md:mb-6">
                  <div className="flex items-center">
                    <input type="checkbox" id="isFeatured" name="isFeatured" checked={formik.values.isFeatured} onChange={formik.handleChange} className="h-4 outline-none w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded" />
                    <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
                      Feature this product on homepage
                    </label>
                  </div>
                </div>

                {/* Images */}
                <div className="mb-4 md:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URLs or Upload</label>
                  {formik.touched.images && formik.errors.images && <div className="text-red-500 text-xs mb-1">{formik.errors.images}</div>}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formik.values.images.map((img, index) => (
                      <div key={index} className="relative">
                        {/* Show image preview if URL is valid */}
                        {img.match(/^https?:\/\//) ? (
                          <img src={img} alt="preview" className="w-14 h-14 md:w-16 md:h-16 object-contain rounded-xl border-2 border-dashed" />
                        ) : (
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-14 h-14 md:w-16 md:h-16 flex items-center justify-center">
                            <span className="text-xs text-gray-500">Image</span>
                          </div>
                        )}
                        <button type="button" onClick={() => removeImage(img)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Image URL Input */}
                  <div className="flex mb-3">
                    <input
                      type="text"
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      placeholder="Enter image URL"
                      className="flex-grow outline-none px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                    />
                    <button type="button" onClick={addImage} className="px-3 md:px-4 py-2 md:py-3 bg-gray-200 text-gray-800 rounded-r-lg hover:bg-gray-300 transition">
                      Add URL
                    </button>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Or upload an image:</label>
                    <div className="relative">
                      <input type="file" onChange={handleFileUpload} accept="image/*" className="sr-only" id="file-upload" />
                      <label
                        htmlFor="file-upload"
                        className={`flex items-center outline-none justify-center w-full px-4 py-3 border-2 border-dashed rounded-lg ${uploading ? "bg-gray-100 border-gray-300" : "border-gray-300 hover:border-gray-400"} cursor-pointer`}
                      >
                        {uploading ? (
                          <div className="flex items-center">
                            <svg className="animate-spin h-5 w-5 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-gray-500">Uploading...</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <svg className="h-6 w-6 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              ></path>
                            </svg>
                            <span className="text-gray-500">Click to upload image</span>
                          </div>
                        )}
                      </label>
                    </div>
                    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                  </div>
                </div>
              </div>
            </div>

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
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {error}
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    formik.resetForm();
                    setTagInput("");
                    setImageInput("");
                    setError("");
                    setSuccess(false);
                  }}
                  className="px-4 cursor-pointer py-2 border outline-none border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className={`px-4 cursor-pointer py-2 border border-transparent rounded-md font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors ${
                    formik.isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {formik.isSubmitting ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding Product...
                    </div>
                  ) : (
                    "Add Product"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-pink-50 rounded-xl p-4 md:p-6 border border-pink-100">
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
