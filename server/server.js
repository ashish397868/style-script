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
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');

app.use(compression()); // Enable compression for all responses

// Use Helmet for security headers
app.use(helmet());

// Configure content security policy
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "checkout.razorpay.com"],
    styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
    imgSrc: ["'self'", "data:", "res.cloudinary.com","https://codeswear.nyc3.cdn.digitaloceanspaces.com"],
    connectSrc: ["'self'", "checkout.razorpay.com"],
    frameSrc: ["'self'", "checkout.razorpay.com"],
    objectSrc: ["'none'"]
  }
}));

// Configure rate limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // 100 requests per windowMs per IP
  standardHeaders: 'draft-7',
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Rate limiter for sensitive operations
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 30, // 30 requests per windowMs per IP
  standardHeaders: 'draft-7',
  message: 'Too many requests for this operation, please try again after 10 minutes'
});

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Allow both React and Vite URLs
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Apply global rate limiter to all requests
app.use(globalLimiter);

database();

// Apply rate limiters to specific routes instead of applying to all user routes
app.use("/api/", userRoutes); 
app.use("/api/users/", addressRoutes);
app.use("/api/", pincodeRoutes);
app.use("/api/products/", productRoutes);
app.use("/api/media/", mediaRoutes);

// Apply stricter rate limits to reviews payment and order operations
app.use("/api/reviews/", apiLimiter, reviewRoutes);
app.use("/api/orders/", apiLimiter, orderRoutes);
app.use("/api/payments", apiLimiter, paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});