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
// controllers/productController.js
const Product = require("../models/Product");

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

    const products = await Product.find(filter).sort({ createdAt: -1 });
    
    // Group products by title to create variants
    const groupedProducts = groupProductsByTitle(products);
    
    return res.json(groupedProducts);
  } catch (error) {
    console.error("Get All Products Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Helper function to group products by title
const groupProductsByTitle = (products) => {
  const grouped = {};
  
  products.forEach(product => {
    const key = product.title;
    if (!grouped[key]) {
      grouped[key] = {
        ...product.toObject(),
        variants: []
      };
    }
    
    // Add this product as a variant
    grouped[key].variants.push(product.toObject());
  });
  
  // Convert to array and process each group
  return Object.values(grouped).map(group => {
    // Filter out variants with 0 quantity
    group.variants = group.variants.filter(variant => variant.availableQty > 0);
    
    // If no variants are available, don't include this product group
    if (group.variants.length === 0) {
      return null;
    }
    
    // Set the main product data to the first available variant
    const firstAvailableVariant = group.variants[0];
    return {
      ...firstAvailableVariant,
      variants: group.variants
    };
  }).filter(Boolean); // Remove null entries
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
exports.getProductVariants = async (req, res) => {
  try {
    const { title } = req.params;
    
    // Find all products with the same title
    const variants = await Product.find({ 
      title: new RegExp(`^${title}$`, 'i') // Case insensitive match
    }).sort({ createdAt: -1 });
    
    if (variants.length === 0) {
      return res.status(404).json({ message: "No variants found for this product." });
    }
    
    // Filter only available variants
    const availableVariants = variants.filter(variant => variant.availableQty > 0);
    
    return res.json({
      title,
      variants: availableVariants,
      totalVariants: variants.length,
      availableVariants: availableVariants.length
    });
  } catch (error) {
    console.error("Get Product Variants Error:", error);
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

// Rest of your existing controller methods remain the same...
// (getProductsByCategory, getProductBySlug, getProductById, getFeaturedProducts, etc.)

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
    const base = await Product.findById(id);
    if (!base) return res.status(404).json({ message: "Product not found" });

    // find others in same category or sharing tags, excluding itself
    const related = await Product.find({
      _id: { $ne: id },
      availableQty: { $gt: 0 }, // Only available products
      $or: [
        { category: base.category },
        { tags: { $in: base.tags } }
      ]
    })
      .limit(8)
      .sort({ createdAt: -1 });

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

// Create multiple products (admin)
exports.createMultipleProducts = async (req, res) => {
  try {
    const products = req.body;

    // Validate input
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Product array is required." });
    }

    // Optional: Validate each product object
    for (const product of products) {
      const { title, slug, description, price, availableQty } = product;
      if (!title || !slug || !description || price == null || availableQty == null) {
        return res.status(400).json({ message: "Each product must have title, slug, description, price, and availableQty." });
      }

      // Ensure slugs are unique
      const existing = await Product.findOne({ slug });
      if (existing) {
        return res.status(400).json({ message: `Slug '${slug}' already exists.` });
      }
    }

    // Insert all products
    const inserted = await Product.insertMany(products);

    return res.status(201).json({ message: "Products created successfully.", products: inserted });
  } catch (error) {
    console.error("Create Multiple Products Error:", error);
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
      runValidators: true,
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