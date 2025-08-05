// controllers/productController.js
const Product = require("../models/Product");
const {cache ,invalidateProductCache}=require("../utils/cache")
let lastProductUpdatedAt = null;

// GET All Products /products?category=...&brand=...&size=...&color=...&isFeatured=...
exports.getAllProducts = async (req, res) => {
  try {
    const { category, brand, size, color, isFeatured } = req.query;

    const filter = {
      isPublished: true,
      isOutOfStock: false,
    };

    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (isFeatured != null) filter.isFeatured = isFeatured === "true";

    // Filter inside variants
    if (size || color) {
      filter.variants = {
        $elemMatch: {},
      };
      if (size) filter.variants.$elemMatch.size = size.toUpperCase();
      if (color) filter.variants.$elemMatch.color = color.toLowerCase();
    }

    // Updated cache key with namespace
    const cacheKey = "product:" + JSON.stringify(filter);

    // Check cache first (if DB hasn't changed)
    if (lastProductUpdatedAt && cache.has(cacheKey)) {
      console.log("✔ Using cached product data for:", cacheKey);
      return res.json(cache.get(cacheKey));
    }

    //  Fetch from DB
    const products = await Product.find(filter)
      .sort({ updatedAt: -1 })
      .lean();

    if (products.length === 0) {
      return res.json([]);
    }

    // Track last update time
    const latestUpdatedAt = new Date(products[0].updatedAt).getTime();

    // ✅ Cache and update timestamp
    cache.set(cacheKey, products);
    lastProductUpdatedAt = latestUpdatedAt;

    console.log("📥 DB Fetched, product cache updated for:", cacheKey);
    return res.json(products);
  } catch (error) {
    console.error("Get All Products Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Search products by query string (public)
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.json([]);
    }

    const searchQuery = {
      $text: { $search: q }, // using MongoDB's full-text search
      isPublished: true,
      isOutOfStock: false,
    };

    /**

        * - `textScore` is a MongoDB feature that ranks documents by how closely they match the search query.
        *   For example, a product with the word "tshirt" in title and tags will score higher than one that 
        *   only has it in description.
        * 
        * Example request:
        *    GET /api/products/search?q=tshirt
        * 
        * Example response:
        * [
        *   {
        *     "_id": "abc123",
        *     "title": "Cotton T-Shirt",
        *     "slug": "cotton-tshirt",
        *     "score": 3.5,
        *     "isPublished": true,
        *     ...
        *   },
        *   ...
        * ]
    */

    const products = await Product.find(searchQuery, { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" }, updatedAt: -1 })
      .limit(20)
      .lean();

    return res.json(products);
  } catch (error) {
    console.error("Search Products Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// get product by theme (from route param)
exports.getProductsByTheme = async (req, res) => {
  try {
    const { theme } = req.params;

    const products = await Product.find({
      theme: theme.toUpperCase(),
      isPublished: true,
      isOutOfStock: false,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json(products);
  } catch (error) {
    console.error("Get Products By Theme Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// get product by category (from route param)
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const products = await Product.find({
      category: category.toUpperCase(),
      isPublished: true,
      isOutOfStock: false,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json(products);
  } catch (error) {
    console.error("Get Products By Category Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get a single product by slug (public)
exports.getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug, isPublished: true }).lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Filter in-stock variants only
    const availableVariants = product.variants.filter((v) => v.availableQty > 0);

    return res.json({
      ...product,
      variants: availableVariants,
    });
  } catch (error) {
    console.error("Get Product By Slug Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get a single product by ID (public)
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find product by ID
    const product = await Product.findById(id).lean();
    if (!product || !product.isPublished) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Filter out-of-stock variants
    const availableVariants = product.variants.filter((v) => v.availableQty > 0);

    return res.json({
      ...product, //jitni bhi produts ki field hai vo aur variants ko availableVariants se replace krdo
      variants: availableVariants,
    });
  } catch (error) {
    console.error("Get Product By ID Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get featured products (public)
exports.getFeaturedProducts = async (req, res) => {
  try {
    const featured = await Product.find({
      isFeatured: true,
      isPublished: true,
      isOutOfStock: false,
    })
      .select("_id slug title basePrice maxPrice images createdAt")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return res.json(featured);
  } catch (error) {
    console.error("Get Featured Products Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET /products/:id/related
exports.getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch category and tags of the base product
    const baseProduct = await Product.findById(id).select("category tags").lean();

    if (!baseProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Fetch related products: same category or overlapping tags
    const related = await Product.find({
      _id: { $ne: id }, // exclude current product
      isPublished: true,
      isOutOfStock: false,
      $or: [{ category: baseProduct.category }, { tags: { $in: baseProduct.tags } }],
    })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    return res.json(related);
  } catch (err) {
    console.error("getRelatedProducts error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Create a new product (admin)
exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      slug,
      description,
      images,
      category,
      brand,
      theme,
      tags,
      isFeatured,
      isPublished,
      variants, // Expecting an array of variants in request
    } = req.body;

    // Basic validation
    if (!title || !slug || !description || !Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({ message: "Required fields are missing or variants are not valid." });
    }

    // Check for existing slug
    const existing = await Product.exists({ slug });
    if (existing) {
      return res.status(400).json({ message: "Slug must be unique." });
    }

    // Compute basePrice and maxPrice from variants
    const prices = variants.map((v) => v.price);
    const basePrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Determine isOutOfStock
    const totalQty = variants.reduce((acc, v) => acc + (v.availableQty || 0), 0);
    const isOutOfStock = totalQty === 0;

    // Create the product
    const product = await Product.create({
      title,
      slug,
      description,
      images: images || [],
      category,
      brand,
      theme,
      tags: tags || [],
      isFeatured: !!isFeatured,
      isPublished: !!isPublished,
      isOutOfStock,
      basePrice,
      maxPrice,
      variants,
    });

    invalidateProductCache();

    return res.status(201).json({ succes: true, message: "Product created.", product });
  } catch (error) {
    console.error("Create Product Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update a product (admin)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Check for slug uniqueness (excluding the current product)
    if (updates.slug) {
      const existing = await Product.exists({ slug: updates.slug, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ message: "Slug must be unique." });
      }
    }

    // Handle variants update logic
    if (Array.isArray(updates.variants) && updates.variants.length > 0) {
      const prices = updates.variants.map((v) => v.price);
      updates.basePrice = Math.min(...prices);
      updates.maxPrice = Math.max(...prices);

      const totalQty = updates.variants.reduce((sum, v) => sum + (v.availableQty || 0), 0);
      updates.isOutOfStock = totalQty === 0;
    }

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    invalidateProductCache();
    return res.json({ success: true, message: "Product updated.", product });
  } catch (error) {
    console.error("Update Product Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete a product (admin)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id).lean();
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }
    invalidateProductCache();
    return res.json({ message: "Product deleted." });
  } catch (error) {
    console.error("Delete Product Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
