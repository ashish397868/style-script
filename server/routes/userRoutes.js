const express = require('express');
const router = express.Router();
const { authenticateUser, isAdmin } = require('../middlewares/authMiddleware');
const{
    handleSignup,
    handleLogin,
    forgotPassword,
    resetPassword,
    updateProfile,
    getAllUsers,
    updateUserRole,
    deleteUser
}=require('../controllers/userController');

// Public routes
router.post('/api/signup', handleSignup);//tested
router.post('/api/login',handleLogin);//tested
router.post('/api/forgot-password',forgotPassword);//tested
router.post('/api/reset-password',resetPassword);//tested

// Protected routes
router.patch('/api/users/profile', authenticateUser,updateProfile);//tested

// Admin routes
router.get('/api/users', authenticateUser, isAdmin, getAllUsers);//tested
router.patch('/api/users/:id', authenticateUser, isAdmin,updateUserRole);
router.delete('/api/users/:id', authenticateUser, isAdmin,deleteUser);

module.exports = router;