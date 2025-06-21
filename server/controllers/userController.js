const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

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
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ message: "Invalid email format!" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    // send welcome email
    sendEmail({
      to: email,
      subject: "👗 Welcome to ScriptStyle – Your Wardrobe Just Got an Upgrade!",
      html: `
  <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; background: #fff; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #6b21a8, #9333ea); padding: 20px 30px; color: #fff;">
      <h1 style="margin: 0;">Welcome, ${name}!</h1>
      <p style="margin: 5px 0 0;">Thanks for joining <strong>ScriptStyle</strong> – Where fashion meets comfort!</p>
    </div>

    <div style="padding: 30px;">
      <p style="font-size: 16px; color: #444;">
        We're excited to have you on board. Whether you're upgrading your everyday look or shopping for a special occasion, we’ve got styles that speak your language.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://scriptstyle.com/shop" style="background: #6b21a8; color: white; padding: 14px 24px; border-radius: 8px; text-decoration: none; font-size: 16px;">
          🛍️ Start Shopping Now
        </a>
      </div>

      <p style="font-size: 15px; color: #555;">
        Need help or have questions? Our team is just a message away. Feel free to reply to this email or visit our support center.
      </p>

      <p style="font-size: 15px; color: #555;">Happy styling,<br><strong>The ScriptStyle Team</strong></p>
    </div>

    <div style="background: #f3f4f6; padding: 15px 30px; text-align: center; font-size: 13px; color: #777;">
      You’re receiving this email because you signed up at ScriptStyle.<br>
      <a href="https://scriptstyle.com/unsubscribe" style="color: #6b21a8; text-decoration: none;">Unsubscribe</a>
    </div>
  </div>
  `,
    });

    // Generate JWT token
    const token = jwt.sign({ userid: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.status(201).json({
      message: "Signup successful!",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
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

    const user = await User.findOne({ email });
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
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
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
    const { name, email, phone, addressLine1, addressLine2, city, state, pincode, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // email validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Invalid email format" });

    // phone validation (optional)
    if (phone && !/^\+?[\d\s-]{10,}$/.test(phone)) return res.status(400).json({ message: "Invalid phone number format" });

    // password change
    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: "Current password is required" });

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

      if (newPassword.length < 8) return res.status(400).json({ message: "New password must be at least 8 characters long" });

      user.password = newPassword;
    }

    // apply updates
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    // nested address
    user.address.addressLine1 = addressLine1 ?? user.address.addressLine1;
    user.address.addressLine2 = addressLine2 ?? user.address.addressLine2;
    user.address.city = city ?? user.address.city;
    user.address.state = state ?? user.address.state;
    user.address.pincode = pincode ?? user.address.pincode;

    await user.save();

    // issue refreshed token
    const token = jwt.sign({ userid: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    return res.json({
      message: "Profile updated successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        active: user.active,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET all users (admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.json(users);
  } catch (error) {
    console.error("Get All Users Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET single user (self)
const getUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (error) {
    console.error("Get User Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// UPDATE user role (admin)
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { makeAdmin } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (typeof makeAdmin === "boolean") {
      user.role = makeAdmin ? "admin" : "user";
      await user.save();
      return res.json({ message: "User updated successfully", user });
    }

    return res.status(400).json({ message: "Invalid update data" });
  } catch (error) {
    console.error("Update User Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// DELETE (admin)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await User.findByIdAndDelete(id);
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

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No account found with this email!" });

    // Generate reset token
    const token = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15m
    await user.save();

    // send mail token
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${email}`;
    const emailContent = `
      <h2>Reset Your Password</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Token :-  ${token} </p>
      <p>This link will expire in 15 minutes.</p>
    `;
    await sendEmail({
      to: email,
      subject: "Password Reset Request",
      html: emailContent,
    });

    return res.json({
      message: "Password reset token sent to email",
      ...(process.env.NODE_ENV === "development" && { token }),
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    console.log("Reset Password Data:", { email, token, newPassword });
    console.log("Reset Password Body:", req.body);
    if (!email || !token || !newPassword) return res.status(400).json({ message: "All fields are required!" });

    if (newPassword.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters long" });

    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired password reset token" });

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
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
  getUser, // <-- export the new controller
};
