// controllers/productController.js
const Product = require("../models/Product");

// Get all products, with optional filters (public)
exports.getAllProducts = async (req, res) => {
  try {
    const { category, brand, size, color, isFeatured } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (size) filter.size = size;
    if (color) filter.color = color;
    if (isFeatured != null) filter.isFeatured = isFeatured === "true";

    const products = await Product.find(filter).sort({ createdAt: -1 });// Sort by creation date, newest first
    return res.json(products);
  } catch (error) {
    console.error("Get All Products Error:", error);
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
    return res.json(product);
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
    return res.json(product);
  } catch (error) {
    console.error("Get Product By ID Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get featured products (public)
exports.getFeaturedProducts = async (req, res) => {
  try {
    const featured = await Product.find({ isFeatured: true }).sort({ createdAt: -1 }).limit(10);
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
    const base = await Product.findById(id);
    if (!base) return res.status(404).json({ message: "Product not found" });

    // find others in same category or sharing tags, excluding itself
    const related = await Product.find({
      _id: { $ne: id },
      $or: [
        { category: base.category },
        { tags: { $in: base.tags } }
      ]
    })
      .limit(8)
      .sort({ createdAt: -1 });

    res.json(related);
  } catch (err) {
    console.error("getRelatedProducts error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get products with pagination, sorting, and filtering (public)
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
    if (q) filter.$text = { $search: q }; // Requires MongoDB text index on `title` and/or `description`
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (size) filter.size = size;
    if (color) filter.color = color;

    // Parse sort param
    const [field, order] = sort.split(":");
    const sortOrder = { [field]: order === "asc" ? 1 : -1 };

    const products = await Product.find(filter)
      .sort(sortOrder)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    return res.json({
      data: products,
      meta: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("getProducts error:", err);
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
    const existing = await Product.findOne({ slug });
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

    // If updating slug, it must be unique
    if (updates.slug) {
      const existing = await Product.findOne({ slug: updates.slug, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ message: "Slug must be unique." });
      }
    }

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,// means:- to ensure validation on update
    });

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
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }
    return res.json({ message: "Product deleted." });
  } catch (error) {
    console.error("Delete Product Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

