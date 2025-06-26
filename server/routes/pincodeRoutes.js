// server/routes/pincodeRoutes.js
const express = require("express");
const router = express.Router();
const { getPincode } = require("../controllers/pincodeController");

router.get("/get-pincode", getPincode);

module.exports = router;
