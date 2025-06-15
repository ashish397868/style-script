const express = require("express");
const app = express();
require("dotenv").config(); // Load .env variables
const database = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000', // your React app URL
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

database();

app.use("/api/", userRoutes);
app.use("/api/products/", productRoutes);
app.use("/api/media/", mediaRoutes);
app.use("/api/reviews/", reviewRoutes);
app.use("/api/orders/", orderRoutes);
app.use("/api/payments", paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
