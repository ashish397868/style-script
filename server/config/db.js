const mongoose = require("mongoose");
require("dotenv").config(); // Load .env variables
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  }
};
module.exports = connectDB;