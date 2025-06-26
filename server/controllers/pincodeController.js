// server/controllers/pincodeController.js
const pincodes = {
  "135001": ["yamunanagar", "haryana"],
  "110003": ["delhi", "delhi"],
  "160001": ["chandigarh", "chandigarh"]
};

exports.getPincode = (req, res) => {
  res.json(pincodes);
};
