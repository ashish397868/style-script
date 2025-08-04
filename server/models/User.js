const bcrypt = require("bcrypt");
const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true }, //trim " aaa " -> "aaa" trim starting aur ending ke spaces remove krdeta hai
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    /*
    unique: true automatically creates a unique index, which also serves the purpose of indexing.
    Shortcut inside schema definition to create index index: true
     */

    password: { type: String, required: true, select: false },
    
    /* 
    Whenever you use Mongoose's .find() or .findOne() — it won’t return password by default. Ye security ke liye hota hai. agr password chaiye to aise likhna pdega 
    const user = await User.findOne({ email: "test@gmail.com" }).select('+password');
    */

    phone: { type: String, trim: true, index: true },
    addresses: [
      {
        name: { type: String, default: "", trim: true },
        phone: { type: String, default: "", trim: true },
        country: { type: String, default: "India", trim: true },
        addressLine1: { type: String, default: "", trim: true },
        addressLine2: { type: String, default: "", trim: true },
        city: { type: String, default: "", trim: true },
        state: { type: String, default: "", trim: true },
        pincode: { type: String, default: "", trim: true },
      },
    ],
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    // active: {
    //   type: Boolean,
    //   default: true,
    // }, //currently not using this
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

// Middleware to hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 8);
  next();
});

// function to compare password , Jab kisi specific document ka data process karna ho to use methods
UserSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = model("User", UserSchema);
