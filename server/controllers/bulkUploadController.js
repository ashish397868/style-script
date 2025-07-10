// controllers/bulkUploadController.js
const fs = require("fs");
const csv = require("csv-parser");
const Product = require("../models/Product");

exports.importCSV = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const results = [];
    
    // Read CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (data) => {
        // Only add if required fields exist
        if (data.title && data.slug && data.price && data.description && data.availableQty )  {
          results.push(data);
        }
      })
      .on("end", async () => {
        try {
          // Transform data
          const products = results.map((row) => ({
            title: row.title,
            slug: row.slug,
            description: row.description || '',
            price: parseFloat(row.price) || 0,
            images: row.images ? row.images.split(";") : [],
            category: row.category || '',
            brand: row.brand || '',
            size: row.size || '',
            color: row.color || '',
            tags: row.tags ? row.tags.split(";") : [],
            availableQty: parseInt(row.availableQty) || 0,
            isFeatured: row.isFeatured === "true",
          }));

          // Save to database
          await Product.insertMany(products);
          
          // Delete uploaded file
          fs.unlinkSync(req.file.path);
          
          // Send success response
          res.json({ 
            message: "Import successful", 
            count: products.length 
          });
          
        } catch (err) {
          console.error("Database error:", err);
          res.status(500).json({ message: "Failed to save products" });
        }
      })
      .on("error", (err) => {
        console.error("CSV reading error:", err);
        res.status(500).json({ message: "Failed to read CSV file" });
      });
      
  } catch (err) {
    console.error("Import error:", err);
    res.status(500).json({ message: "Import failed" });
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

    // Collect all slugs and validate products
    const slugs = [];
    const errors = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const { title, slug, description, price, availableQty } = product;
      
      // Validate required fields
      if (!title || !slug || !description || price == null || availableQty == null) {
        errors.push(`Product at index ${i}: Missing required fields`);
        continue;
      }

      slugs.push(slug);
    }

    // Return validation errors if any
    if (errors.length > 0) {
      return res.status(400).json({ 
        message: "Validation errors found", 
        errors: errors 
      });
    }

    // Check for duplicate slugs in input
    const duplicateSlug = slugs.find((slug, index) => slugs.indexOf(slug) !== index);
    if (duplicateSlug) {
      return res.status(400).json({ 
        message: `Duplicate slug in input: '${duplicateSlug}'` 
      });
    }

    // OPTIMIZED: Single database call to check all slugs
    const existingSlugs = await Product.find({ slug: { $in: slugs } }, { slug: 1 }).lean();
    
    if (existingSlugs.length > 0) {
      const conflictingSlugs = existingSlugs.map(doc => doc.slug);
      return res.status(400).json({ 
        message: `Following slugs already exist: ${conflictingSlugs.join(', ')}` 
      });
    }

    // Insert all products
    const inserted = await Product.insertMany(products, { ordered: false });

    return res.status(201).json({ 
      message: "Products created successfully.", 
      count: inserted.length,
      products: inserted 
    });

  } catch (error) {
    console.error("Create Multiple Products Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

