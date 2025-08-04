// server/controllers/pincodeController.js
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 60 * 60 * 24 }); // 1 day
const fs = require("fs");
const path = require("path");

exports.getPincode = (req, res) => {
  try {
    const cacheKey = "all-pincodes";
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const dataPath = path.join(__dirname, "../data/pincodes.json");

    // read and parse
    const raw = fs.readFileSync(dataPath,'utf-8'); //utf-8 ensures you get text as string
    const pincodes = JSON.parse(raw);

    // Store in cache
    cache.set(cacheKey, pincodes);
    return res.json(pincodes);
  } catch (err) {
    console.error("Failed to load pincodes:", err.message);
    return res.status(500).json({ message: "Failed to load pincode data" });
  }
};
