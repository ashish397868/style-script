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
  standardHeaders: 'draft-7',
  message: 'Too many login attempts from this IP, please try again after 15 minutes'
});

// Public routes
router.post('/signup', authLimiter,  handleSignup);//tested
router.post('/login', authLimiter, handleLogin);//tested
router.post('/forgot-password', authLimiter, forgotPassword);//tested
router.post('/reset-password', authLimiter, resetPassword);//tested

// Protected routes
router.get('/users/profile', authenticateUser, getUser);
router.patch('/users/profile', authenticateUser,updateProfile);//tested
router.post('/users/change-password', authenticateUser, changePassword);

// Admin routes
router.get('/users', authenticateUser, isAdmin, getAllUsers);//tested
router.patch('/users/:id', authenticateUser, isAdmin,updateUserRole);
router.delete('/users/:id', authenticateUser, isAdmin,deleteUser);

module.exports = router;