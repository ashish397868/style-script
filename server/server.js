const express = require("express");
const app = express();
require("dotenv").config(); // Load .env variables
const database = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const addressRoutes = require("./routes/addressRoutes");
const productRoutes = require("./routes/productRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const pincodeRoutes = require("./routes/pincodeRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Allow both React and Vite URLs
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

database();

app.use("/api/", userRoutes);
app.use("/api/users/", addressRoutes);
app.use("/api/", pincodeRoutes);
app.use("/api/products/", productRoutes);
app.use("/api/media/", mediaRoutes);
app.use("/api/reviews/", reviewRoutes);
app.use("/api/orders/", orderRoutes);
app.use("/api/payments", paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
