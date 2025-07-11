// controllers/productController.js
const Product = require("../models/Product");
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 * 5 }); // 5 mins cache
const {groupProductsByTitle}=require("../helper/productHelper")

let lastProductUpdatedAt = null; // to track if DB has changed

// get product by theme (from route param)
exports.getProductsByTheme = async (req, res) => {
  try {
    const { theme } = req.params;
    // Assuming you store theme as a field in Product, e.g. product.theme or product.themes (array)
    // Adjust the query below if your schema is different
    const products = await Product.find({ themes: theme }).sort({ createdAt: -1 });
    // If you use a single theme field, use: { theme }
    const groupedProducts = groupProductsByTitle(products);
    return res.json(groupedProducts);
  } catch (error) {
    console.error("Get Products By Theme Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

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

    // Key to uniquely cache this filter
    const cacheKey = JSON.stringify(filter);

    // Check latest product update time
    const latestProduct = await Product.findOne().sort({ updatedAt: -1 });
    const latestUpdatedAt = latestProduct?.updatedAt?.getTime() || 0;

    // If data hasn't changed, use cache
    if (
      lastProductUpdatedAt === latestUpdatedAt &&
      cache.has(cacheKey)
    ) {
      console.log("✔ Using cached data");
      return res.json(cache.get(cacheKey));
    }

    // Otherwise, fetch fresh data
    const products = await Product.find(filter).sort({ createdAt: -1 });
    const groupedProducts = groupProductsByTitle(products);

    // Store in cache
    cache.set(cacheKey, groupedProducts);
    lastProductUpdatedAt = latestUpdatedAt;

    console.log("📥 DB Fetched and cache updated");
    return res.json(groupedProducts);
  } catch (error) {
    console.error("Get All Products Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get products with pagination and variant grouping (public)
exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = "createdAt:desc",
      q,
      category,
      brand,
      size,
      color,
    } = req.query;

    const filter = {};
    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (size) filter.size = size;
    if (color) filter.color = color;

    // Parse sort param
    const [field, order] = sort.split(":");
    const sortOrder = { [field]: order === "asc" ? 1 : -1 };

    const products = await Product.find(filter)
      .sort(sortOrder);

    // Group products by title
    const groupedProducts = groupProductsByTitle(products);
    
    // Apply pagination to grouped products
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = groupedProducts.slice(startIndex, endIndex);

    return res.json({
      data: paginatedProducts,
      meta: {
        total: groupedProducts.length,
        page: parseInt(page),
        pages: Math.ceil(groupedProducts.length / limit),
      },
    });
  } catch (err) {
    console.error("getProducts error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get product variants by title (public)
exports.getProductVariantByTitle = async (req, res) => {
  try {
    const { title } = req.params;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const variant = await Product.findOne({
      title: new RegExp(title.trim(), 'i'), // Case-insensitive match
      availableQty: { $gt: 0 }              // Only if in stock
    });

    if (!variant) {
      return res.status(404).json({ message: "No variant available" });
    }

    return res.json(variant);
  } catch (error) {
    console.error("Get Variant By Title Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get specific variant by title, size, and color
exports.getSpecificVariant = async (req, res) => {
  try {
    const { title, size, color } = req.query;
    
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    
    const filter = { 
      title: new RegExp(`^${title}$`, 'i'),
      availableQty: { $gt: 0 } // Only available variants
    };
    
    if (size) filter.size = new RegExp(`^${size}$`, 'i');
    if (color) filter.color = new RegExp(`^${color}$`, 'i');
    
    const variant = await Product.findOne(filter);
    
    if (!variant) {
      return res.status(404).json({ message: "Variant not available" });
    }
    
    return res.json(variant);
  } catch (error) {
    console.error("Get Specific Variant Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// get product by category (from route param)
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const products = await Product.find({ category }).sort({ createdAt: -1 });
    
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
    const product = await Product.findOne({ slug });
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }
    
    // Get all variants of this product
    const variants = await Product.find({ 
      title: product.title,
      availableQty: { $gt: 0 } // Only available variants
    });
    
    return res.json({
      ...product.toObject(),
      variants
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
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }
    
    // Get all variants of this product
    const variants = await Product.find({ 
      title: product.title,
      availableQty: { $gt: 0 } // Only available variants
    });
    
    return res.json({
      ...product.toObject(),
      variants
    });
  } catch (error) {
    console.error("Get Product By ID Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get featured products (public)
exports.getFeaturedProducts = async (req, res) => {
  try {
    const featured = await Product.find({ isFeatured: true }).sort({ createdAt: -1 }).limit(10);
    
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
      $or: [
        { category: baseProduct.category },
        { tags: { $in: baseProduct.tags } }
      ]
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
    const { title, slug, description, price, images, category, brand, size, color, tags, availableQty, isFeatured } = req.body;

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