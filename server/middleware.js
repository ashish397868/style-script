const rateLimit = require('express-rate-limit');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

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

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://192.168.1.6:3000',  // Home Wifi
    'http://192.168.1.6:5173',  // College wifi
    'http://192.168.2.25:5173',
    'http://192.168.2.25:3000',  // Add your IP for React
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Helmet CSP configuration
const cspOptions = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "checkout.razorpay.com"],
    styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
    imgSrc: ["'self'", "data:", "res.cloudinary.com", "https://codeswear.nyc3.cdn.digitaloceanspaces.com"],
    connectSrc: ["'self'", "checkout.razorpay.com"],
    frameSrc: ["'self'", "checkout.razorpay.com"],
    objectSrc: ["'none'"]
  }
};

// Function to apply all middleware
const applyMiddleware = (app) => {
  // Basic middleware
  app.use(cookieParser());
  app.use(compression());
  app.use(helmet());
  app.use(helmet.contentSecurityPolicy(cspOptions));
  
  // CORS
  app.use(cors(corsOptions));
  
  // Body parsing
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  
  // Global rate limiting
  app.use(globalLimiter);
};

module.exports = {
  applyMiddleware,
  apiLimiter,
  globalLimiter
};