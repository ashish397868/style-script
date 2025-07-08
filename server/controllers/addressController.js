const User = require('../models/User');

// Add a new address
exports.addAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const addr = {
      name:         req.body.name         || '',
      phone:        req.body.phone        || '',
      country:      req.body.country      || 'India',
      addressLine1: req.body.addressLine1 || '',
      addressLine2: req.body.addressLine2 || '',
      city:         req.body.city         || '',
      state:        req.body.state        || '',
      pincode:      req.body.pincode      || ''
    };

    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { addresses: addr } },
      { new: true, select: '-password -resetPasswordToken -resetPasswordExpires -createdAt -updatedAt', lean: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Address added', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update one address
exports.updateAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { addrId } = req.params;
    const { name, phone, country, addressLine1, addressLine2, city, state, pincode } = req.body;
    const updates = {};
    if (name)         updates['addresses.$.name']         = name;
    if (phone)        updates['addresses.$.phone']        = phone;
    if (country)      updates['addresses.$.country']      = country;
    if (addressLine1) updates['addresses.$.addressLine1'] = addressLine1;
    if (addressLine2) updates['addresses.$.addressLine2'] = addressLine2;
    if (city)         updates['addresses.$.city']         = city;
    if (state)        updates['addresses.$.state']        = state;
    if (pincode)      updates['addresses.$.pincode']      = pincode;

    const user = await User.findOneAndUpdate(
      { _id: userId, 'addresses._id': addrId },
      { $set: updates },
      { new: true, select: '-password -resetPasswordToken -resetPasswordExpires -createdAt -updatedAt', lean: true }
    );

    if (!user) return res.status(404).json({ message: 'Address not found' });
    res.json({ message: 'Address updated', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//  Delete one address
exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { addrId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { addresses: { _id: addrId } } },
      { new: true, select: '-password', lean: true }
    );

    if (!user) return res.status(404).json({ message: 'Address not found' });
    res.json({ message: 'Address deleted', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};