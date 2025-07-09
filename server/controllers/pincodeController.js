// server/controllers/pincodeController.js
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 * 60*24 }); // 1 day
const fs = require("fs");
const path = require("path");

exports.getPincode = (req, res) => {
  const cacheKey = "all-pincodes";
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  const dataPath = path.join(__dirname, "../data/pincodes.json");
  const raw = fs.readFileSync(dataPath);
  const pincodes = JSON.parse(raw);

  cache.set(cacheKey, pincodes);
  return res.json(pincodes);
};