const User = require('../models/User');
const validator = require("validator");
const safeUserSelect = '-password -resetPasswordToken -resetPasswordExpires -createdAt -updatedAt';

// Add a new address
exports.addAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      name,
      phone,
      country = 'India',
      addressLine1,
      addressLine2 = '',
      city,
      state,
      pincode,
    } = req.body;

    if(!name || !phone || !addressLine1 || !city || !state || !pincode){
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!validator.isMobilePhone(phone, 'any')) {
      return res.status(400).json({ message: "Phone number is not valid" });
    }

    if (!validator.isPostalCode(pincode, 'IN')) {
      return res.status(400).json({ message: "Pincode is not valid" });
    }

// Construct address object
    const newAddress = {
      name,
      phone,
      country,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode
    };

    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { addresses: newAddress } },
      { new: true, select: safeUserSelect, lean: true }
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

     if (phone && !validator.isMobilePhone(phone, 'any')) {
      return res.status(400).json({ message: 'Phone number is not valid' });
    }

    if (pincode && !validator.isPostalCode(pincode, 'IN')) {
      return res.status(400).json({ message: 'Pincode is not valid' });
    }

    // construct updates Object
    const updates = {};
    //MongoDB ke positional operator $ ka matlab hota hai: , Update karo addresses array ke usi element ko jo query mein match hua ho. agr end na lgaye to Toh MongoDB poore array ke sabhi addresses ke name field ko "New Office" bana deta — which is not what you want.

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
      { new: true, select: safeUserSelect, lean: true }
    );

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided to update' });
    }

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
      { new: true, select: safeUserSelect, lean: true }
    );

    if (!user) return res.status(404).json({ message: 'Address not found' });
    
    res.json({ message: 'Address deleted', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


/* 
  🔍 Explanation of "addresses.$.field" in MongoDB:

  Suppose we have a user document like:

  {
    _id: "user123",
    name: "Ashish",
    addresses: [
      {
        _id: "addr1",
        name: "Home",
        city: "Yamunanagar"
      },
      {
        _id: "addr2",
        name: "Office",
        city: "Delhi"
      }
    ]
  }

  ✅ Goal:
  We want to update the name of the address with _id = "addr2" to "New Office".

  ❌ Wrong way (without $):
  await User.updateOne(
    { _id: "user123", "addresses._id": "addr2" },
    { $set: { "addresses.name": "New Office" } }
  );
  // ⛔ This will update the 'name' field in **all** address objects in the array.

  ✅ Correct way (with $ positional operator):
  await User.updateOne(
    { _id: "user123", "addresses._id": "addr2" },
    { $set: { "addresses.$.name": "New Office" } }
  );
  // ✔ This will only update the address whose _id is "addr2" — others remain unchanged.

  👉 So, the "$" in "addresses.$.name" ensures:
     - You only update the address object that matched the condition in the query.
     - It prevents unintentional updates to the whole array.
*/
