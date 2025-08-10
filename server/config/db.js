const mongoose = require("mongoose");

// MongoDB se connect hone wala function
const connectDB = async () => {
  try {
    // Connection try karo MONGO_URI se
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,              // max 10 connections at a time
      serverSelectionTimeoutMS: 5000,  // 5 sec tak server dhoondo
      socketTimeoutMS: 30000,          // 30 sec tak wait karo agar kuch response nahi aaya
      connectTimeoutMS: 30000,         // 30 sec tak try karo connect hone ke liye
    });

    // Confirm karo ki server alive hai
    await mongoose.connection.db.admin().ping();
    console.log("MongoDB ready 🚀"); // success message
  } catch (error) {
    // Agar error aaye to usko print karo
    console.error("MongoDB connection error:", error);
    process.exit(1); // App ko band kar do
  }
};

// Function export karo taaki dusri file mein use ho sake
module.exports = connectDB;