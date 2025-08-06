import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productAPI, mediaAPI } from "../../services/api";
import colorMap from "../../constants/colorMap";
import Loader from "../../components/Loader";
import { generateSKU } from "../../utils/formConfig/productFormConfig";

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [variantImageInputs, setVariantImageInputs] = useState([]);
  const [variantUploading, setVariantUploading] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await productAPI.getProductById(id);
        setForm(res.data);
        // Initialize variant image inputs
        setVariantImageInputs(res.data.variants.map(() => ""));
      } catch (err) {
        setError("Failed to fetch product: " + (err?.response?.data?.message || err.message));
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (form && form.title && !form.slug) {
      const generatedSlug = form.title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");
      setForm((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [form?.title, form?.slug]);

  // Auto-generate SKUs when variant fields change
  useEffect(() => {
    if (!form || !form.variants) return;
    
    const updatedVariants = form.variants.map(variant => {
      if (variant.size && variant.color && form.title) {
        const newSKU = generateSKU(
          form.title,
          variant.size,
          variant.color
        );
        return { ...variant, sku: variant.sku || newSKU };
      }
      return variant;
    });
    
    setForm(prev => ({ ...prev, variants: updatedVariants }));
  }, [form?.title, form?.variants?.map(v => `${v.size}-${v.color}`).join(',')]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleVariantChange = (index, field, value) => {
    setForm(prev => {
      const newVariants = [...prev.variants];
      newVariants[index] = {
        ...newVariants[index],
        [field]: value
      };
      return { ...prev, variants: newVariants };
    });
  };

  const addVariant = () => {
    setForm(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        { 
          size: "", 
          color: "", 
          price: "", 
          availableQty: "", 
          sku: "", 
          images: [] 
        }
      ]
    }));
    setVariantImageInputs([...variantImageInputs, ""]);
  };

  const removeVariant = (index) => {
    setForm(prev => {
      const newVariants = [...prev.variants];
      newVariants.splice(index, 1);
      return { ...prev, variants: newVariants };
    });
    
    const newInputs = [...variantImageInputs];
    newInputs.splice(index, 1);
    setVariantImageInputs(newInputs);
  };

  const addTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addImage = (e) => {
    e.preventDefault();
    if (imageInput.trim() && !form.images.includes(imageInput.trim())) {
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, imageInput.trim()],
      }));
      setImageInput("");
    }
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
      if (imageUrl && !form.images.includes(imageUrl)) {
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, imageUrl],
        }));
      }
    } catch (err) {
      setError("Image upload failed: " + (err?.response?.data?.message || err.message));
    }
    setUploading(false);
  };

  const removeImage = (imageToRemove) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img !== imageToRemove),
    }));
  };

  // Variant image management
  const addVariantImage = (variantIndex, e) => {
    e.preventDefault();
    const url = variantImageInputs[variantIndex]?.trim();
    if (url) {
      setForm(prev => {
        const newVariants = [...prev.variants];
        newVariants[variantIndex].images = [...newVariants[variantIndex].images, url];
        return { ...prev, variants: newVariants };
      });
      
      const newInputs = [...variantImageInputs];
      newInputs[variantIndex] = "";
      setVariantImageInputs(newInputs);
    }
  };

  const removeVariantImage = (variantIndex, imageIndex) => {
    setForm(prev => {
      const newVariants = [...prev.variants];
      newVariants[variantIndex].images = newVariants[variantIndex].images.filter(
        (_, i) => i !== imageIndex
      );
      return { ...prev, variants: newVariants };
    });
  };

  const handleVariantFileUpload = async (variantIndex, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVariantUploading(variantIndex);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await mediaAPI.uploadImage(formData);
      const imageUrl = res.data?.url || res.data?.imageUrl || res.data?.path;
      if (imageUrl) {
        setForm(prev => {
          const newVariants = [...prev.variants];
          newVariants[variantIndex].images = [
            ...newVariants[variantIndex].images, 
            imageUrl
          ];
          return { ...prev, variants: newVariants };
        });
      }
    } catch (err) {
      setError("Variant image upload failed: " + (err?.response?.data?.message || err.message));
    }
    setVariantUploading(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    setSuccess(false);
    
    try {
      // Prepare variants data
      const variants = form.variants.map(variant => ({
        ...variant,
        price: Number(variant.price),
        availableQty: Number(variant.availableQty),
        sku: variant.sku || generateSKU(
          form.title, 
          variant.size, 
          variant.color
        )
      }));

      const productData = {
        ...form,
        variants
      };

      await productAPI.updateProduct(id, productData);
      setSuccess(true);
      setTimeout(() => navigate("/admin/all-products"), 1200);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update product");
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !form) {
    return <Loader />;
  }

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
              Edit Product
            </h1>
            <p className="mt-1 text-sm md:text-base text-pink-200">Update the details for this product</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Left Column */}
              <div>
                {/* Title */}
                <div className="mb-4 md:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Title *</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Premium Cotton T-Shirt"
                    className="w-full outline-none px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                  />
                </div>

                {/* Slug */}
                <div className="mb-4 md:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Slug *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 text-xs md:text-sm truncate w-32 md:w-auto">yourstore.com/products/</div>
                    <input
                      name="slug"
                      value={form.slug}
                      onChange={handleChange}
                      placeholder="premium-cotton-tshirt"
                      className="w-full outline-none pl-[7.5rem] md:pl-48 pr-3 md:pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Unique URL identifier for your product</p>
                </div>

                {/* Description */}
                <div className="mb-4 md:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Detailed product description..."
                    rows="4"
                    className="w-full outline-none px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                  ></textarea>
                </div>

                {/* Category & Brand */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 md:mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <div className="relative">
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className="w-full appearance-none outline-none px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition pr-8"
                      >
                        <option value="">Select category</option>
                        <option value="Sweatshirts">Sweatshirts</option>
                        <option value="Hoodies">Hoodies</option>
                        <option value="Zipper Hoodies">Zipper Hoodies</option>
                        <option value="TShirts">TShirts</option>
                        <option value="Polo TShirts">Polo TShirts</option>
                        <option value="Oversized Tshirts">Oversized Tshirts</option>
                        {form.category && !["Sweatshirts", "Hoodies", "Zipper Hoodies", "TShirts", "Polo TShirts", "Oversized Tshirts"].includes(form.category) && <option value={form.category}>{form.category}</option>}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                    <input
                      name="brand"
                      value={form.brand}
                      onChange={handleChange}
                      placeholder="e.g. Nike, Apple"
                      className="w-full outline-none px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Theme */}
                <div className="mb-4 md:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Themes</label>
                  <div className="relative">
                    <select
                      name="theme"
                      value={form.theme || ""}
                      onChange={handleChange}
                      className="w-full appearance-none outline-none px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition pr-8"
                    >
                      <option value="">Select theme (optional)</option>
                      <option value="Combo Offers">Combo Offers</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Fitness">Fitness</option>
                      <option value="Lifestyle">Lifestyle</option>
                      <option value="Programming">Programming</option>
                      <option value="Trending">Trending</option>
                      {form.theme && !["Combo Offers", "Gaming", "Fitness", "Lifestyle", "Programming", "Trending"].includes(form.theme) && <option value={form.theme}>{form.theme}</option>}
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
                    {form.tags.map((tag, index) => (
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
                      className="flex-grow outline-none px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-l-md focus:outline-none focus:border-pink-500 focus:ring-0 text-gray-800"
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

                {/* Product Images */}
                <div className="mb-4 md:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.images.map((img, index) => (
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
                      className="flex-grow outline-none px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-l-md focus:outline-none focus:border-pink-500 focus:ring-0 text-gray-800"
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

              {/* Right Column */}
              <div>
                {/* Featured Switch */}
                <div className="mb-4 md:mb-6">
                  <div className="flex items-center">
                    <input type="checkbox" id="isFeatured" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="h-4 outline-none w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded" />
                    <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
                      Feature this product on homepage
                    </label>
                  </div>
                </div>

                {/* Published Switch */}
                <div className="mb-4 md:mb-6">
                  <div className="flex items-center">
                    <input type="checkbox" id="isPublished" name="isPublished" checked={form.isPublished} onChange={handleChange} className="h-4 outline-none w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded" />
                    <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
                      Publish product immediately
                    </label>
                  </div>
                </div>

                {/* Variants Section */}
                <div className="mb-4 md:mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Variants *</label>
                    <button
                      type="button"
                      onClick={addVariant}
                      className="text-sm bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 rounded-md"
                    >
                      + Add Variant
                    </button>
                  </div>

                  {form.variants.map((variant, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 mb-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Size */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Size *</label>
                          <select
                            value={variant.size}
                            onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                            className="w-full appearance-none outline-none px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition pr-8"
                          >
                            <option value="">Select size</option>
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="XXL">XXL</option>
                          </select>
                        </div>

                        {/* Color */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Color *</label>
                          <select
                            value={variant.color}
                            onChange={(e) => handleVariantChange(index, "color", e.target.value)}
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
                        </div>

                        {/* Price */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">₹</div>
                            <input
                              type="number"
                              value={variant.price}
                              onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              className="w-full outline-none pl-7 md:pl-8 pr-3 md:pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                            />
                          </div>
                        </div>

                        {/* Quantity */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                          <input
                            type="number"
                            value={variant.availableQty}
                            onChange={(e) => handleVariantChange(index, "availableQty", e.target.value)}
                            placeholder="0"
                            min="0"
                            className="w-full outline-none px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                          />
                        </div>

                        {/* SKU */}
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                          <input
                            value={variant.sku}
                            onChange={(e) => handleVariantChange(index, "sku", e.target.value)}
                            className="w-full outline-none px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Auto-generated: {generateSKU(form.title, variant.size, variant.color)}
                          </p>
                        </div>
                      </div>

                      {/* Variant Images */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Variant Images
                        </label>
                        
                        {/* Image previews */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {variant.images.map((img, imgIndex) => (
                            <div key={imgIndex} className="relative">
                              <img 
                                src={img} 
                                alt={`Variant ${index} preview ${imgIndex}`} 
                                className="w-14 h-14 md:w-16 md:h-16 object-contain rounded-xl border-2 border-dashed"
                              />
                              <button 
                                type="button" 
                                onClick={() => removeVariantImage(index, imgIndex)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        {/* Image URL Input */}
                        <div className="flex mb-3">
                          <input
                            type="text"
                            value={variantImageInputs[index] || ""}
                            onChange={(e) => {
                              const newInputs = [...variantImageInputs];
                              newInputs[index] = e.target.value;
                              setVariantImageInputs(newInputs);
                            }}
                            placeholder="Enter image URL"
                            className="flex-grow outline-none px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-l-md focus:outline-none focus:border-pink-500 focus:ring-0 text-gray-800"
                          />
                          <button 
                            type="button" 
                            onClick={(e) => addVariantImage(index, e)}
                            className="px-3 md:px-4 py-2 md:py-3 bg-gray-200 text-gray-800 rounded-r-lg hover:bg-gray-300 transition"
                          >
                            Add URL
                          </button>
                        </div>
                        
                        {/* Image Upload */}
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">
                            Or upload an image:
                          </label>
                          <div className="relative">
                            <input 
                              type="file" 
                              onChange={(e) => handleVariantFileUpload(index, e)} 
                              accept="image/*" 
                              className="sr-only" 
                              id={`variant-file-upload-${index}`} 
                            />
                            <label
                              htmlFor={`variant-file-upload-${index}`}
                              className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed rounded-lg ${
                                variantUploading === index 
                                  ? "bg-gray-100 border-gray-300" 
                                  : "border-gray-300 hover:border-gray-400"
                              } cursor-pointer`}
                            >
                              {variantUploading === index ? (
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
                        </div>
                      </div>
                      
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove Variant
                        </button>
                      </div>
                    </div>
                  ))}
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
                    Product updated successfully!
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
                  onClick={() => navigate("/admin/all-products")}
                  className="px-4 cursor-pointer py-2 border outline-none border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className={`px-4 cursor-pointer py-2 border border-transparent rounded-md font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors ${
                    updating ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {updating ? "Updating..." : "Update Product"}
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
                <p className="mt-1">Each variant must have a unique size+color combination. SKUs are auto-generated but can be customized.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProductPage;