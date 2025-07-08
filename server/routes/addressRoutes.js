const express = require('express');
const { addAddress, updateAddress, deleteAddress } = require('../controllers/addressController');
const { authenticateUser } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/me/addresses', authenticateUser, addAddress);
router.patch('/me/addresses/:addrId', authenticateUser, updateAddress);
router.delete('/me/addresses/:addrId', authenticateUser, deleteAddress);

module.exports = router;