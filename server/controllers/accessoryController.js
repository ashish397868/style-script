const Accessory = require("../models/Accessory");

exports.createAccessory = async (req, res) => {
  try {
    const {
      title,
      slug,
      description,
      basePrice,
      maxPrice,
      images,
      category,
      brand,
      theme,
      tags,
      isFeatured,
      isPublished,
      isOutOfStock,
      targetAudience,
      ageGroup,
      specifications,
      variants
    } = req.body;

    if (!title || !slug || !category || !brand || !theme) {
      return res.status(400).json({
        message: "Title, slug, category, brand, and theme are required"
      });
    }

    const existing = await Accessory.exists({ slug: slug.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Slug already exists" });
    }

    const accessory = new Accessory({
      title,
      slug,
      description,
      basePrice,
      maxPrice,
      images: images || [],
      category,
      brand,
      theme,
      tags: tags || [],
      isFeatured: isFeatured || false,
      isPublished: isPublished || false,
      isOutOfStock: isOutOfStock || false,
      targetAudience: targetAudience || "UNISEX",
      ageGroup: ageGroup || "ADULT",
      specifications: specifications || {},
      variants: variants || []
    });

    const savedAccessory = await accessory.save();

    res.status(201).json({
      success: true,
      message: "Accessory created successfully",
      data: savedAccessory
    });
  } catch (error) {
    console.error("Error creating accessory:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

exports.getAccessoriesByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const products = await Accessory.find({
      category: category.toUpperCase(),
      isPublished: true
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json(products);
  } catch (error) {
    console.error("Get Accessories By Category Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getAccessoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await Accessory.findOne({
      slug: slug.toLowerCase(),
      isPublished: true
    }).lean();

    if (!product) {
      return res.status(404).json({ message: "Accessory not found." });
    }

    const availableVariants = product.variants.filter(
      (v) => v.availableQty > 0
    );

    return res.json({
      ...product,
      variants: availableVariants
    });
  } catch (error) {
    console.error("Get Accessory By Slug Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
