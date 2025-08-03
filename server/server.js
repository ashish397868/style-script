const express = require("express");
const app = express();
require("dotenv").config();

// Import configurations
const database = require("./config/db");
const { applyMiddleware, apiLimiter } = require("./middleware");

// Import routes
const userRoutes = require("./routes/userRoutes");
const addressRoutes = require("./routes/addressRoutes");
const productRoutes = require("./routes/productRoutes");
const bulkRoutes = require("./routes/bulkRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const pincodeRoutes = require("./routes/pincodeRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// Apply middleware
applyMiddleware(app);

// Connect to database
database();

// Public routes (with global rate limiting only)
app.use("/api/users/", userRoutes);
app.use("/api/users/", addressRoutes);
app.use("/api/", pincodeRoutes);
app.use("/api/products/", productRoutes);
app.use("/api/products/bulk", bulkRoutes);
app.use("/api/media/", mediaRoutes);

// Sensitive routes (with stricter rate limiting)
app.use("/api/reviews/", apiLimiter, reviewRoutes);
app.use("/api/orders/", apiLimiter, orderRoutes);
app.use("/api/payments", apiLimiter, paymentRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

/**
  Agar aap '127.0.0.1' (localhost) likhoge, to sirf local machine se access milega.
  Lekin '0.0.0.0' likhne se aapka server network ke kisi bhi IP address se access ho sakta hai — LAN, Wi-Fi, etc.
 */
