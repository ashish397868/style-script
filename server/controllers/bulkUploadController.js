// controllers/bulkUploadController.js
const fs = require("fs");
const csv = require("csv-parser");
const Product = require("../models/Product");

exports.importCSV = async (req, res) => {
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      try {
        // results is array of objects: { title, slug, description, price, ... }
        const toInsert = results.map((row) => ({
          title:       row.title,
          slug:        row.slug,
          description: row.description,
          price:       parseFloat(row.price),
          images:      row.images ? row.images.split(";") : [],
          category:    row.category,
          brand:       row.brand,
          size:        row.size,
          color:       row.color,
          tags:        row.tags ? row.tags.split(";") : [],
          availableQty: parseInt(row.availableQty, 10),
          isFeatured:  row.isFeatured === "true",
        }));
        await Product.insertMany(toInsert);
        fs.unlinkSync(req.file.path);
        res.json({ message: "Import successful", count: toInsert.length });
      } catch (err) {
        console.error("importCSV error:", err);
        res.status(500).json({ message: "Import failed" });
      }
    });
};
