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
    deleteUser,
    getUser
}=require('../controllers/userController');

// Public routes
router.post('/signup', handleSignup);//tested
router.post('/login',handleLogin);//tested
router.post('/forgot-password',forgotPassword);//tested
router.post('/reset-password',resetPassword);//tested

// Protected routes
router.get('/users/profile', authenticateUser, getUser);
router.patch('/users/profile', authenticateUser,updateProfile);//tested

// Admin routes
router.get('/users', authenticateUser, isAdmin, getAllUsers);//tested
router.patch('/users/:id', authenticateUser, isAdmin,updateUserRole);
router.delete('/users/:id', authenticateUser, isAdmin,deleteUser);

module.exports = router;