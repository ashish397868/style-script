const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const validator = require("validator");
const sendEmail = require("../utils/sendEmail");
const { welcomeEmailTemplate } = require("../utils/emailTemplates/welcomeEmailTemplate");
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 * 30 }); // 30 min cache

const handleSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate field lengths
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long!" });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format!" });
    }

    const userExists = await User.exists({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    // send welcome email
    setImmediate(() => {
      sendEmail({
        to: email,
        subject: "👗 Welcome!",
        html: welcomeEmailTemplate(name),
      }).catch(console.error);
    });

    // Generate JWT token
    const token = jwt.sign({ userid: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.status(201).json({
      message: "Signup successful!",
      token,
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required!" });
    }

    const user = await User.findOne({ email }).select("name email password role phone addresses active").lean();

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials!" });
    }

    if (!user.active) {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    const token = jwt.sign({ userid: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.status(200).json({
      message: "Login successful!",
      token,
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        addresses: user.addresses,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// UPDATE user profile (self)
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email, phone } = req.body;

    if (email && !validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (phone && !validator.isMobilePhone(phone, "any")) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }

    const hasUpdates = Boolean(name) || Boolean(email) || Boolean(phone);

    if (!hasUpdates) {
      const current = await User.findById(userId).select("-password -resetPasswordToken -resetPasswordExpires -createdAt -updatedAt").lean();
      return res.json({
        message: "No changes to update",
        user: current,
      });
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (phone) updateFields.phone = phone;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      {
        new: true,
        select: "-password -resetPasswordToken -resetPasswordExpires -createdAt -updatedAt",
        lean: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // cache.del(`user-${userId}`);

    return res.json({
      message: "Profile updated successfully",
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET single user (self)
const getUser = async (req, res) => {
  try {
    const userId = req.user._id;

    // const cacheKey = `user-${userId}`;
    // const cached = cache.get(cacheKey);
    // if (cached) {
    //   return res.json(cached);
    // }

    const user = await User.findById(userId).select("-password -resetPasswordToken -resetPasswordExpires -createdAt -updatedAt").lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    // cache.set(cacheKey, user);
    return res.json(user);
  } catch (error) {
    console.error("Get User Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET all users (admin)
const getAllUsers = async (req, res) => {
  try {
    // const cacheKey = "all-users";
    // const cached = cache.get(cacheKey);
    // if (cached) return res.json(cached);

    const users = await User.find().select("_id name phone role active createdAt updatedAt").lean();
    // cache.set(cacheKey, users);
    return res.json(users);
  } catch (error) {
    console.error("Get All Users Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// UPDATE user role (admin)
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { makeAdmin } = req.body;

    // Validate input
    if (typeof makeAdmin !== "boolean") {
      return res.status(400).json({ message: "Invalid update data" });
    }

    const newRole = makeAdmin ? "admin" : "user";

    // Find and update in one operation
    const user = await User.findByIdAndUpdate(
      id,
      { role: newRole },
      {
        new: true, // Return updated document
        select: "_id name email role", // Only select needed fields
      }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // cache.del(`all-users`);
    // cache.del(`user-${id}`); // Clear cache for updated user
    
    return res.json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update User Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// DELETE (admin)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

  // cache.del(`all-users`);
  // cache.del(`user-${id}`);
    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required!" });

    // Generate 6 digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

    const user = await User.findOneAndUpdate(
      { email },
      {
        resetPasswordToken: resetCode,
        resetPasswordExpires: resetExpires,
      },
      { new: true, select: "_id email" }
    );

    if (!user) {
      return res.status(404).json({ message: "No account found with this email!" });
    }

    await sendEmail({
      to: email,
      subject: "Password Reset Request",
      html: `<p>Your password reset code is: <strong>${resetCode}</strong></p>
             <p>This code will expire in 15 minutes.</p>`,
    });

    const userId = user._id.toString();
    // cache.del(`user-${userId}`);
    return res.json({
      success: true,
      message: "Password reset code sent to email",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: "All fields are required!" });

    if (newPassword.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters long" });

    const user = await User.findOne({
      email,
      resetPasswordToken: otp,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("resetPasswordToken resetPasswordExpires");

    if (!user) return res.status(400).json({ message: "Invalid or expired password reset token" });

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
      // cache.del(`all-users`);
      // const userId = user._id.toString();
      // cache.del(`user-${userId}`);
    return res.json({ success: true, message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// CHANGE PASSWORD
const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters long" });
    }

    const user = await User.findById(userId).select("password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    return res.json({ 
      success: true, 
      message: "Password changed successfully" 
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  handleSignup,
  handleLogin,
  updateProfile,
  forgotPassword,
  resetPassword,
  updateUserRole,
  getAllUsers,
  deleteUser,
  getUser,
  changePassword,
};