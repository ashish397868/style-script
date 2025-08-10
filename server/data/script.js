require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const Product = require("../models/Product");
const { ObjectId } = mongoose.Types;

async function generateVariantIds() {
  try {
    // MongoDB se connect karo
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected successfully");
    
    // Sabhi products lao jo variants wale hain lekin unme _id nahi hai
    const products = await Product.find({
      "variants.0": { $exists: true }, // At least 1 variant exists
      "variants._id": { $exists: false } // But _id doesn't exist
    });
    
    console.log(`🔍 Found ${products.length} products with variants needing _id`);
    
    if (products.length === 0) {
      console.log("🎉 All variants already have _id! No updates needed.");
      return;
    }
    
    let totalProductsUpdated = 0;
    let totalVariantsUpdated = 0;
    
    // Har product ko process karo
    for (const product of products) {
      console.log(`\n📦 Processing: "${product.title}"`);
      console.log(`   Variants found: ${product.variants.length}`);
      
      let variantCount = 0;
      
      // Har variant me _id add karo
      product.variants = product.variants.map((variant, index) => {
        // Naya ObjectId generate karo
        variant._id = new ObjectId();
        variantCount++;
        
        console.log(`   ✅ Added _id to variant ${index + 1}: ${variant.size}-${variant.color} (${variant._id})`);
        
        return variant;
      });
      
      // Product ko save karo
      await product.save();
      totalProductsUpdated++;
      totalVariantsUpdated += variantCount;
      
      console.log(`   💾 Saved "${product.title}" with ${variantCount} updated variants`);
    }
    
    // Final verification - check if koi product bach gaya hai
    const remainingProducts = await Product.countDocuments({
      "variants.0": { $exists: true },
      "variants._id": { $exists: false }
    });
    
    console.log("\n" + "=".repeat(50));
    console.log("📊 MIGRATION SUMMARY");
    console.log("=".repeat(50));
    console.log(`✅ Products updated: ${totalProductsUpdated}`);
    console.log(`✅ Total variants updated: ${totalVariantsUpdated}`);
    console.log(`✅ Products still needing updates: ${remainingProducts}`);
    
    if (remainingProducts === 0) {
      console.log("\n🎉 SUCCESS! All variants now have proper _id fields!");
      console.log("🚀 Your API will now work perfectly with variant IDs!");
    } else {
      console.log(`\n⚠️ WARNING: ${remainingProducts} products still need updates.`);
      console.log("🔄 Consider running this script again.");
    }
    
  } catch (error) {
    console.error("\n❌ ERROR occurred during migration:");
    console.error(error);
    console.log("\n💡 Make sure:");
    console.log("   - MongoDB is running");
    console.log("   - .env file has correct MONGO_URI");
    console.log("   - Product model path is correct");
  } finally {
    // Hamesha disconnect karo
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

// Script chalao
console.log("🚀 Starting Automatic Variant ID Generation...");
console.log("📅 " + new Date().toLocaleString());
console.log("-".repeat(50));

generateVariantIds();