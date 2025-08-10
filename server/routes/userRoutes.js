const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { authenticateUser, isAdmin } = require('../middlewares/authMiddleware');
const{
    handleSignup,
    handleLogin,
    forgotPassword,
    resetPassword,
    updateProfile,
    getAllUsers,
    updateUserRole,
    deleteUser,
    getUser,
    changePassword
}=require('../controllers/userController');

// Stricter rate limit for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // 10 login attempts per windowMs per IP
  standardHeaders: 'draft-7', // newer format for rate limit headers
  message: 'Too many login attempts from this IP, please try again after 15 minutes'
});

/*
Ek IP 15 minutes ke andar sirf 10 requests hi kar sakti hai in routes par:
/signup
/login
/forgot-password
/reset-password
*/

// Public routes
router.post('/signup', authLimiter,  handleSignup);//tested
router.post('/login', authLimiter, handleLogin);//tested
router.post('/forgot-password', authLimiter, forgotPassword);//tested
router.post('/reset-password', authLimiter, resetPassword);//tested

// Protected routes
router.get('/profile', authenticateUser, getUser);
router.patch('/profile', authenticateUser,updateProfile);//tested
router.post('/change-password', authenticateUser, changePassword);

// Admin routes
router.get('/', authenticateUser, isAdmin, getAllUsers);//tested
router.patch('/:id', authenticateUser, isAdmin,updateUserRole);
router.delete('/:id', authenticateUser, isAdmin,deleteUser);

module.exports = router;