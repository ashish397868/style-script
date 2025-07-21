// controllers/productController.js
const Product = require("../models/Product");
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 60 * 5 }); // 5 mins cache
const { groupProductsByTitle } = require("../helper/productHelper");

let lastProductUpdatedAt = null; // to track if DB has changed

// Get all products with variants grouped by title (public)
exports.getAllProducts = async (req, res) => {
  try {
    const { category, brand, size, color, isFeatured } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (size) filter.size = size;
    if (color) filter.color = color;
    if (isFeatured != null) filter.isFeatured = isFeatured === "true";

    const cacheKey = JSON.stringify(filter);

    const products = await Product.find(filter).sort({ updatedAt: -1 }).lean();

    if (products.length === 0) {
      return res.json([]); // nothing to group or cache
    }

    const latestUpdatedAt = new Date(products[0].updatedAt).getTime();

    if (lastProductUpdatedAt === latestUpdatedAt && cache.has(cacheKey)) {
      console.log("✔ Using cached data");
      return res.json(cache.get(cacheKey));
    }

    const groupedProducts = groupProductsByTitle(products);

    cache.set(cacheKey, groupedProducts);
    lastProductUpdatedAt = latestUpdatedAt;

    console.log("📥 DB Fetched and cache updated");
    return res.json(groupedProducts);
  } catch (error) {
    console.error("Get All Products Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Search products by query string (public)
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.json([]);
    }

    const searchQuery = {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } }
      ]
    };

    const products = await Product.find(searchQuery)
      .limit(20)
      .sort({ isFeatured: -1, updatedAt: -1 })
      .lean();

    if (products.length === 0) {
      return res.json([]);
    }

    const groupedProducts = groupProductsByTitle(products);
    return res.json(groupedProducts);
  } catch (error) {
    console.error("Search Products Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// get product by theme (from route param)
exports.getProductsByTheme = async (req, res) => {
  try {
    const { theme } = req.params;
    const products = await Product.find({ theme: theme }).sort({ createdAt: -1 }).lean();
    const groupedProducts = groupProductsByTitle(products);
    return res.json(groupedProducts);
  } catch (error) {
    console.error("Get Products By Theme Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// get product by category (from route param)
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const products = await Product.find({ category }).sort({ createdAt: -1 }).lean();

    // Group products by title for variants
    const groupedProducts = groupProductsByTitle(products);

    return res.json(groupedProducts);
  } catch (error) {
    console.error("Get Products By Category Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get a single product by slug (public)
exports.getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug }).lean();
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Get all variants of this product
    const variants = await Product.find({
      title: product.title,
      availableQty: { $gt: 0 }, // Only available variants
    }).lean();

    return res.json({
      ...product,
      variants,
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
    const product = await Product.findById(id).lean();
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Get all variants of this product
    const variants = await Product.find({
      title: product.title,
      availableQty: { $gt: 0 }, // Only available variants
    }).lean();

    return res.json({
      ...product,
      variants,
    });
  } catch (error) {
    console.error("Get Product By ID Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get featured products (public)
exports.getFeaturedProducts = async (req, res) => {
  try {
    const featured = await Product.find({ isFeatured: true }).select("_id slug title size price images color availableQty createdAt").sort({ createdAt: -1 }).limit(10).lean();

    // Group featured products by title
    const groupedFeatured = groupProductsByTitle(featured);

    return res.json(groupedFeatured);
  } catch (error) {
    console.error("Get Featured Products Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET /products/:id/related
exports.getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const baseProduct = await Product.findById(id).select("category tags").lean();
    if (!baseProduct) return res.status(404).json({ message: "Product not found" });

    // find others in same category or sharing tags, excluding itself
    const related = await Product.find({
      _id: { $ne: id },
      availableQty: { $gt: 0 }, // Only available products
      $or: [{ category: baseProduct.category }, { tags: { $in: baseProduct.tags } }],
    })
      .limit(8)
      .sort({ createdAt: -1 })
      .lean();

    // Group related products by title
    const groupedRelated = groupProductsByTitle(related);

    res.json(groupedRelated);
  } catch (err) {
    console.error("getRelatedProducts error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new product (admin)
exports.createProduct = async (req, res) => {
  try {
    const { title, slug, description, price, images, category, brand, size, color, tags, availableQty, isFeatured,theme } = req.body;

    // Basic validation
    if (!title || !slug || !description || price == null || availableQty == null) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    // Check for existing slug
    const existing = await Product.exists({ slug });
    if (existing) {
      return res.status(400).json({ message: "Slug must be unique." });
    }

    const product = await Product.create({
      title,
      slug,
      description,
      price,
      images: images || [],
      category,
      brand,
      size,
      color,
      tags: tags || [],
      availableQty,
      isFeatured: !!isFeatured,
      theme
    });

    return res.status(201).json({ message: "Product created.", product });
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

    // check karo ki koi aur product (jiska _id is product ke id se alag hai) already same slug use kar raha hai ya nahi.
    if (updates.slug) {
      const existing = await Product.exists({ slug: updates.slug, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ message: "Slug must be unique." });
      }
    }

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    return res.json({ message: "Product updated.", product });
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
    return res.json({ message: "Product deleted." });
  } catch (error) {
    console.error("Delete Product Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
